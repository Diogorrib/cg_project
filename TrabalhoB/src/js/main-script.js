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

var fixed_ort_camera, fixed_persp_camera, moving_camera;

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
    createCrane(0,0,0);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createFrontCamera() {              //////////////////////////////// VER EM CADA PC TAMANHOS MUDAM
    'use strict';
    front_camera = new THREE.OrthographicCamera(-window.innerWidth / 25,
                                                window.innerWidth / 25,
                                                window.innerHeight / 25,
                                                -window.innerHeight / 25);
    front_camera.position.set(0, 0, 100);
    front_camera.lookAt(scene.position);
}

function createLatCamera() {                //////////////////////////////// VER EM CADA PC TAMANHOS MUDAM
    'use strict';
    lat_camera = new THREE.OrthographicCamera(-window.innerWidth / 25,
                                              window.innerWidth / 25,
                                              window.innerHeight / 25,
                                              -window.innerHeight / 25);
    lat_camera.position.set(100, 0, 0);
    lat_camera.lookAt(scene.position);
}

function createTopCamera() {                //////////////////////////////// VER EM CADA PC TAMANHOS MUDAM
    'use strict';
    top_camera = new THREE.OrthographicCamera(-window.innerWidth / 80,
                                              window.innerWidth / 80,
                                              window.innerHeight / 80,
                                              -window.innerHeight / 80);
    top_camera.position.set(0, 200, 0);
    top_camera.lookAt(scene.position);
}

function createFixedOrthographicCamera() {  //////////////////////////////// VER EM CADA PC TAMANHOS MUDAM
    'use strict';
    fixed_ort_camera = new THREE.OrthographicCamera(-window.innerWidth / 25,
                                                    window.innerWidth / 25,
                                                    window.innerHeight / 25,
                                                    -window.innerHeight / 25);
    fixed_ort_camera.position.set(100, 0, 100);
    fixed_ort_camera.lookAt(scene.position);
}

function createFixedPerspectiveCamera() {   //////////////////////////////// VER EM CADA PC TAMANHOS MUDAM
    'use strict';
    fixed_persp_camera = new THREE.PerspectiveCamera(32,
                                                    (window.innerWidth / window.innerHeight));
    fixed_persp_camera.position.set(100, 0, 100);
    fixed_persp_camera.lookAt(scene.position);
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
    createFixedPerspectiveCamera();
    //createMovingCamera();
    cameras.push(front_camera, lat_camera, top_camera, fixed_ort_camera, fixed_persp_camera);
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
    mesh.position.set(x, y + (5/2) + (20/2), z);
    obj.add(mesh);
}

/** Eixo de Rotação */
function addTurntable(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(2.1, 2.1, 2, 15);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y + (5/2) + (20) + (2/2), z);
    obj.add(mesh);
}   

/** Torre Superior */
function addUpperTower(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(3, 5, 3);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y + (5/2) + (20) + (2) + (5/2), z);
    obj.add(mesh);
}

/** Cabine */
function addCabin(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(2, 3, 2);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y + (5/2) + (20) + (2) + (5/2), z + (5/2));
    obj.add(mesh);
}

/** Lança */
function addJib(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(1.6, 1.6, 15, 3);
    mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.z = Math.PI / 2;
    mesh.rotation.x = - Math.PI / 2;
    mesh.position.set(x + (3/2) + (15/2), y + (5/2) + (20) + (2) + (5) + (1.6/2), z);
    obj.add(mesh);
}

/** Contra-Lança */
function addCounterJib(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(10, 2, 3);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(-(x + (3/2) + (10/2)), y + (5/2) + (20) + (2) + (5) + (2/2), z);
    obj.add(mesh);
}

/** Contrapeso */
function addCounterWeight(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(3, 5, 3);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(-(x + (3/2) + (10/2) + (3/2)), y + (5/2) + (20) + (2) + (5) + (1.6/2) - (0.5), z);
    obj.add(mesh);
}23

/** Porta-Lança */
function addTowerPeak(obj, x, y, z) {
    'use strict';

    geometry = new THREE.ConeGeometry(1.6, 8, 4);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y + (8/2) + (20) + (2) + (5) + (5/2), z);
    obj.add(mesh);
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

    material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    addBase(crane, 0, 0, 0);
    addLowerTower(crane, 0, 0, 0);
    addTurntable(crane, 0, 0, 0);
    addUpperTower(crane, 0, 0, 0);
    addCabin(crane, 0, 0, 0); 
    addJib(crane, 0, 0, 0);
    addCounterJib(crane, 0, 0, 0);
    addCounterWeight(crane, 0, 0, 0);
    addTowerPeak(crane, 0, 0, 0);
    //addLoadLineJ(crane, 0, 0, 0);
    //addLoadLineCJ(crane, 0, 0, 0);
    //addTrolley(crane, 0, 0, 0);
    //addCable(crane, 0, 0, 0);
    //addHookBlock(crane, 0, 0, 0);
    //createClaw(crane, 0, 0, 0);

    scene.add(crane);

    crane.position.x = x;
    crane.position.y = y;
    crane.position.z = z;
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

    shown_camera = fixed_persp_camera;
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
            //camera.aspect = window.innerWidth / window.innerHeight;   //TODO
            //camera.updateProjectionMatrix();                          // each camera needs a specific width, height, aspect...
                                                                        // front == lat == ort != top !== persp
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
        shown_camera = fixed_persp_camera;
        break;
    case 54: //6
        //shown_camera = moving_camera;
        break;
    case 55: //7
        scene.traverse(function (node) {
            if (node instanceof THREE.Mesh) {
                node.material.wireframe = !node.material.wireframe;
            }
        });
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