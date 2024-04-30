import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
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
        green_material, brown_material, blue_material];

var cameras = [];

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

var base_axis = new THREE.Vector3(0, base_height/2, 0);
var turntable_axis = new THREE.Vector3(0, (turntable_height) / 2 + base_height +
                                       lower_tower_height, 0);

var trolley_axis = new THREE.Vector3(jib_height,
                                     upper_tower_height + (turntable_height - trolley_height) / 2,
                                     0);

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xc3e3dd);

    
    scene.add(new THREE.AxesHelper(20));

    ///////////////////
    /* Criar objetos */
    ///////////////////
    createCrane(0,0,0);
    createContainer(5, 0, 5);
    createCargo(3,0,3);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createFrontCamera() {              //////////////////////////////// VER EM CADA PC TAMANHOS MUDAM
    'use strict';
    front_camera = new THREE.OrthographicCamera(-window.innerWidth / 19,
                                                window.innerWidth / 19,
                                                window.innerHeight / 19,
                                                -window.innerHeight / 19);
    front_camera.position.set(0, 0, 100);
    front_camera.lookAt(scene.position);
}

function createLatCamera() {                //////////////////////////////// VER EM CADA PC TAMANHOS MUDAM
    'use strict';
    lat_camera = new THREE.OrthographicCamera(-window.innerWidth / 19,
                                              window.innerWidth / 19,
                                              window.innerHeight / 19,
                                              -window.innerHeight / 19);
    lat_camera.position.set(100, 0, 0);
    lat_camera.lookAt(scene.position);
}

function createTopCamera() {                //////////////////////////////// VER EM CADA PC TAMANHOS MUDAM
    'use strict';
    top_camera = new THREE.OrthographicCamera(-window.innerWidth / 40,
                                              window.innerWidth / 40,
                                              window.innerHeight / 40,
                                              -window.innerHeight / 40);
    top_camera.position.set(0, 100, 0);
    top_camera.lookAt(scene.position);
}

function createFixedOrthographicCamera() {  //////////////////////////////// VER EM CADA PC TAMANHOS MUDAM
    'use strict';
    fixed_ort_camera = new THREE.OrthographicCamera(-window.innerWidth / 19,
                                                    window.innerWidth / 19,
                                                    window.innerHeight / 19,
                                                    -window.innerHeight / 19);
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

    moving_camera = new THREE.PerspectiveCamera(70,
                    (window.innerWidth / window.innerHeight));
    /* var position = crane.upper_crane.trolley_group.position
    crane.upper_crane.trolley_group.claw_group.position; */
    moving_camera.position.set(0,-1,0);
    moving_camera.lookAt(new THREE.Vector3(0,-2,0));
    crane.upper_crane.trolley_group.claw_group.add(moving_camera);
}   

function createAllCameras() {
    createFrontCamera();
    createLatCamera();
    createTopCamera();
    createFixedOrthographicCamera();
    createFixedPerspectiveCamera();
    createMovingCamera();
    cameras.push(front_camera, lat_camera, top_camera, fixed_ort_camera, fixed_persp_camera, moving_camera);
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
    mesh.position.set(x, 
                      y + (base_height / 2) + (lower_tower_height / 2), 
                      z);
    obj.add(mesh);
}

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
    mesh.position.set(x, 
                      y + (turntable_height + upper_tower_height) / 2, 
                      z);
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
    mesh.position.set(-(x + (lower_tower_width+counter_jib_width+counter_weight_width) / 2),
                      y + (turntable_height + counter_jib_heigth - 1) / 2 + upper_tower_height,
                      z);   
    obj.add(mesh);
}

/** Porta-Lança */
function addTowerPeak(obj, x, y, z) {
    'use strict';

    geometry = new THREE.ConeGeometry(1.6, tower_peak_height, 4);
    mesh = new THREE.Mesh(geometry, orange_material);
    mesh.position.set(x, 
                      y + (turntable_height + tower_peak_height) / 2 + upper_tower_height, 
                      z);
    obj.add(mesh);
}

/** Tirante da Lança */
function addLoadLineJ(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(cable_radius, cable_radius, 12, 6);
    mesh = new THREE.Mesh(geometry, black_material);
    mesh.rotation.z = Math.PI * 0.37;
    mesh.position.set(x + 5.7, 
                      y + (turntable_height + tower_peak_height) / 2 + upper_tower_height + 1.2, 
                      z);
    obj.add(mesh);
}

/** Tirante da Contra-Lança */
function addLoadLineCJ(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(cable_radius, cable_radius, 8, 6);
    mesh = new THREE.Mesh(geometry, black_material);
    mesh.rotation.z = Math.PI / (4/3);
    mesh.position.set(x - 3, 
                      y + (turntable_height + tower_peak_height) / 2 + upper_tower_height + 1, 
                      z);
    obj.add(mesh);
}

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
    mesh.position.set(x, y - hook_block_width/2 , z);
    obj.add(mesh);
}

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

    container.position.x = x;
    container.position.y = y;
    container.position.z = z;
}

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

function addCosahedronCargo(obj, x, y, z) {
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
    addCosahedronCargo(cargo, x + 4, y, z - 2);

    scene.add(cargo);

    cargo.position.x = x;
    cargo.position.y = y;
    cargo.position.z = z;
}

function createCrane(x, y, z) {
    'use strict';

    crane = new THREE.Object3D();
    crane.userData = { rotate1: 0, rotate2: 0, move1: 0, move2: 0,
                       rotation1: 0, rotation2: 0, delta1: 0, delta2: 0};

    addBase(crane, base_axis.x, base_axis.y, base_axis.z);
    addLowerTower(crane, base_axis.x, base_axis.y, base_axis.z);
    
    var upper_crane = new THREE.Object3D();
    upper_crane.position.set(turntable_axis.x, turntable_axis.y, turntable_axis.z);
    addTurntable(upper_crane, 0, 0, 0);
    addUpperTower(upper_crane, 0, 0, 0);
    addCabin(upper_crane, 0, 0, 0); 
    addJib(upper_crane, 0, 0, 0);
    addCounterJib(upper_crane, 0, 0, 0);
    addCounterWeight(upper_crane, 0, 0, 0);
    addTowerPeak(upper_crane, 0, 0, 0);
    addLoadLineJ(upper_crane, 0, 0, 0);
    addLoadLineCJ(upper_crane, 0, 0, 0);

    var trolley_group = new THREE.Object3D();
    trolley_group.position.set(trolley_axis.x, trolley_axis.y, trolley_axis.z);
    addTrolley(trolley_group, 0, 0, 0);

    var cable_group = new THREE.Object3D();
    cable_group.position.set(0, - (trolley_height + cable_length) / 2, 0);
    addCable(cable_group, 0, 0, 0);

    var claw_group = new THREE.Object3D();
    claw_group.position.set(0, -cable_length-(trolley_height+hook_block_height)/2, 0);
    addHookBlock(claw_group, 0, 0, 0);
    addClaw(claw_group, 0, 0, hook_block_width/3);
    addClaw(claw_group, hook_block_width/3, 0, 0);
    addClaw(claw_group, 0, 0, -hook_block_width/3);
    addClaw(claw_group, -hook_block_width/3, 0, 0);

    trolley_group.add(claw_group);
    trolley_group.add(cable_group);
    upper_crane.add(trolley_group);
    crane.add(upper_crane);

    trolley_group.claw_group = claw_group;
    trolley_group.cable_group = cable_group;
    upper_crane.trolley_group = trolley_group;
    crane.upper_crane = upper_crane;

    var turnt_axis = new THREE.AxesHelper(20);
    upper_crane.add(turnt_axis);

    var trol_axis = new THREE.AxesHelper(20);
    trolley_group.add(trol_axis);

    var claw_axis_helper = new THREE.AxesHelper(20);
    claw_group.add(claw_axis_helper);

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

    if (crane.userData.rotate1) {
        crane.userData.rotation1 += Math.PI * 0.005 * crane.userData.rotate1;
        crane.upper_crane.rotation.y = crane.userData.rotation1;
    }

    var step = 0.05;
    if (crane.userData.move1 == -1 && crane.upper_crane.trolley_group.position.x >= lower_tower_width*1.5) {
        crane.upper_crane.trolley_group.position.x -= step;
    } else if (crane.userData.move1 == 1 && crane.upper_crane.trolley_group.position.x <= trolley_axis.x) {
        crane.upper_crane.trolley_group.position.x += step;
    }

    
    if (crane.userData.move2 == -1 && crane.upper_crane.trolley_group.claw_group.position.y >= -28.5) {
        crane.upper_crane.trolley_group.claw_group.position.y -= step;
        crane.upper_crane.trolley_group.cable_group.position.y -= step/2;
        crane.upper_crane.trolley_group.cable_group.scale.y += step/8;
    } else if (crane.userData.move2 == 1 && crane.upper_crane.trolley_group.claw_group.position.y <= -4) {
        crane.upper_crane.trolley_group.claw_group.position.y += step;
        crane.upper_crane.trolley_group.cable_group.position.y += step/2;
        crane.upper_crane.trolley_group.cable_group.scale.y -= step/8;
    }
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
        shown_camera = moving_camera;
        break;
    case 55: //7
        materials.forEach(function (material) {
            material.wireframe = !material.wireframe;
        });
        break;
        
    case 81: //Q
    case 113: //q
        if(!crane.userData.rotate1)
            crane.userData.rotate1 = 1;
        break;
    case 65: //A
    case 97: //a
        if(!crane.userData.rotate1)
            crane.userData.rotate1 = -1;
        break;

    case 87: //W
    case 119: //w
        if(!crane.userData.move1)
            crane.userData.move1 = 1;
        break;
    case 83: //S
    case 115: //s
        if(!crane.userData.move1)
            crane.userData.move1 = -1;
        break;
    case 69: //E
    case 101: //e
        if(!crane.userData.move2)
            crane.userData.move2 = 1;
        break;
    case 68: //D
    case 100: //d
        if(!crane.userData.move2)
            crane.userData.move2 = -1;        
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
        if (crane.userData.rotate1 == 1)
            crane.userData.rotate1 = 0;
        break;
    case 65: //A
    case 97: //a
        if (crane.userData.rotate1 == -1)
            crane.userData.rotate1 = 0;
        break;

    case 87: //W
    case 119: //w
        if (crane.userData.move1 == 1)
            crane.userData.move1 = 0;
        break;
    case 83: //S
    case 115: //s
        if (crane.userData.move1 == -1)
            crane.userData.move1 = 0;
        break;

    case 69: //E
    case 101: //e
        if (crane.userData.move2 == 1)
            crane.userData.move2 = 0;
        break;
    case 68: //D
    case 100: //d
        if (crane.userData.move2 == -1)
            crane.userData.move2 = 0;
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