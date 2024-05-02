import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

///////////////////////////
/* __GLOBAL__VARIABLES__ */
///////////////////////////
var scene, renderer;

var geometry, mesh;

var front_camera, lat_camera, top_camera, 
    fixed_ort_camera, fixed_persp_camera, moving_camera, shown_camera;

var orange_material = new THREE.MeshBasicMaterial({ color: 0xd1712c, wireframe: true });
var black_material = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
var red_material = new THREE.MeshBasicMaterial({ color: 0xd1112c, wireframe: true });
var grey_material = new THREE.MeshBasicMaterial({ color: 0x646669, wireframe: true });
var green_material = new THREE.MeshBasicMaterial({ color: 0x4c8535, wireframe: true });
var brown_material = new THREE.MeshBasicMaterial({ color: 0x91470f, wireframe: true });
var blue_material = new THREE.MeshBasicMaterial({ color: 0x5570a3, wireframe: true });
var yellow_material = new THREE.MeshBasicMaterial({ color: 0xa4ad21, wireframe: true });

var materials = [orange_material, black_material, red_material, grey_material,
        green_material, brown_material, blue_material, yellow_material];

var crane;

/* Relevant size values for axis and position of elements */
var base_height = 5;
var lower_tower_height = 20, lower_tower_width = 3;
var turntable_height = 2;
var upper_tower_height = 5, upper_tower_width = 3;
var cabin_height = 3, cabin_width = 2;
var jib_height = 15, jib_radius = 1.7;
var counter_jib_width = 10 ,counter_jib_heigth = 2;
var counter_weight_height = 5, counter_weight_width = 2.8;
var tower_peak_height = 8;
var trolley_height = 2;
var cable_length = 8, cable_radius = 0.1;
var hook_block_height = 2, hook_block_width = 3;
var claw_size = 0.7;
var container_height = 4, container_width = 0.1;

/////////////////////
/* _____SCENE_____ */
/////////////////////
function createScene() {
    'use strict';

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xc3e3dd);

    ///////////////////
    /* Criar objetos */
    ///////////////////
    createCrane(0,0,0);
    createContainer(5, 0, 5);
    createCargo(3,0,3);

    scene.add(new THREE.AxesHelper(20));
    crane.upper_crane.add(new THREE.AxesHelper(20));
    crane.upper_crane.trolley_group.add(new THREE.AxesHelper(20));
    crane.upper_crane.trolley_group.claw_group.add(new THREE.AxesHelper(20));
}


///////////////////////
/* _____CAMERAS_____ */
///////////////////////
function createFrontCamera() {              //////////////////////////////// VER EM CADA PC TAMANHOS MUDAM
    'use strict';
    front_camera = new THREE.OrthographicCamera(-window.innerWidth / 20,
                                                window.innerWidth / 20,
                                                window.innerHeight / 20,
                                                -window.innerHeight / 20);
    front_camera.position.set(0, 15, 100);
    front_camera.lookAt(new THREE.Vector3(0 , 15, 0));
}

function createLatCamera() {                //////////////////////////////// VER EM CADA PC TAMANHOS MUDAM
    'use strict';
    lat_camera = new THREE.OrthographicCamera(-window.innerWidth / 20,
                                              window.innerWidth / 20,
                                              window.innerHeight / 20,
                                              -window.innerHeight / 20);
    lat_camera.position.set(100, 15, 0);
    lat_camera.lookAt(new THREE.Vector3(0 , 15, 0));
}

function createTopCamera() {                //////////////////////////////// VER EM CADA PC TAMANHOS MUDAM
    'use strict';
    top_camera = new THREE.OrthographicCamera(-window.innerWidth / 30,
                                              window.innerWidth / 30,
                                              window.innerHeight / 30,
                                              -window.innerHeight / 30);
    top_camera.position.set(0, 100, 0);
    top_camera.lookAt(scene.position);
}

function createFixedOrthographicCamera() {  //////////////////////////////// VER EM CADA PC TAMANHOS MUDAM
    'use strict';
    fixed_ort_camera = new THREE.OrthographicCamera(-window.innerWidth / 20,
                                                    window.innerWidth / 20,
                                                    window.innerHeight / 20,
                                                    -window.innerHeight / 20);
    fixed_ort_camera.position.set(100, 15, 100);
    fixed_ort_camera.lookAt(new THREE.Vector3(0 , 15, 0));
}

function createFixedPerspectiveCamera() {   //////////////////////////////// VER EM CADA PC TAMANHOS MUDAM
    'use strict';
    fixed_persp_camera = new THREE.PerspectiveCamera(34,
                            (window.innerWidth / window.innerHeight));
    fixed_persp_camera.position.set(100, 15, 100);
    fixed_persp_camera.lookAt(new THREE.Vector3(0 , 15, 0));
}

function createMovingCamera() {
    'use strict';

    moving_camera = new THREE.PerspectiveCamera(70,
                        (window.innerWidth / window.innerHeight));
    moving_camera.position.set(0, -hook_block_height/2, 0);
    moving_camera.lookAt(new THREE.Vector3(0, -hook_block_height, 0));
    crane.upper_crane.trolley_group.claw_group.add(moving_camera);
}

function createAllCameras() {
    createFrontCamera();
    createLatCamera();
    createTopCamera();
    createFixedOrthographicCamera();
    createFixedPerspectiveCamera();
    createMovingCamera();
}

///////////////////////
/* _____CAMERAS_____ */
///////////////////////


/////////////////////
/* CREATE LIGHT(S) */
/////////////////////   NOT NEEDED?

//////////////////////////////
/* __OBJECTS__CRANE__BASE__ */
//////////////////////////////

/** Base da Grua */
function addBase(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(6, base_height, 6);
    mesh = new THREE.Mesh(geometry, brown_material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

/** Torre Inferior */
function addLowerTower(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(lower_tower_width, lower_tower_height, lower_tower_width);
    mesh = new THREE.Mesh(geometry, orange_material);
    mesh.position.set(x, y + (base_height + lower_tower_height) / 2, z);
    obj.add(mesh);
}

///////////////////////////////
/* __OBJECTS__CRANE__UPPER__ */
///////////////////////////////

/** Eixo de Rotação */
function addTurntable(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(2.1, 2.1, turntable_height, 15);
    mesh = new THREE.Mesh(geometry, blue_material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}   

/** Torre Superior */
function addUpperTower(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(3, upper_tower_height, 3);
    mesh = new THREE.Mesh(geometry, orange_material);
    mesh.position.set(x, y + (turntable_height + upper_tower_height) / 2, z);
    obj.add(mesh);
}

/** Cabine */
function addCabin(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(cabin_width, cabin_height, cabin_width);
    mesh = new THREE.Mesh(geometry, black_material);
    mesh.position.set(x, 
                      y + (turntable_height + upper_tower_height) / 2, 
                      z + (lower_tower_width + cabin_width) / 2);
    obj.add(mesh);
}

/** Lança */
function addJib(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(jib_radius, jib_radius, jib_height, 3);
    mesh = new THREE.Mesh(geometry, orange_material);
    mesh.rotation.z = Math.PI / 2;
    mesh.rotation.x = - Math.PI / 2;
    mesh.position.set(x + (lower_tower_width + jib_height) / 2,
                      y + (turntable_height + jib_radius) / 2 + upper_tower_height,
                      z);
    obj.add(mesh);
}

/** Contra-Lança */
function addCounterJib(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(counter_jib_width, counter_jib_heigth, lower_tower_width);
    mesh = new THREE.Mesh(geometry, orange_material);
    mesh.position.set(-(x + (lower_tower_width + counter_jib_width) / 2), 
                        y + (turntable_height + counter_jib_heigth) / 2 + upper_tower_height,
                        z);
    obj.add(mesh);
}

/** Contrapeso */
function addCounterWeight(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(counter_weight_width, counter_weight_height, counter_weight_width);
    mesh = new THREE.Mesh(geometry, grey_material);
    mesh.position.set(-(x + (lower_tower_width + counter_jib_width + counter_weight_width) / 2),
                      y + (turntable_height + counter_jib_heigth - 1) / 2 + upper_tower_height,
                      z);   
    obj.add(mesh);
}

/** Porta-Lança */
function addTowerPeak(obj, x, y, z) {
    'use strict';

    geometry = new THREE.ConeGeometry(1.5, tower_peak_height, 4);
    mesh = new THREE.Mesh(geometry, orange_material);
    mesh.position.set(x, 
                      y + (turntable_height + tower_peak_height) / 2 + upper_tower_height, 
                      z);
    obj.add(mesh);
}

/** Tirante da Lança */
function addLoadLineJ(obj, x, y, z) {
    'use strict';

    var delta = { x: (jib_height-5)/2, y: (tower_peak_height-1.5*jib_radius)/2 };
    var angle = Math.atan((2*delta.x) / (2*delta.y));
    var cable_size = (2*delta.x) / Math.sin(angle);

    geometry = new THREE.CylinderGeometry(cable_radius, cable_radius, cable_size, 6);
    mesh = new THREE.Mesh(geometry, black_material);

    mesh.rotation.z = angle;
    mesh.position.set(x + delta.x,
                      y + delta.y + turntable_height/2 + upper_tower_height + 1.5*jib_radius,
                      z);
    obj.add(mesh);
}

/** Tirante da Contra-Lança */
function addLoadLineCJ(obj, x, y, z) {
    'use strict';

    var delta = { x: (counter_jib_width-5)/2, y: (tower_peak_height-counter_jib_heigth)/2 };
    var angle = Math.atan((2*delta.x) / (2*delta.y));
    var cable_size = (2*delta.x) / Math.sin(angle);

    geometry = new THREE.CylinderGeometry(cable_radius, cable_radius, cable_size, 6);
    mesh = new THREE.Mesh(geometry, black_material);

    mesh.rotation.z = -angle;
    mesh.position.set(x - delta.x, 
                      y + delta.y + turntable_height/2 + upper_tower_height + counter_jib_heigth,
                      z);
    obj.add(mesh);
}

/////////////////////////////////
/* __OBJECTS__CRANE__TROLLEY__ */
/////////////////////////////////

/** Carrinho */
function addTrolley(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(upper_tower_width, trolley_height, upper_tower_width);
    mesh = new THREE.Mesh(geometry, blue_material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

/** Cabo */
function addCable(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(cable_radius, cable_radius, cable_length, 6);
    mesh = new THREE.Mesh(geometry, black_material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

//////////////////////////////
/* __OBJECTS__CRANE__CLAW__ */
//////////////////////////////

/** Bloco do Gancho */
function addHookBlock(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(hook_block_width, hook_block_height, hook_block_width);
    mesh = new THREE.Mesh(geometry, green_material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

/** Dente da Garra */
function addClaw(obj, x, y, z) {
    'use strict';

    geometry = new THREE.TetrahedronGeometry(claw_size);
    mesh = new THREE.Mesh(geometry, black_material);
    mesh.position.set(x, y - hook_block_width / 2 , z);
    obj.add(mesh);
}

/////////////////////////////
/* __OBJECTS__CRANE__ALL__ */
/////////////////////////////

function createUpperGroup(obj, x, y, z) {
    var upper_crane = new THREE.Object3D();
    upper_crane.position.set(x, y, z);

    addTurntable(upper_crane, 0, 0, 0);
    addUpperTower(upper_crane, 0, 0, 0);
    addCabin(upper_crane, 0, 0, 0); 
    addJib(upper_crane, 0, 0, 0);
    addCounterJib(upper_crane, 0, 0, 0);
    addCounterWeight(upper_crane, 0, 0, 0);
    addTowerPeak(upper_crane, 0, 0, 0);
    addLoadLineJ(upper_crane, 0, 0, 0);
    addLoadLineCJ(upper_crane, 0, 0, 0);

    obj.add(upper_crane);
    crane.upper_crane = upper_crane;
}

function createTrolleyGroup(obj, x, y, z) {
    var trolley_group = new THREE.Object3D();
    trolley_group.position.set(x, y, z);
    addTrolley(trolley_group, 0, 0, 0);

    obj.add(trolley_group);
    obj.trolley_group = trolley_group;
}

function createCableGroup(obj, x, y, z) {
    var cable_group = new THREE.Object3D();
    cable_group.position.set(x, y, z);
    addCable(cable_group, 0, 0, 0);
    
    obj.add(cable_group);
    obj.cable_group = cable_group;
}

function createClawGroup(obj, x, y, z) {
    var claw_group = new THREE.Object3D();
    claw_group.position.set(x, y, z);
    addHookBlock(claw_group, 0, 0, 0);
    addClaw(claw_group, 0, 0, hook_block_width/3);
    addClaw(claw_group, hook_block_width/3, 0, 0);
    addClaw(claw_group, 0, 0, -hook_block_width/3);
    addClaw(claw_group, -hook_block_width/3, 0, 0);

    obj.add(claw_group);
    obj.claw_group = claw_group;
}

function createCrane(x, y, z) {
    'use strict';

    crane = new THREE.Object3D();
    crane.userData = { rotate1: 0, rotate2: 0, move1: 0, move2: 0,
                       rotation1: 0, rotation2: 0};

    addBase(crane, 0, base_height/2, 0);
    addLowerTower(crane, 0, base_height/2, 0);
    createUpperGroup(crane, 0, (turntable_height) / 2 + base_height + lower_tower_height, 0);
    createTrolleyGroup(crane.upper_crane, jib_height,
                       upper_tower_height + (turntable_height - trolley_height) / 2, 0);
    createCableGroup(crane.upper_crane.trolley_group,
                     0, - (trolley_height + cable_length) / 2, 0);
    createClawGroup(crane.upper_crane.trolley_group,
                     0, -cable_length-(trolley_height+hook_block_height)/2, 0);

    scene.add(crane);
    crane.position.set(x, y, z);
}

////////////////////////////
/* __OBJECTS__CONTAINER__ */
////////////////////////////

/** Base do Contentor */
function addContainerBase(obj, x, y, z) {
    'use strict';
    
    geometry = new THREE.BoxGeometry(container_height, container_width, container_height);
    mesh = new THREE.Mesh(geometry, red_material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}   

/** Face de frente/trás do Contentor */
function addFBContainerFace(obj, x, y, z) {  
    'use strict';
    
    geometry = new THREE.BoxGeometry(container_height, container_height, container_width);
    mesh = new THREE.Mesh(geometry, red_material);
    mesh.position.set(x, y + container_height / 2, z);
    obj.add(mesh);
}

/** Face do lado direito/esquerdo do Contentor */
function addLRContainerFace(obj, x, y, z) {  
    'use strict';

    geometry = new THREE.BoxGeometry(container_width, container_height, container_height);
    mesh = new THREE.Mesh(geometry, red_material);
    mesh.position.set(x, y + container_height / 2, z);
    obj.add(mesh);
}

function createContainer(x, y, z) {
    'use strict';
    var container = new THREE.Object3D();
    
    addContainerBase(container, x, y, z);
    addFBContainerFace(container, x, y, z + 2);     // front
    addFBContainerFace(container, x, y, z - 2);     // back
    addLRContainerFace(container, x + 2, y, z);     // left
    addLRContainerFace(container, x - 2, y, z);     // right

    scene.add(container);
    container.position.set(x, y, z);
}

////////////////////////
/* __OBJECTS__CARGO__ */
////////////////////////

function addCubicCargo(obj, x, y, z) {
    'use strict';
    
    geometry = new THREE.BoxGeometry(1, 1, 1);
    mesh = new THREE.Mesh(geometry, yellow_material);
    mesh.position.set(x, y + 1/2, z);
    obj.add(mesh);
}

function addTorusCargo(obj, x, y, z) {
    'use strict';

    geometry = new THREE.TorusGeometry(0.7, 0.5, 10, 100);
    mesh = new THREE.Mesh(geometry, yellow_material);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(x, y + 1/2, z);
    obj.add(mesh);
}

function addIcosahedronCargo(obj, x, y, z) {
    'use strict';

    geometry = new THREE.IcosahedronGeometry(1, 0);
    mesh = new THREE.Mesh(geometry, yellow_material);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(x, y + 1/2, z);
    obj.add(mesh);
}

function createCargo(x, y, z) {
    'use strict';

    var cargo = new THREE.Object3D();
    addCubicCargo(cargo, x - 3, y, z);
    addCubicCargo(cargo, x, y, z + 2);
    addTorusCargo(cargo, x, y, z + 5);
    addIcosahedronCargo(cargo, x + 4, y, z - 2);

    scene.add(cargo);
    cargo.position.set(x, y, z);
}

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

    //THREE.Clock           usar isto
    
    /* Rotation angle teta1 -> rotate upper crane */
    if (crane.userData.rotate1) {
        crane.userData.rotation1 += Math.PI * 0.005 * crane.userData.rotate1;
        crane.upper_crane.rotation.y = crane.userData.rotation1;
    }

    var step = 0.05;
    /* Displacement delta1 -> move trolley */
    if (crane.userData.move1 == -1 && crane.upper_crane.trolley_group.position.x >= lower_tower_width*1.5) {
        crane.upper_crane.trolley_group.position.x -= step;
    } else if (crane.userData.move1 == 1 && crane.upper_crane.trolley_group.position.x <= jib_height) {
        crane.upper_crane.trolley_group.position.x += step;
    }

    /* Displacement delta2 -> move hook block (ajust cable  size) */
    if (crane.userData.move2 == -1 && crane.upper_crane.trolley_group.claw_group.position.y >= -28.5) {
        crane.upper_crane.trolley_group.claw_group.position.y -= step;
        crane.upper_crane.trolley_group.cable_group.position.y -= step/2;
        crane.upper_crane.trolley_group.cable_group.scale.y += step/8;
    } else if (crane.userData.move2 == 1 && crane.upper_crane.trolley_group.claw_group.position.y <= -4) {
        crane.upper_crane.trolley_group.claw_group.position.y += step;
        crane.upper_crane.trolley_group.cable_group.position.y += step/2;
        crane.upper_crane.trolley_group.cable_group.scale.y -= step/8;
    }

    /* Rotation angle teta2 -> rotate claws */ //TODO
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
    updateKeyDisplay('1', true);
    render();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize); 
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';

    update();
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
        fixed_persp_camera.aspect = (window.innerWidth / window.innerHeight);
        fixed_persp_camera.updateProjectionMatrix();
    }
}


///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';

    var keys = ['1', '2', '3', '4', '5', '6'];

    switch (e.keyCode) {
    case 49: //1
        shown_camera = front_camera;
        keys.forEach(key => {
            updateKeyDisplay(key, (key == '1') ? true : false);
        });
        break;
    case 50: //2
        shown_camera = lat_camera;
        keys.forEach(key => {
            updateKeyDisplay(key, (key == '2') ? true : false);
        });
        break;
    case 51: //3
        shown_camera = top_camera;
        keys.forEach(key => {
            updateKeyDisplay(key, (key == '3') ? true : false);
        });
        break;
    case 52: //4
        shown_camera = fixed_ort_camera;
        keys.forEach(key => {
            updateKeyDisplay(key, (key == '4') ? true : false);
        });
        break;
    case 53: //5
        shown_camera = fixed_persp_camera;
        keys.forEach(key => {
            updateKeyDisplay(key, (key == '5') ? true : false);
        });
        break;
    case 54: //6
        shown_camera = moving_camera;
        keys.forEach(key => {
            updateKeyDisplay(key, (key == '6') ? true : false);
        });
        break;
    case 55: //7
        materials.forEach(function (material) {
            material.wireframe = !material.wireframe;
        });
        crane.userData.toggle7 = !crane.userData.toggle7;
        updateKeyDisplay('7', crane.userData.toggle7);
        break;
        
    case 81: //Q
    case 113: //q
        if(!crane.userData.rotate1){
            crane.userData.rotate1 = 1;
            updateKeyDisplay('Q', true);
        }
        break;
    case 65: //A
    case 97: //a
        if(!crane.userData.rotate1){
            crane.userData.rotate1 = -1;
            updateKeyDisplay('A', true);
        }
        break;
    case 87: //W
    case 119: //w
        if(!crane.userData.move1){
            crane.userData.move1 = 1;
            updateKeyDisplay('W', true);
        }
        break;
    case 83: //S
    case 115: //s
        if(!crane.userData.move1){
            crane.userData.move1 = -1;
            updateKeyDisplay('S', true);
        }
        break;
    case 69: //E
    case 101: //e
        if(!crane.userData.move2){
            crane.userData.move2 = 1;
            updateKeyDisplay('E', true);
        }
        break;
    case 68: //D
    case 100: //d
        if(!crane.userData.move2){
            crane.userData.move2 = -1;  
            updateKeyDisplay('D', true);      
        }
        break;
    case 82: //R
    case 114: //r
        if(!crane.userData.rotate2){
            crane.userData.rotate2 = 1;
            updateKeyDisplay('R', true);
        }
        break;
    case 70: //F
    case 102: //f
        if(!crane.userData.rotate2){
            crane.userData.rotate2 = -1;
            updateKeyDisplay('F', true);
        }
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
        if (crane.userData.rotate1 == 1){
            crane.userData.rotate1 = 0;
            updateKeyDisplay('Q', false);
        }
        break;
    case 65: //A
    case 97: //a
        if (crane.userData.rotate1 == -1){
            crane.userData.rotate1 = 0;
            updateKeyDisplay('A', false);
        }
        break;
    case 87: //W
    case 119: //w
        if (crane.userData.move1 == 1){
            crane.userData.move1 = 0;
            updateKeyDisplay('W', false);
        }
        break;
    case 83: //S
    case 115: //s
        if (crane.userData.move1 == -1){
            crane.userData.move1 = 0;
            updateKeyDisplay('S', false);
        }
        break;
    case 69: //E
    case 101: //e
        if (crane.userData.move2 == 1){
            crane.userData.move2 = 0;
            updateKeyDisplay('E', false);
        }
        break;
    case 68: //D
    case 100: //d
        if (crane.userData.move2 == -1){
            crane.userData.move2 = 0;
            updateKeyDisplay('D', false);
        }
        break;
    case 82: //R
    case 114: //r
        if (crane.userData.rotate2 == 1){
            crane.userData.rotate2 = 0;
            updateKeyDisplay('R', false);
        }
        break;
    case 70: //F
    case 102: //f
        if (crane.userData.rotate2 == -1){
            crane.userData.rotate2 = 0;
            updateKeyDisplay('F', false);
        }
        break;
    }
}

function updateKeyDisplay(key, isActive) {
    var cell = document.getElementById('key-' + key);
    if (isActive) {
        cell.classList.add('key-active');
    } else {
        cell.classList.remove('key-active');
    }
}


init();
animate();