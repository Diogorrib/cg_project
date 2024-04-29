import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var scene, renderer;

var geometry, material, mesh;

var front_camera, lat_camera, top_camera;

var fixed_ort_camera, fixed_perp_camera, moving_camera;

var shown_camera;

var cameras = [];

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';

    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(100));

    ///////////////////
    /* Criar objetos */
    ///////////////////
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createFrontCamera() {
    'use strict';
    front_camera = new THREE.OrthographicCamera(-(window.innerWidth / window.innerHeight),
                                                (window.innerWidth / window.innerHeight),
                                                1,
                                                -1,
                                                0.1,
                                                1000);
    front_camera.position.set(0, 0, 50);
    front_camera.lookAt(scene.position);
}

function createLatCamera() {
    'use strict';
    lat_camera = new THREE.OrthographicCamera(-(window.innerWidth / window.innerHeight),
                                              (window.innerWidth / window.innerHeight),
                                              1,
                                              -1,
                                              0.1,
                                              1000);
    lat_camera.position.set(50, 0, 0);
    lat_camera.lookAt(scene.position);
}

function createTopCamera() {
    'use strict';
    top_camera = new THREE.OrthographicCamera(-(window.innerWidth / window.innerHeight),
                                              (window.innerWidth / window.innerHeight),
                                              1,
                                              -1,
                                              0.1,
                                              1000);
    top_camera.position.set(0, 120, 0);
    top_camera.lookAt(scene.position);
}

function createFixedOrthographicCamera() {
    'use strict';
    fixed_ort_camera = new THREE.OrthographicCamera(-(window.innerWidth / window.innerHeight),
                                                    (window.innerWidth / window.innerHeight),
                                                    1,
                                                    -1,
                                                    0.1,
                                                    1000);
    fixed_ort_camera.position.set(50, 20, 50);
    fixed_ort_camera.lookAt(scene.position);
}

function createFixedPrespectiveCamera() {
    'use strict';
    fixed_perp_camera = new THREE.PerspectiveCamera(-(window.innerWidth / window.innerHeight)*10,
                                                    (window.innerWidth / window.innerHeight)*10,
                                                    10,
                                                    1000);
    fixed_perp_camera.position.set(50, 20, 50);
    fixed_perp_camera.lookAt(scene.position);
}

function createMovingCamera() {
    'use strict';
    //// TODO
}

function createAllCameras() {
    createFrontCamera();
    createLatCamera();
    createTopCamera();
    createFixedOrthographicCamera();
    createFixedPrespectiveCamera();
    //createMovingCamera();
    cameras.push(front_camera, lat_camera, top_camera, fixed_ort_camera, fixed_perp_camera);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////  END


/////////////////////
/* CREATE LIGHT(S) */
/////////////////////   NOT NEEDED?

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

/** Base da Grua */
function addBase(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(6, 5, 6);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

/** Torre Inferior */
function addLowerTower(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(3, 20, 3);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y + (6/2) + (20/2), z);
    obj.add(mesh);
}

/** Eixo de Rotação */
function addTurntable(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(3.2, 2, 3.2);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y + 26, z);
    obj.add(mesh);
}

/** Torre Superior */
function addUpperTower(obj, x, y, z) {
}

/** Cabine */
function addCabin(obj, x, y, z) {
}

/** Lança */
function addJib(obj, x, y, z) {
}

/** Contra-Lança */
function addCounterJib(obj, x, y, z) {
}

/** Contrapeso */
function addCounterWeight(obj, x, y, z) {
}

/** Porta-Lança */
function addTowerPeak(obj, x, y, z) {
}

/** Tirante da Lança */
function addLoadLineJ(obj, x, y, z) {
}

/** Tirante da Contra-Lança */
function addLoadLineCJ(obj, x, y, z) {
}

/** Carrinho */
function addTrolley(obj, x, y, z) {
}

/** Cabo */
function addCable(obj, x, y, z) {
}

/** Bloco do Gancho */
function addHookBlock(obj, x, y, z) {
}

/** Dente da Garra */
function createClaw(obj, x, y, z) {
}

function createCrane(x, y, z) {
    'use strict';

    var crane = new THREE.Object3D();

    addBase(crane, 0, 0, 0);
    addLowerTower(crane, 0, 0, 0);
    addTurntable(crane, 0, 0, 0);
    /* addUpperTower(crane, 0, 0, 0);
    addCabin(crane, 0, 0, 0);
    addJib(crane, 0, 0, 0);
    addCounterJib(crane, 0, 0, 0);
    addCounterWeight(crane, 0, 0, 0);
    addTowerPeak(crane, 0, 0, 0);
    addLoadLineJ(crane, 0, 0, 0);
    addLoadLineCJ(crane, 0, 0, 0);
    addTrolley(crane, 0, 0, 0);
    addCable(crane, 0, 0, 0);
    addHookBlock(crane, 0, 0, 0);
    createClaw(crane, 0, 0, 0); */
}
////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////    END

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(){
    'use strict';

}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(){
    'use strict';

}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';

}

/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';
    renderer.render(scene, shown_camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createAllCameras();

    shown_camera = front_camera;
    render();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize); 
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';
    
    render();

    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        cameras.forEach(camera => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';

    switch (e.keyCode) {
    case 49: //1
        shown_camera = front_camera;
        break;
    case 50: //2
        shown_camera = lat_camera;
        break;
    case 51: //3
        shown_camera = top_camera;
        break;
    case 52: //4
        shown_camera = fixed_ort_camera;
        break;
    case 53: //5
        shown_camera = fixed_perp_camera;
        break;
    case 54: //6
        shown_camera = moving_camera;  
        break;

    case 81: //Q
    case 113: //q
        //TODO
        break;
    case 65: //A
    case 97: //a
        //TODO
        break;

    case 87: //W
    case 119: //w
        //TODO
        break;
    case 83: //S
    case 115: //s
        //TODO
        break;

    case 69: //E
    case 101: //e
        //TODO
        break;
    case 68: //D
    case 100: //d
        //TODO
        break;
    
    case 82: //R
    case 114: //r
        //TODO
        break;
    case 70: //F
    case 102: //f
        //TODO
        break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';

    switch (e.keyCode) {
    case 81: //Q
    case 113: //q
        //TODO
        break;
    case 65: //A
    case 97: //a
        //TODO
        break;

    case 87: //W
    case 119: //w
        //TODO
        break;
    case 83: //S
    case 115: //s
        //TODO
        break;

    case 69: //E
    case 101: //e
        //TODO
        break;
    case 68: //D
    case 100: //d
        //TODO
        break;
    
    case 82: //R
    case 114: //r
        //TODO
        break;
    case 70: //F
    case 102: //f
        //TODO
        break;
    }
}

init();
animate();