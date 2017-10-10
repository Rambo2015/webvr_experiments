console.clear();
var frameData = null;
var vrDisplay;
var startButton = document.querySelector('.start');
var stopButton = document.querySelector('.stop');


/* THREEJS */
var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(2);
var width = window.innerWidth;
var height = window.innerHeight;
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera();

/* CREATE MATRIX BOX */
var boundingGeom = new THREE.BoxGeometry(2,2,2,8,8,8);
var mat = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe:true,
  transparent: true,
  opacity: 0.2
});
scene.add(new THREE.Mesh(boundingGeom, mat));

/* BOXES CREATION */
var amount = 36;
var cubes = new THREE.Object3D();
cubes.position.x = 1
scene.add(cubes);
for(var i=0;i<amount;i++){
  var material = new THREE.MeshBasicMaterial({
    color: new THREE.Color('hsl('+((i/amount)*360)+',50%, 50%)'),
    side: THREE.DoubleSide
  });
  var cube = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2), material);
  cube.position.x = (Math.random()-0.5) * 2;
  cube.position.y = (Math.random()-0.5) * 2;
  cube.position.z = (Math.random()-0.5) * 2;
  cubes.add(cube);
}
/* END BOXES CREATION */

var axisHelper = new THREE.AxisHelper( 5 );
scene.add( axisHelper );

/* WEBVR STUFFS */
var cameraL = new THREE.PerspectiveCamera();
cameraL.bounds = new THREE.Vector4( 0.0, 0.0, 0.5, 1.0 );
cameraL.layers.enable(1);
cameraL.near = camera.near;
cameraL.far = camera.far;

var cameraR = new THREE.PerspectiveCamera();
cameraR.bounds = new THREE.Vector4( 0.5, 0.0, 0.5, 1.0 );
cameraR.layers.enable(2);
cameraR.near = camera.near;
cameraR.far = camera.far;

var cameraVR = new THREE.ArrayCamera([cameraL, cameraR]);
cameraVR.layers.enable(1);
cameraVR.layers.enable(2);

function goodCamera (camera) {
  vrDisplay.getFrameData(frameData);

  cameraL.matrixWorldInverse.fromArray( frameData.leftViewMatrix );
  cameraR.matrixWorldInverse.fromArray( frameData.rightViewMatrix );

  cameraL.projectionMatrix.fromArray( frameData.leftProjectionMatrix );
  cameraR.projectionMatrix.fromArray( frameData.rightProjectionMatrix );

  // HACK @mrdoob
  // https://github.com/w3c/webvr/issues/203

  // cameraVR.projectionMatrix.copy( cameraL.projectionMatrix );

  return cameraVR;
}

var endCamera = null;
function render(a) {
  if (running) {
    vrDisplay.requestAnimationFrame(render);
  }
  endCamera = goodCamera(camera);
  renderer.render(scene, endCamera);
  vrDisplay.submitFrame();
}

var canvas = renderer.domElement;
var running = false;
if(navigator.getVRDisplays){
  navigator.getVRDisplays().then(function(displays) {
    if (displays.length === 0) {return;}
    frameData = new VRFrameData();
    vrDisplay = displays[0];
    console.log('Display found : ');
    console.log(displays);
    // Starting the presentation when the button is clicked: It can only be called in response to a user gesture
    startButton.addEventListener('click', function() {
      vrDisplay.requestPresent([{ source: canvas }]).then(function() {
        running = true;
        vrDisplay.requestAnimationFrame(render);
      });
    });// Starting the presentation when the button is clicked: It can only be called in response to a user gesture
    stopButton.addEventListener('click', function() {
      vrDisplay.exitPresent().then(function(){
        running = false;
      });
    });
  });
} else {
  document.querySelector('.actions').classList.add('is-hidden');
  console.log('Your browser doesn\'t support WebVR yet');
}
