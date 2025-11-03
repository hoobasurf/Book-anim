// --- DOM ---
const video = document.getElementById("video");
const startCamBtn = document.getElementById("startCam");
const captureBtn = document.getElementById("captureBtn");
const threeContainer = document.getElementById("threeContainer");
const animalSelect = document.getElementById("animal");

// --- Caméra arrière (iOS + Android) ---
startCamBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });
    video.srcObject = stream;
    captureBtn.disabled = false;
  } catch (err) {
    alert("Erreur accès caméra : " + err.message);
  }
};

// --- Motions JSON (animaux) ---
const motions = {
  lion: { head: true, tail: true, body: true },
  singe: { arms: true, body: true },
  dauphin: { head: true, body: true },
  vache: { body: true, blink: true },
  renard: { tail: true, body: true }
};

// --- Capture et animation ---
captureBtn.onclick = () => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Fond blanc transparent
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) data[i + 3] = 0;
  }
  ctx.putImageData(imgData, 0, 0);

  startThreeAnimation(canvas, animalSelect.value);
};

// --- Animation Three.js ---
function startThreeAnimation(canvas, animal) {
  threeContainer.innerHTML = "";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, threeContainer.clientWidth / threeContainer.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
  threeContainer.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 0, 10);
  scene.add(light);

  const w = canvas.width;
  const h = canvas.height;

  // Création des parties fictives pour prototype
  function createPart(x, y, width, height) {
    const partCanvas = document.createElement("canvas");
    partCanvas.width = width;
    partCanvas.height = height;
    partCanvas.getContext("2d").drawImage(canvas, x, y, width, height, 0, 0, width, height);
    const tex = new THREE.Texture(partCanvas);
    tex.needsUpdate = true;
    const geo = new THREE.PlaneGeometry(4, 4 * height / width);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = ((h/2 - y - height/2)/h) * 4; // position verticale
    scene.add(mesh);
    return mesh;
  }

  // Découpage fictif
  const parts = {};
  switch(animal){
    case "lion":
      parts.head = createPart(0, 0, w, h/3);
      parts.body = createPart(0, h/3, w, h/3);
      parts.tail = createPart(0, 2*h/3, w, h/3);
      break;
    case "singe":
      parts.arms = createPart(0, 0, w, h/3);
      parts.body = createPart(0, h/3, w, 2*h/3);
      break;
    case "dauphin":
      parts.head = createPart(0, 0, w, h/2);
      parts.body = createPart(0, h/2, w, h/2);
      break;
    case "vache":
      parts.body = createPart(0, 0, w, h);
      break;
    case "renard":
      parts.body = createPart(0, 0, w, 2*h/3);
      parts.tail = createPart(0, 2*h/3, w, h/3);
      break;
  }

  camera.position.z = 6;

  let angle = 0;
  function animate() {
    requestAnimationFrame(animate);

    // --- Animations par animal ---
    switch(animal){
      case "lion":
        if(parts.head) parts.head.rotation.z = Math.sin(angle*3)*0.2;
        if(parts.body) parts.body.position.y = Math.sin(angle*2)*0.1;
        if(parts.tail) parts.tail.rotation.z = Math.sin(angle*4)*0.3;
        break;
      case "singe":
        if(parts.arms) parts.arms.rotation.z = Math.sin(angle*3)*0.2;
        if(parts.body) parts.body.position.y = Math.abs(Math.sin(angle*2))*0.2;
        break;
      case "dauphin":
        if(parts.head) parts.head.rotation.z = Math.sin(angle*3)*0.15;
        if(parts.body) parts.body.position.y = Math.abs(Math.sin(angle*2))*0.2;
        break;
      case "vache":
        if(parts.body) parts.body.position.y = Math.sin(angle*2)*0.05;
        break;
      case "renard":
        if(parts.body) parts.body.position.y = Math.sin(angle*2)*0.1;
        if(parts.tail) parts.tail.rotation.z = Math.sin(angle*4)*0.25;
        break;
    }

    angle += 0.02;
    for(let key in parts) parts[key].material.map.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();
}
