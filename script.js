// --- Éléments DOM ---
const video = document.getElementById("video");
const startCamBtn = document.getElementById("startCam");
const captureBtn = document.getElementById("captureBtn");
const captureCanvas = document.getElementById("captureCanvas");
const processedCanvas = document.getElementById("processedCanvas");
const threeContainer = document.getElementById("threeContainer");
const animalSelect = document.getElementById("animal");

let stream;

// --- Étape 1 : Démarrage caméra ---
startCamBtn.onclick = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
    captureBtn.disabled = false;
  } catch (err) {
    alert("Erreur accès caméra : " + err.message);
  }
};

// --- Étape 2 : Capture photo et suppression fond blanc ---
captureBtn.onclick = () => {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  captureCanvas.width = vw;
  captureCanvas.height = vh;
  processedCanvas.width = vw;
  processedCanvas.height = vh;

  const ctx = captureCanvas.getContext("2d");
  ctx.drawImage(video, 0, 0, vw, vh);

  const pctx = processedCanvas.getContext("2d");
  pctx.clearRect(0, 0, vw, vh);

  // récupère les pixels
  const imgData = ctx.getImageData(0, 0, vw, vh);
  const data = imgData.data;

  // rendre le blanc transparent
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) {
      data[i+3] = 0; // alpha = 0
    }
  }

  pctx.putImageData(imgData, 0, 0);

  // lancer animation 3D
  startThreeAnimation();
};

// --- Étape 3 : Animation 3D avec Three.js ---
function startThreeAnimation() {
  // Nettoyer conteneur
  threeContainer.innerHTML = "";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, threeContainer.clientWidth / threeContainer.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
  threeContainer.appendChild(renderer.domElement);

  // Lumière
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 0, 10).normalize();
  scene.add(light);

  // Texture : image capturée
  const texture = new THREE.Texture(processedCanvas);
  texture.needsUpdate = true;

  // Plan pour afficher le dessin
  const geometry = new THREE.PlaneGeometry(4, 4 * processedCanvas.height / processedCanvas.width);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  camera.position.z = 5;

  // Variables pour animation
  let angle = 0;

  function animate() {
    requestAnimationFrame(animate);
    // Rotation légère et rebond
    plane.rotation.y = Math.sin(angle) * 0.2;
    plane.position.y = Math.sin(angle * 2) * 0.2;
    angle += 0.02;

    // mise à jour texture
    texture.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();
}
