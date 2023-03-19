/* listen events and draw shapes */
var frontCanvas = document.getElementById('frontCanvas');
var frontCtx = frontCanvas.getContext('2d');

/* draw lines and final shapes */
var backCanvas = document.getElementById('backCanvas');
var backCtx = backCanvas.getContext('2d');

/* redo undo state */
function save(){
  let state = backCtx.getImageData(0, 0, backCanvas.width, backCanvas.height);
  window.history.pushState(state, null);
}
save();

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
  else if(currentState == 'dash_repeat' || currentState == 'dash_spin'){
    frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);
    frontCtx.setLineDash([4, 2]);
    frontCtx.lineDashOffset = -offset;
    frontCtx.strokeRect(mouseStartX, mouseStartY, dx, dy);
  }
}

/* mouse dragging info */
var mouseStartX = 0;
var mouseStartY = 0;

frontCanvas.addEventListener('mousedown', function(evt) {
  if(currentState == 'typer' || currentState == 'heart'){
    return;
  }

  var mousePos = getMousePos(frontCanvas, evt);
  backCtx.beginPath();

  frontCtx.lineWidth = brushSize;
  backCtx.lineWidth = brushSize;
  if(currentState == 'dash_repeat' || currentState == 'dash_spin'){
    frontCtx.lineWidth = 1;
  }

  mouseStartX = mousePos.x;
  mouseStartY = mousePos.y;

  evt.preventDefault();
  frontCanvas.addEventListener('mousemove', mouseMove, false);
});

frontCanvas.addEventListener('mouseup', function(evt) {
  if(currentState == 'typer' || currentState == 'heart'){
    return;
  }

  var mousePos = getMousePos(frontCanvas, evt);

  var dx = mousePos.x - mouseStartX;
  var dy = mousePos.y - mouseStartY;

  if(currentState == 'brush' || currentState == 'eraser'){
    save();
  }
  else if(currentState == 'rectangle'){
    frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);
    backCtx.strokeRect(mouseStartX, mouseStartY, dx, dy);
    save();
  }
  else if(currentState == 'circle'){
    frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);
    backCtx.ellipse(mouseStartX + dx/2, mouseStartY + dy/2, Math.abs(dx)/2, Math.abs(dy)/2, 0, 0, Math.PI*2);
    backCtx.stroke();
    save();
  }
  else if(currentState == 'triangle'){
    frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);
    backCtx.moveTo(mouseStartX + dx/2, mouseStartY);
    backCtx.lineTo(mousePos.x, mousePos.y);
    backCtx.lineTo(mouseStartX, mousePos.y);
    backCtx.lineTo(mouseStartX + dx/2, mouseStartY);
    backCtx.closePath();
    backCtx.stroke();
    save();
  }
  else if(currentState == 'dash_repeat'){
    frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);
    
    var imgData = backCtx.getImageData(mouseStartX, mouseStartY, dx, dy);

    var img = imagedata_to_image(imgData);

    img.onload = function() {
      var ptrn = backCtx.createPattern(this, 'repeat');
      backCtx.fillStyle = ptrn;
      backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);
      backCtx.fillRect(0, 0, backCanvas.width, backCanvas.height);
      save();
    };
  }
  else if(currentState == 'dash_spin'){
    frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);

    var imgData = backCtx.getImageData(mouseStartX, mouseStartY, dx, dy);

    var img = imagedata_to_image(imgData);

    img.onload = function() {
      var topLeftX = Math.min(mouseStartX, mouseStartX+dx);
      var topLeftY = Math.min(mouseStartY, mouseStartY+dy);
      dx = Math.abs(dx);
      dy = Math.abs(dy);

      backCtx.save();

      backCtx.translate(topLeftX + dx/2, topLeftY + dy/2);
      backCtx.rotate(Math.PI / 2);
      backCtx.translate(-(topLeftX + dx/2), -(topLeftY + dy/2));

      backCtx.clearRect(topLeftX, topLeftY, dx, dy);
      backCtx.drawImage(this, topLeftX, topLeftY);

      backCtx.restore();

      save();
    };
  }

  frontCanvas.removeEventListener('mousemove', mouseMove, false);
}, false);

function imagedata_to_image(imagedata) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = imagedata.width;
  canvas.height = imagedata.height;
  ctx.putImageData(imagedata, 0, 0);

  var image = new Image();
  image.src = canvas.toDataURL();
  return image;
}

var fontFamily = document.getElementById('fontFamily');
var fontSize = document.getElementById('fontSize');

/* listen to text input click */
/* also heart stamp */
frontCanvas.addEventListener('click', function(evt){
  if(currentState != 'typer' && currentState != 'heart'){
    return;
  }

  var mousePos = getMousePos(frontCanvas, evt);

  if(currentState == 'typer'){
    var input = document.createElement('input');

    input.type = 'text';
    input.style.position = 'fixed';
    input.style.left = `${mousePos.x + 105}px`;
    input.style.top = `${mousePos.y - 10}px`;
    input.style.zIndex = 2;
    input.onkeydown = function(evt){
      if (evt.key === 'Enter') {
        backCtx.font = fontSize.value + "px " + fontFamily.value;
        backCtx.fillText(this.value, parseInt(this.style.left, 10)-105, parseInt(this.style.top, 10)+15);
        document.body.removeChild(this);

        save();
      }
    };

    document.body.appendChild(input);
    input.focus();
  }
  else if(currentState == 'heart'){
    drawHeart(mousePos.x-60, mousePos.y-55);
    save();
  }
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
  currentState = 'brush';
  frontCanvas.style.cursor = "url(./img/paintbrush-solid.svg) 0 32, auto";
  backCtx.globalCompositeOperation="source-over";
}

function toEraser(){
  currentState = 'eraser';
  frontCanvas.style.cursor = "url(./img/eraser-solid.svg) 0 32, auto";
  backCtx.globalCompositeOperation="destination-out";
}

/* text input */
function toTyper(){
  currentState = 'typer';
  frontCanvas.style.cursor = "url(./img/keyboard-solid.svg) 0 0, auto";
  backCtx.globalCompositeOperation="source-over";
}


function toCircle(){
  currentState = 'circle';
  frontCanvas.style.cursor = "url(./img/circle-regular.svg) 8 8, auto";
  backCtx.globalCompositeOperation="source-over";
}

function toTriangle(){
  currentState = 'triangle';
  frontCanvas.style.cursor = "url(./img/triangle.svg) 8 8, auto";
  backCtx.globalCompositeOperation="source-over";
}

function toRectangle(){
  currentState = 'rectangle';
  frontCanvas.style.cursor = "url(./img/square-regular.svg) 0 0, auto";
  backCtx.globalCompositeOperation="source-over";
}

function undo(){
  history.back();
}

function redo(){
  history.forward();
}

window.addEventListener('popstate', function(evt){
  backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);

  if(evt.state){
    backCtx.putImageData(evt.state, 0, 0);
  }
}, false);

function clean(){
  backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);

  save();
}

function upload(){
  var input = document.createElement('input');

  input.type = 'file';
  input.click();

  input.onchange = function(e) {
    var img = new Image();
    img.onload = function () {
      backCtx.drawImage(this, 0, 0);
      save();
    };
    img.src = URL.createObjectURL(this.files[0]);
  };
}

function download(){
  var link = document.createElement('a');
  link.download = 'canvas.png';
  link.href = backCanvas.toDataURL();
  link.click();
}

/* widget 1: heart stamp */
function toHeart(){
  currentState = 'heart';
  frontCanvas.style.cursor = "url(./img/heart-solid.svg) 0 0, auto";
  backCtx.globalCompositeOperation="source-over";
}

function drawHeart(x, y) {
  // Cubic curves example
  backCtx.beginPath();
  backCtx.moveTo(75+x, 40+y);
  backCtx.bezierCurveTo(75+x, 37+y, 70+x, 25+y, 50+x, 25+y);
  backCtx.bezierCurveTo(20+x, 25+y, 20+x, 62.5+y, 20+x, 62.5+y);
  backCtx.bezierCurveTo(20+x, 80+y, 40+x, 102+y, 75+x, 120+y);
  backCtx.bezierCurveTo(110+x, 102+y, 130+x, 80+y, 130+x, 62.5+y);
  backCtx.bezierCurveTo(130+x, 62.5+y, 130+x, 25+y, 100+x, 25+y);
  backCtx.bezierCurveTo(85+x, 25+y, 75+x, 37+y, 75+x, 40+y);
  backCtx.fill();
}

/* widget 2: line dashes select */
function repeat(){
  currentState = 'dash_repeat';
  frontCanvas.style.cursor = "url(./img/repeat-solid.svg) 5 5, auto";
  backCtx.globalCompositeOperation="source-over";
}

let offset = 0;

function march() {
  offset++;
  if (offset > 16) {
    offset = 0;
  }
  setTimeout(march, 2);
}

march();

/* widget 3: spin 90 */
function spin(){
  currentState = 'dash_spin';
  frontCanvas.style.cursor = "url(./img/arrows-spin-solid.svg) 5 5, auto";
  backCtx.globalCompositeOperation="source-over";
}