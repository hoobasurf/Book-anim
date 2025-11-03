// script.js (module)
const video = document.getElementById('video');
const startCamBtn = document.getElementById('startCam');
const captureBtn = document.getElementById('captureBtn');
const animateBtn = document.getElementById('animateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const processedCanvas = document.getElementById('processedCanvas');
const captureCanvas = document.getElementById('captureCanvas');
const threeContainer = document.getElementById('threeContainer');
const animalSelect = document.getElementById('animal');

let stream = null;
let cvReady = false;
let motions = null;

// Three.js globals
let renderer, scene, camera, mesh, clock, textureFromCanvas;
let animParams = { freq: 2, amp: 0.05, bounce: true, headShake: false, tailSwing:false, blink:false };

startCamBtn.onclick = async () => {
  try{
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio:false });
    video.srcObject = stream;
    captureBtn.disabled = false;
  }catch(e){
    alert("Impossible d'accéder à la caméra : " + e.message);
  }
};

// wait for OpenCV to be ready
function waitForCv() {
  return new Promise((resolve) => {
    if (window.cv && cv && cv.onRuntimeInitialized) {
      cv.onRuntimeInitialized = () => {
        cvReady = true;
        resolve();
      };
    } else if (window.cv) {
      // older versions
      cvReady = true;
      resolve();
    } else {
      // if script not yet loaded, poll
      const id = setInterval(()=>{
        if(window.cv){
          clearInterval(id);
          cv.onRuntimeInitialized = () => { cvReady = true; resolve(); };
        }
      }, 200);
    }
  });
}

// load motions.json
async function loadMotions(){
  try{
    const r = await fetch('assets/motions.json');
    motions = await r.json();
  }catch(e){
    console.warn('Impossible de charger motions.json, valeurs par défaut utilisées', e);
    motions = {
      "lion": {"freq":2.0,"amp":0.06,"headShake":true,"tailSwing":true,"bounce":true},
      "singe": {"freq":2.6,"amp":0.09,"armSwing":true,"dance":true},
      "dauphin": {"freq":1.8,"amp":0.07,"headTurn":true},
      "vache": {"freq":1.2,"amp":0.03,"blink":true},
      "renard": {"freq":2.8,"amp":0.08,"tailSwing":true,"bounce":true}
    };
  }
}

captureBtn.onclick = async () => {
  captureBtn.disabled = true;
  // draw video frame to captureCanvas
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  captureCanvas.width = vw;
  captureCanvas.height = vh;
  const ctx = captureCanvas.getContext('2d');
  ctx.drawImage(video, 0, 0, vw, vh);

  // wait opencv
  if(!cvReady){
    await waitForCv();
  }

  // process image: create transparent background based on threshold/contour
  const out = processImageAndMakeTransparent(captureCanvas);
  // show on processedCanvas
  processedCanvas.width = out.width;
  processedCanvas.height = out.height;
  const pctx = processedCanvas.getContext('2d');
  pctx.clearRect(0,0,out.width,out.height);
  pctx.drawImage(out, 0, 0);

  animateBtn.disabled = false;
  downloadBtn.disabled = false;
  captureBtn.disabled = false;
};

animateBtn.onclick = async () => {
  // load motions if needed
  if(!motions) await loadMotions();
  const selection = animalSelect.value;
  const m = motions[selection] || {};
  // setup animParams based on motions.json
  animParams.freq = m.freq || 2.0;
  animParams.amp = m.amp || 0.06;
  animParams.bounce = !!m.bounce;
  animParams.headShake = !!m.headShake;
  animParams.tailSwing = !!m.tailSwing;
  animParams.armSwing = !!m.armSwing;
  animParams.blink = !!m.blink;

  // create Three.js scene with texture from processedCanvas
  initThreeWithCanvas(processedCanvas);
};

downloadBtn.onclick = () => {
  // download the processed canvas as PNG (image with transparency)
  const a = document.createElement('a');
  a.href = processedCanvas.toDataURL('image/png');
  a.download = 'dessin_transparent.png';
  a.click();
};

/* ========== Image processing with OpenCV ========== */
/**
 * Returns an HTMLCanvasElement or Image that contains the extracted RGBA image
 * with transparent background.
 */
function processImageAndMakeTransparent(srcCanvas) {
  const src = cv.imread(srcCanvas);
  // resize to a reasonable max width to speed up processing (if very large)
  const MAX_W = 1200;
  let scale = 1;
  if (src.cols > MAX_W) {
    scale = MAX_W / src.cols;
    const dsize = new cv.Size(Math.round(src.cols * scale), Math.round(src.rows * scale));
    const resized = new cv.Mat();
    cv.resize(src, resized, dsize, 0, 0, cv.INTER_AREA);
    src.delete();
    src = resized;
  }

  // Convert to gray
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

  // Blur and adaptive threshold (handles colored pencils/crayons)
  let blur = new cv.Mat();
  cv.GaussianBlur(gray, blur, new cv.Size(5,5), 0);

  let thresh = new cv.Mat();
  // adaptive threshold is good for varying illumination
  cv.adaptiveThreshold(blur, thresh, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);

  // Morphology to close small holes
  let kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3,3));
  cv.morphologyEx(thresh, thresh, cv.MORPH_CLOSE, kernel);

  // find contours
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  // create mask (same size) and fill largest contours
  let mask = new cv.Mat.zeros(thresh.rows, thresh.cols, cv.CV_8UC1);
  // sort contours by area and fill biggest ones (to preserve main drawing)
  const areas = [];
  for (let i=0;i<contours.size();i++){
    areas.push({ idx: i, area: cv.contourArea(contours.get(i), false) });
  }
  areas.sort((a,b)=>b.area - a.area);

  // fill top N contours if area large enough
  let filled = 0;
  for (let k=0; k < Math.min(6, areas.length); k++){
    if (areas[k].area < 100) break; // ignore tiny stuff
    cv.drawContours(mask, contours, areas[k].idx, new cv.Scalar(255,255,255,255), -1);
    filled++;
  }
  // if nothing filled (very light drawings), fallback to threshold as mask
  if (filled === 0) {
    cv.threshold(blur, mask, 200, 255, cv.THRESH_BINARY_INV);
  }

  // create RGBA result by applying mask to original src
  let rgba = new cv.Mat();
  cv.cvtColor(src, rgba, cv.COLOR_RGBA2RGBA, 0); // copy
  // we will set alpha channel to mask
  const mats = new cv.MatVector();
  cv.split(rgba, mats);
  // mats contains r,g,b,a (but original likely has alpha=255). We'll replace alpha.
  // create alpha mat as mask (uchar)
  let alpha = new cv.Mat();
  alpha = mask;
  // Ensure alpha is 255 where mask is 255, else 0
  cv.threshold(alpha, alpha, 127, 255, cv.THRESH_BINARY);
  // merge r,g,b,alpha
  const outMats = new cv.MatVector();
  outMats.push_back(mats.get(0));
  outMats.push_back(mats.get(1));
  outMats.push_back(mats.get(2));
  outMats.push_back(alpha);
  let out = new cv.Mat();
  cv.merge(outMats, out);

  // convert Mat to canvas
  const canvas = document.createElement('canvas');
  canvas.width = out.cols;
  canvas.height = out.rows;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(out.cols, out.rows);
  // copy data
  imgData.data.set(out.data);
  ctx.putImageData(imgData, 0, 0);

  // cleanup
  src.delete();
  gray.delete();
  blur.delete();
  // thresh and mask might be same
  //thresh.delete();
  //mask.delete();
  //contours & hierarchy
  contours.delete(); hierarchy.delete();
  mats.delete(); outMats.delete(); out.delete();

  return canvas;
}

/* ========== Three.js initialization and animation ========== */

function initThreeWithCanvas(sourceCanvas) {
  // cleanup existing renderer/scene if present
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    threeContainer.innerHTML = '';
    renderer = null;
  }

  const w = threeContainer.clientWidth || 600;
  const h = threeContainer.clientHeight || 360;

  renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  threeContainer.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  clock = new THREE.Clock();

  // camera: orthographic-ish for 2D plane with slight perspective
  const aspect = w/h;
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
  camera.position.set(0,0, 600);
  camera.lookAt(0,0,0);

  // lights (subtle)
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(0.5, 0.8, 1);
  scene.add(dir);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  // texture from processed canvas
  textureFromCanvas = new THREE.CanvasTexture(sourceCanvas);
  textureFromCanvas.flipY = false;
  textureFromCanvas.needsUpdate = true;

  // plane geometry sized according to image aspect
  const imgW = sourceCanvas.width;
  const imgH = sourceCanvas.height;
  // choose a scale so the image fits nicely
  const baseScale = 500; // arbitrary scale to fit scene
  const planeWidth = baseScale;
  const planeHeight = baseScale * (imgH / imgW);

  const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 32, 12);

  const material = new THREE.MeshStandardMaterial({
    map: textureFromCanvas,
    transparent: true,
    alphaTest: 0.01,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // small shadow-like plane to add depth
  const shadowMat = new THREE.MeshBasicMaterial({ color:0x000000, transparent:true, opacity:0.06 });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth*1.05, planeHeight*1.05), shadowMat);
  shadow.position.set(0,-planeHeight*0.52,-8);
  shadow.rotation.x = -0.2;
  scene.add(shadow);

  // optionally, add subtle floating movement
  window.addEventListener('resize', onWindowResize);

  // start render loop
  if (!renderer) return;
  renderer.setAnimationLoop(animate);
}

function onWindowResize(){
  const w = threeContainer.clientWidth;
  const h = threeContainer.clientHeight;
  if (!camera || !renderer) return;
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
  renderer.setSize(w,h);
}

function animate() {
  const t = clock.getElapsedTime();
  if(!mesh) return;

  // basic bob / bounce
  if (animParams.bounce) {
    mesh.position.y = Math.sin(t * animParams.freq) * animParams.amp * 120;
  } else {
    mesh.position.y = 0;
  }

  // headShake -> small Z rotation
  if (animParams.headShake) {
    mesh.rotation.z = Math.sin(t * animParams.freq * 1.5) * animParams.amp;
  } else {
    mesh.rotation.z = 0;
  }

  // tailSwing -> a gentle X rotation (gives the idea of tail wagging)
  if (animParams.tailSwing) {
    mesh.rotation.x = Math.sin(t * animParams.freq * 1.8) * animParams.amp * 0.7;
  } else {
    mesh.rotation.x = 0;
  }

  // armSwing or dance -> more complex: small wobble on both axes
  if (animParams.armSwing || animParams.dance) {
    mesh.rotation.y = Math.sin(t * animParams.freq * 1.2) * animParams.amp * 0.6;
  } else {
    // keep subtle parallax rotation depending on mouse maybe - omitted
  }

  // blink simulation: quick vertical squash occasionally
  if (animParams.blink) {
    const blinkSpeed = 3.0;
    const b = (Math.sin(t * blinkSpeed * animParams.freq) + 1) / 2; // 0..1
    // create occasional stronger blinks
    const threshold = 0.92;
    if (b > threshold) {
      mesh.scale.y = 1 - (b - threshold) * 0.9;
    } else {
      mesh.scale.y = 1.0;
    }
  } else {
    mesh.scale.y = 1.0;
  }

  // subtle slow rotation for 3D feel
  mesh.rotation.z += 0.0; // reserved

  // update texture if camera replaced the canvas (not necessary here)
  if (textureFromCanvas) textureFromCanvas.needsUpdate = true;

  renderer.render(scene, camera);
}

/* ========== startup ========== */
(async function init(){
  await loadMotions();
  // wait for OpenCV to load, but don't block UI
  waitForCv().then(()=>{ console.log('OpenCV prêt'); });
})();
