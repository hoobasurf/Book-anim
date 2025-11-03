// script.js — version complète compatible iPhone/Safari
let video = document.getElementById("video");
let startCamBtn = document.getElementById("startCam");
let captureBtn = document.getElementById("captureBtn");
let animateBtn = document.getElementById("animateBtn");
let downloadBtn = document.getElementById("downloadBtn");
let captureCanvas = document.getElementById("captureCanvas");
let processedCanvas = document.getElementById("processedCanvas");

let stream = null;
let cvReady = false;

// --- Étape 1 : attendre le chargement complet d'OpenCV ---
console.log("⏳ Chargement d'OpenCV...");

function onOpenCvReady() {
  cvReady = true;
  console.log("✅ OpenCV est prêt !");
  alert("✅ OpenCV chargé ! Tu peux maintenant prendre la photo.");
}

// Safari / iPhone : on vérifie si cv est déjà défini
if (typeof cv !== "undefined" && cv.ready) {
  onOpenCvReady();
} else if (typeof cv !== "undefined") {
  cv['onRuntimeInitialized'] = onOpenCvReady;
} else {
  console.warn("⚠️ OpenCV n'est pas encore chargé, attendre 3-5 secondes...");
}

// --- Étape 2 : démarrage de la caméra ---
startCamBtn.onclick = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }, // arrière si possible
      audio: false
    });
    video.srcObject = stream;
    captureBtn.disabled = false;
    alert("📹 Caméra démarrée ! Tu peux prendre la photo.");
  } catch (e) {
    alert("Erreur accès caméra : " + e.message);
  }
};

// --- Étape 3 : capture d'image et traitement ---
captureBtn.onclick = async () => {
  if (!cvReady) {
    alert("⏳ OpenCV n’est pas encore prêt, attends quelques secondes !");
    return;
  }

  console.log("📸 Capture de la photo...");

  // iPhone : convertir le flux vidéo en image via toDataURL pour éviter cv.imread direct
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = video.videoWidth;
  tempCanvas.height = video.videoHeight;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

  // copier dans captureCanvas pour affichage caché
  captureCanvas.width = tempCanvas.width;
  captureCanvas.height = tempCanvas.height;
  const ctx = captureCanvas.getContext("2d");
  ctx.drawImage(tempCanvas, 0, 0);

  try {
    // OpenCV.js
    let src = cv.imread(tempCanvas);
    let dst = new cv.Mat();
    let gray = new cv.Mat();
    let mask = new cv.Mat();

    console.log("🎨 Conversion en niveaux de gris...");
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    console.log("🧹 Seuil binaire pour supprimer le fond blanc...");
    cv.threshold(gray, mask, 240, 255, cv.THRESH_BINARY_INV);

    console.log("💥 Application du masque...");
    let rgbaPlanes = new cv.MatVector();
    cv.split(src, rgbaPlanes);
    rgbaPlanes.push_back(mask);
    cv.merge(rgbaPlanes, dst);

    console.log("✅ Affichage du résultat...");
    processedCanvas.width = dst.cols;
    processedCanvas.height = dst.rows;
    cv.imshow(processedCanvas, dst);

    // Nettoyage mémoire
    src.delete(); dst.delete(); gray.delete(); mask.delete(); rgbaPlanes.delete();

    animateBtn.disabled = false;
    downloadBtn.disabled = false;

  } catch (err) {
    console.error("❌ Erreur OpenCV :", err);
    alert("Erreur pendant le traitement d'image (voir console)");
  }
};

// --- Étape 4 : Télécharger l'image PNG ---
downloadBtn.onclick = () => {
  const link = document.createElement("a");
  link.download = "dessin.png";
  link.href = processedCanvas.toDataURL("image/png");
  link.click();
};

// --- Étape 5 : Bouton Animer (placeholder) ---
animateBtn.onclick = () => {
  alert("Animation à venir ! (à implémenter selon l'animal choisi)");
};
