/* listen events and draw shapes */
var frontCanvas = document.getElementById('frontCanvas');
var frontCtx = frontCanvas.getContext('2d');

/* draw lines and final shapes */
var backCanvas = document.getElementById('backCanvas');
var backCtx = backCanvas.getContext('2d');

/* redo undo state */
let state = backCtx.getImageData(0, 0, backCanvas.width, backCanvas.height);
window.history.pushState(state, null);

/* black line drawing */
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function mouseMove(evt) {
  var mousePos = getMousePos(frontCanvas, evt);

  var dx = mousePos.x - mouseStartX;
  var dy = mousePos.y - mouseStartY;

  if(currentState == 'brush' || currentState == 'eraser'){
    backCtx.lineTo(mousePos.x, mousePos.y);
    backCtx.stroke();
  }
  else if(currentState == 'rectangle'){
    frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);
    frontCtx.strokeRect(mouseStartX, mouseStartY, dx, dy);
  }
  else if(currentState == 'circle'){
    frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);
    frontCtx.ellipse(mouseStartX + dx/2, mouseStartY + dy/2, Math.abs(dx)/2, Math.abs(dy)/2, 0, 0, Math.PI*2);
    frontCtx.stroke();
    frontCtx.beginPath();
  }
  else if(currentState == 'triangle'){
    frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);
    frontCtx.moveTo(mouseStartX + dx/2, mouseStartY);
    frontCtx.lineTo(mousePos.x, mousePos.y);
    frontCtx.lineTo(mouseStartX, mousePos.y);
    frontCtx.lineTo(mouseStartX + dx/2, mouseStartY);
    frontCtx.closePath();
    frontCtx.stroke();
    frontCtx.beginPath();
  }
}

/* mouse dragging info */
var mouseStartX = 0;
var mouseStartY = 0;

frontCanvas.addEventListener('mousedown', function(evt) {
  if(currentState == 'typer'){
    return;
  }

  var mousePos = getMousePos(frontCanvas, evt);
  backCtx.beginPath();

  frontCtx.lineWidth = brushSize;
  backCtx.lineWidth = brushSize;

  mouseStartX = mousePos.x;
  mouseStartY = mousePos.y;

  evt.preventDefault();
  frontCanvas.addEventListener('mousemove', mouseMove, false);
});

frontCanvas.addEventListener('mouseup', function(evt) {
  var mousePos = getMousePos(frontCanvas, evt);

  var dx = mousePos.x - mouseStartX;
  var dy = mousePos.y - mouseStartY;

  if(currentState == 'rectangle'){
    frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);
    backCtx.strokeRect(mouseStartX, mouseStartY, dx, dy);
  }
  else if(currentState == 'circle'){
    frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);
    backCtx.ellipse(mouseStartX + dx/2, mouseStartY + dy/2, Math.abs(dx)/2, Math.abs(dy)/2, 0, 0, Math.PI*2);
    backCtx.stroke();
  }
  else if(currentState == 'triangle'){
    frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);
    backCtx.moveTo(mouseStartX + dx/2, mouseStartY);
    backCtx.lineTo(mousePos.x, mousePos.y);
    backCtx.lineTo(mouseStartX, mousePos.y);
    backCtx.lineTo(mouseStartX + dx/2, mouseStartY);
    backCtx.closePath();
    backCtx.stroke();
  }

  frontCanvas.removeEventListener('mousemove', mouseMove, false);

  let state = backCtx.getImageData(0, 0, backCanvas.width, backCanvas.height);
  window.history.pushState(state, null);
}, false);

var fontFamily = document.getElementById('fontFamily');
var fontSize = document.getElementById('fontSize');
/* listen to text input click */
frontCanvas.addEventListener('click', function(evt){
  if(currentState != 'typer'){
    return;
  }

  var mousePos = getMousePos(frontCanvas, evt);
  var input = document.createElement('input');

  input.type = 'text';
  input.style.position = 'fixed';
  input.style.left = `${mousePos.x + 105}px`;
  input.style.top = `${mousePos.y - 10}px`;
  input.onkeydown = function(evt){
    if (evt.key === 'Enter') {
      backCtx.font = fontSize.value + "px " + fontFamily.value;
      backCtx.fillText(this.value, parseInt(this.style.left, 10)-105, parseInt(this.style.top, 10)+15);
      document.body.removeChild(this);

      let state = backCtx.getImageData(0, 0, backCanvas.width, backCanvas.height);
      window.history.pushState(state, null);
    }
  };

  document.body.appendChild(input);
  input.focus();
});


/* brush size slider */
var brushSizeSlider = document.getElementById('brushSize');
var brushSize = "12";

brushSizeSlider.oninput = function(){
  brushSize = parseInt(this.value, 10);
}

/* color picker */
var colorPickerCanvas = document.getElementById('colorPicker');
var colorPickerCtx = colorPickerCanvas.getContext('2d', {willReadFrequently: true});

var colorPickerX = 0;
var colorPickerY = 200;

function drawColorPicker(){
  const gradientH = colorPickerCtx.createLinearGradient(0, 0, 300, 0);
  gradientH.addColorStop(0, "rgb(255, 0, 0)"); // red
  gradientH.addColorStop(1/6, "rgb(255, 255, 0)"); // yellow
  gradientH.addColorStop(2/6, "rgb(0, 255, 0)"); // green
  gradientH.addColorStop(3/6, "rgb(0, 255, 255)");
  gradientH.addColorStop(4/6, "rgb(0, 0, 255)"); // blue
  gradientH.addColorStop(5/6, "rgb(255, 0, 255)");
  gradientH.addColorStop(1, "rgb(255, 0, 0)"); // red
  colorPickerCtx.fillStyle = gradientH;
  colorPickerCtx.fillRect(0, 0, 300, 200);

  const gradientV = colorPickerCtx.createLinearGradient(0, 0, 0, 200);
  gradientV.addColorStop(0, "rgba(255, 255, 255, 1)"); // white
  gradientV.addColorStop(0.5, "rgba(255, 255, 255, 0)");
  gradientV.addColorStop(0.5, "rgba(0, 0, 0, 0)"); // transparent
  gradientV.addColorStop(1, "rgba(0, 0, 0, 1)"); // black
  colorPickerCtx.fillStyle = gradientV;
  colorPickerCtx.fillRect(0, 0, 300, 200);

  colorPickerCtx.beginPath();
  colorPickerCtx.arc(colorPickerX, colorPickerY, 6, 0, Math.PI * 2);
  colorPickerCtx.strokeStyle = "white";
  colorPickerCtx.lineWidth = 3;
  colorPickerCtx.stroke();
  colorPickerCtx.closePath();

  /* change color according to xy */
  var imgData = colorPickerCtx.getImageData(colorPickerX, colorPickerY, 1, 1);
  frontCtx.strokeStyle = 'rgb(' + imgData.data[0] + ',' + imgData.data[1] + ',' + imgData.data[2] + ')';
  /* font color */
  backCtx.fillStyle = 'rgb(' + imgData.data[0] + ',' + imgData.data[1] + ',' + imgData.data[2] + ')';
  /* shape canvas color */
  backCtx.strokeStyle = 'rgb(' + imgData.data[0] + ',' + imgData.data[1] + ',' + imgData.data[2] + ')';
}

/* keep redraw color picker */
setInterval(drawColorPicker, 1);

function colorPickerMouseMove(evt) {
  var mousePos = getMousePos(colorPickerCanvas, evt);
  colorPickerX = mousePos.x;
  colorPickerY = mousePos.y;
}

colorPickerCanvas.addEventListener('mousedown', function(evt) {
  var mousePos = getMousePos(colorPickerCanvas, evt);
  colorPickerX = mousePos.x;
  colorPickerY = mousePos.y;

  evt.preventDefault();
  colorPickerCanvas.addEventListener('mousemove', colorPickerMouseMove, false);
});

colorPickerCanvas.addEventListener('mouseup', function() {
  colorPickerCanvas.removeEventListener('mousemove', colorPickerMouseMove, false);
}, false);

/* declare functions */
var currentState = '';
/* init state */
toBrush();

function toBrush(){
  console.log('toBrush');

  currentState = 'brush';
  frontCanvas.style.cursor = "url(./img/paintbrush-solid.svg) 0 32, auto";
  backCtx.globalCompositeOperation="source-over";

}

function toEraser(){
  console.log('toEraser');

  currentState = 'eraser';
  frontCanvas.style.cursor = "url(./img/eraser-solid.svg) 0 32, auto";
  backCtx.globalCompositeOperation="destination-out";
}

/* text input */
function toTyper(){
  console.log('toTyper');

  currentState = 'typer';
  frontCanvas.style.cursor = "url(./img/keyboard-solid.svg) 0 0, auto";
  backCtx.globalCompositeOperation="source-over";
}


function toCircle(){
  console.log('toCircle');

  currentState = 'circle';
  frontCanvas.style.cursor = "url(./img/circle-regular.svg) 8 8, auto";
  backCtx.globalCompositeOperation="source-over";
}

function toTriangle(){
  console.log('toTriangle');

  currentState = 'triangle';
  frontCanvas.style.cursor = "url(./img/triangle.svg) 8 8, auto";
  backCtx.globalCompositeOperation="source-over";
}

function toRectangle(){
  console.log('toRectangle');

  currentState = 'rectangle';
  frontCanvas.style.cursor = "url(./img/square-regular.svg) 0 0, auto";
  backCtx.globalCompositeOperation="source-over";
}

function undo(){
  console.log('undo');

  history.back();
}

function redo(){
  console.log('redo');

  history.forward();
}

window.addEventListener('popstate', function(evt){
  backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);

  if(evt.state){
    backCtx.putImageData(evt.state, 0, 0);
  }
}, false);

function clean(){
  console.log('clean');

  backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);

  let state = backCtx.getImageData(0, 0, backCanvas.width, backCanvas.height);
  window.history.pushState(state, null);
}

function upload(){
  console.log('upload');

  var input = document.createElement('input');

  input.type = 'file';
  input.click();

  input.onchange = function(e) {
    var img = new Image();
    img.onload = function () {
      backCtx.drawImage(this, 0, 0);
    };
    img.src = URL.createObjectURL(this.files[0]);
  };
}

function download(){
  console.log('download');

  var link = document.createElement('a');
  link.download = 'canvas.png';
  link.href = backCanvas.toDataURL()
  link.click();
}