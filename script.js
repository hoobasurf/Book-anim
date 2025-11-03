let video = document.getElementById('camera');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let animalSelect = document.getElementById('animalSelect');

document.getElementById('startCamera').addEventListener('click', async () => {
  try {
    let stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.style.display = 'block';
    setTimeout(capturePhoto, 1000);
  } catch (err) {
    alert('Erreur caméra : ' + err);
  }
});

let capturedImage = null;

async function capturePhoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  video.style.display = 'none';

  if (cv) {
    let src = cv.imread(canvas);
    let dst = new cv.Mat();
    cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0);
    let low = new cv.Mat(src.rows, src.cols, src.type(), [200,200,200,0]);
    let high = new cv.Mat(src.rows, src.cols, src.type(), [255,255,255,255]);
    cv.inRange(src, low, high, dst);
    cv.bitwise_not(dst, dst);
    cv.imshow(canvas, dst);
    src.delete(); dst.delete(); low.delete(); high.delete();
  }

  capturedImage = new Image();
  capturedImage.src = canvas.toDataURL();

  animateDrawing(animalSelect.value);
}

function animateDrawing(animal) {
  let t = 0;

  function step() {
    t += 0.05;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    let x = canvas.width/2;
    let y = canvas.height/2;
    let headRotation = 0;
    let tailSwing = 0;
    let verticalMove = 0;
    let armSwing = 0;

    switch(animal) {
      case 'lion':
        x += Math.sin(t*2)*30;
        headRotation = Math.sin(t*5)*0.15;
        tailSwing = Math.sin(t*3)*0.2;
        verticalMove = Math.sin(t*1.5)*5;
        break;
      case 'singe':
        verticalMove = Math.sin(t*3)*50;
        armSwing = Math.sin(t*5)*0.3;
        break;
      case 'dauphin':
        verticalMove = Math.sin(t*4)*40;
        headRotation = Math.sin(t*2)*0.1;
        break;
      case 'vache':
        x += Math.sin(t)*10;
        headRotation = Math.sin(t*1.5)*0.05;
        break;
      case 'renard':
        x += Math.sin(t*3)*30;
        tailSwing = Math.sin(t*2)*0.15;
        verticalMove = Math.sin(t*2)*5;
        break;
    }

    ctx.translate(x, y + verticalMove);
    ctx.rotate(headRotation);

    if(capturedImage) {
      ctx.drawImage(capturedImage, -capturedImage.width/2, -capturedImage.height/2, capturedImage.width, capturedImage.height);
    }

    ctx.restore();

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
