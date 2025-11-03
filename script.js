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
  lion: { headShake: true, tailSwing: true, bounce: true, walk: true },
  singe: { armSwing: true, jump: true, walk: true },
  dauphin: { headTurn: true, jump: true, swim: true },
  vache: { blink: true, bounce: true, walk: true },
  renard: { tailSwing: true, bounce: true, run: true }
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
    if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) data[i+3] = 0;
  }
  ctx.putImageData(imgData, 0, 0);

  startThreeAnimation(canvas, animalSelect.value);
};

// --- Animation Three.js avec mouvements naturels ---
function startThreeAnimation(canvas, animal) {
  threeContainer.innerHTML = "";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, threeContainer.clientWidth / threeContainer.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true });
  renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
  threeContainer.appendChild(renderer.domElement);

  // Lumière
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0,0,10);
  scene.add(light);

  // Texture principale (dessin entier)
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  const geometry = new THREE.PlaneGeometry(4, 4 * canvas.height / canvas.width);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  camera.position.z = 6;

  // Variables pour animation
  let angle = 0;

  function animate() {
    requestAnimationFrame(animate);

    // --- Animations par animal ---
    switch(animal){
      case "lion":
        if(motions.lion.walk) mesh.position.x = Math.sin(angle)*0.5;
        if(motions.lion.bounce) mesh.position.y = Math.sin(angle*2)*0.2;
        if(motions.lion.headShake) mesh.rotation.z = Math.sin(angle*3)*0.15;
        if(motions.lion.tailSwing) mesh.rotation.y = Math.sin(angle*4)*0.1;
        break;
      case "singe":
        if(motions.singe.walk) mesh.position.x = Math.sin(angle*1.5)*0.5;
        if(motions.singe.jump) mesh.position.y = Math.abs(Math.sin(angle*2))*0.5;
        if(motions.singe.armSwing) mesh.rotation.z = Math.sin(angle*3)*0.2;
        break;
      case "dauphin":
        if(motions.dauphin.swim) mesh.position.x = Math.sin(angle*2)*0.5;
        if(motions.dauphin.jump) mesh.position.y = Math.abs(Math.sin(angle*2))*0.5;
        if(motions.dauphin.headTurn) mesh.rotation.z = Math.sin(angle*3)*0.15;
        break;
      case "vache":
        if(motions.vache.walk) mesh.position.x = Math.sin(angle)*0.3;
        if(motions.vache.bounce) mesh.position.y = Math.sin(angle*2)*0.1;
        if(motions.vache.blink) mesh.rotation.z = Math.sin(angle*4)*0.05;
        break;
      case "renard":
        if(motions.renard.run) mesh.position.x = Math.sin(angle*3)*0.7;
        if(motions.renard.bounce) mesh.position.y = Math.sin(angle*2)*0.2;
        if(motions.renard.tailSwing) mesh.rotation.z = Math.sin(angle*4)*0.15;
        break;
    }

    angle += 0.02;
    texture.needsUpdate = true;
    renderer.render(scene, camera);
  }

  animate();
}
