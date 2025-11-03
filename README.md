# Book-anim-main

Version simple pour Netlify — transforme une photo de dessin en image transparente puis l'anime en WebGL (Three.js).

## Installation / déploiement
1. Crée un repo GitHub et pousse ces fichiers / dossier `assets/` (contenant `motions.json`).
2. Déploie sur Netlify (ou tout hébergeur static). **La caméra requiert HTTPS**, Netlify fournit HTTPS automatiquement.
3. Ouvre la page, clique sur *Démarrer la caméra*, prends la photo, puis *Animer*.

## Comportement
- La suppression du fond est effectuée dans le navigateur avec OpenCV.js.
- Le rendu 3D + animation est réalisé avec Three.js.
- Les librairies sont chargées via CDN (Three.js et OpenCV.js).

## Vie privée
Les images restent **dans le navigateur**. Aucune photo n'est envoyée sur un serveur.

## Si tu veux une version 100% hors-ligne
Dis-moi et je fournis les fichiers `three.min.js` et `opencv.js` pour les inclure localement (le repo deviendra plus volumineux).

## Remarques & améliorations possibles
- Découper automatiquement le dessin en parties (tête / corps / queue) permettrait des animations plus réalistes. Cela nécessite un traitement plus avancé de segmentation et un travail de calage.
- Ajout d’export vidéo/GIF (WebMRecorder ou CCapture) possible.
