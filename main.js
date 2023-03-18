var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

/* black line drawing */
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function mouseMove(evt) {
  var mousePos = getMousePos(canvas, evt);
  ctx.lineTo(mousePos.x, mousePos.y);
  ctx.stroke();
}

canvas.addEventListener('mousedown', function(evt) {
  var mousePos = getMousePos(canvas, evt);
  ctx.beginPath();
  ctx.moveTo(mousePos.x, mousePos.y);

  ctx.lineWidth = brushSize;
  ctx.strokeStyle = "red";
  
  evt.preventDefault();
  canvas.addEventListener('mousemove', mouseMove, false);
});

canvas.addEventListener('mouseup', function() {
  canvas.removeEventListener('mousemove', mouseMove, false);
}, false);

/* brush size slider */
var brushSizeSlider = document.getElementById('brushSize');
var brushSize = "12";

brushSizeSlider.oninput = function(){
  brushSize = parseInt(this.value, 10);
}

/* declare functions */
function toBrush(){
  console.log('toBrush');

  canvas.style.cursor = "url(./img/paintbrush-solid.svg) 0 32, auto";
  ctx.globalCompositeOperation="source-over";
}

function toEraser(){
  console.log('toEraser');

  canvas.style.cursor = "url(./img/eraser-solid.svg) 0 32, auto";
  ctx.globalCompositeOperation="destination-out";
}

function toTyper(){
  console.log('toTyper');

  canvas.style.cursor = "url(./img/keyboard-solid.svg) 0 0, auto";
}

function toCircle(){
  console.log('toCircle');

  canvas.style.cursor = "url(./img/circle-regular.svg) 8 8, auto";
}

function toTriangle(){
  console.log('toTriangle');

  canvas.style.cursor = "url(./img/triangle.svg) 8 8, auto";
}

function toRectangle(){
  console.log('toRectangle');

  canvas.style.cursor = "url(./img/square-regular.svg) 0 0, auto";
}

function undo(){
  console.log('undo');
}

function redo(){
  console.log('redo');
}

function clean(){
  console.log('clean');
}

function upload(){
  console.log('upload');
}

function download(){
  console.log('download');
}