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
}

function toEraser(){
  console.log('toEraser');
}

function toTyper(){
  console.log('toTyper');
}

function toCircle(){
  console.log('toCircle');
}

function toTriangle(){
  console.log('toTriangle');
}

function toRectangle(){
  console.log('toRectangle');
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