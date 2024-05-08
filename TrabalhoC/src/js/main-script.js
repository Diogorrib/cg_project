import * as THREE from 'three';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var scene, renderer, clock;

var front_camera, lat_camera, top_camera, 
    fixed_ort_camera, fixed_persp_camera, shown_camera;

var material_cylinder = new THREE.MeshBasicMaterial({ color: 0x503C3C, wireframe: false });
var material_outer_ring = new THREE.MeshBasicMaterial({ color: 0xEAD8C0, wireframe: false });
var material_middle_ring = new THREE.MeshBasicMaterial({ color: 0xD1BB9E, wireframe: false });
var material_inner_ring = new THREE.MeshBasicMaterial({ color: 0xA79277, wireframe: false });
var material_sky_dome = new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide });

var materials = [material_cylinder, material_outer_ring, material_middle_ring, material_inner_ring, material_sky_dome];
var carousel, innerGroup, middleGroup, outerGroup, skyDome;

/* Relevant size values for axis and position of elements */
var cylinder_height = 20, cylinder_radius = 5;
var ring_height = 1;
var inner_ring_inner_radius = 5, inner_ring_outer_radius = 10;
var middle_ring_inner_radius = 10, middle_ring_outer_radius = 15;
var outer_ring_inner_radius = 15, outer_ring_outer_radius = 20;
var sky_dome_radius = 50;

var isAnimatingInnerRing = false;
var isAnimatingMiddleRing = false;
var isAnimatingOuterRing = false;
var animationInnerDirection = 1;
var animationMiddleDirection = 1;
var animationOuterDirection = 1;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(35));

    createCarousel(0,0,0);
    createSkyDome(0,0,0);

    createAmbientLight();
    createGlobalLight();

    innerGroup.add(new THREE.AxesHelper(35));
    middleGroup.add(new THREE.AxesHelper(35));
    outerGroup.add(new THREE.AxesHelper(35));
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createFrontCamera() {
    'use strict';
    front_camera = new THREE.OrthographicCamera(-window.innerWidth / 20,
                                                window.innerWidth / 20,
                                                window.innerHeight / 20,
                                                -window.innerHeight / 20);
    front_camera.position.set(0, 0, 100);
    front_camera.lookAt(scene.position);
}

function createLatCamera() {
    'use strict';
    lat_camera = new THREE.OrthographicCamera(-window.innerWidth / 20,
                                              window.innerWidth / 20,
                                              window.innerHeight / 20,
                                              -window.innerHeight / 20);
    lat_camera.position.set(100, 0, 0);
    lat_camera.lookAt(scene.position);
}

function createTopCamera() {
    'use strict';
    top_camera = new THREE.OrthographicCamera(-window.innerWidth / 30,
                                              window.innerWidth / 30,
                                              window.innerHeight / 30,
                                              -window.innerHeight / 30);
    top_camera.position.set(0, 100, 0);
    top_camera.lookAt(scene.position);
}

function createFixedOrthographicCamera() {
    'use strict';
    fixed_ort_camera = new THREE.OrthographicCamera(-window.innerWidth / 20,
                                                    window.innerWidth / 20,
                                                    window.innerHeight / 20,
                                                    -window.innerHeight / 20);
    fixed_ort_camera.position.set(20, 30, 20);
    fixed_ort_camera.lookAt(scene.position);
}

function createFixedPerspectiveCamera() {
    'use strict';
    fixed_persp_camera = new THREE.PerspectiveCamera(34,
                            (window.innerWidth / window.innerHeight));
    fixed_persp_camera.position.set(60, 60, 50);
    fixed_persp_camera.lookAt(scene.position);
}

function createAllCameras() {
    createFrontCamera();
    createLatCamera();
    createTopCamera();
    createFixedOrthographicCamera();
    createFixedPerspectiveCamera();
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function createAmbientLight() {
    'use strict';

    const ambientLight = new THREE.AmbientLight(0xFFA500, 1);
    scene.add(ambientLight);
}

function createGlobalLight() {
    'use strict';

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 100, 100);
    scene.add(directionalLight);

    // Helper to visualize the light
    const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
    scene.add(directionalLightHelper);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function addCylinder(obj, x, y, z) {
    'use strict';

    const shape = new THREE.Shape();
    shape.moveTo(cylinder_radius, 0);
    shape.absarc(0, 0, cylinder_radius, 0, Math.PI * 2, false);

    const extrudeSettings = {
        steps: 1,
        depth: cylinder_height,
        curveSegments: 100,
        extrudePath: new THREE.LineCurve3(new THREE.Vector3(0, -cylinder_height/2, 0), new THREE.Vector3(0, cylinder_height/2, 0)) 
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var mesh = new THREE.Mesh(geometry, material_cylinder);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addRingAux(innerRadius, outerRadius, color, x, y, z) {
    'use strict';

    // Define the shape of the ring
    var shape = new THREE.Shape();

    // Draw the outer circle
    shape.moveTo(outerRadius, 0);
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    // Draw the hole
    var holePath = new THREE.Path();
    holePath.moveTo(innerRadius, 0);
    holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);

    shape.holes.push(holePath);

    var extrudeSettings = {
        depth: ring_height, 
        bevelEnabled: false,
        curveSegments: 100
    };

    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var ring = new THREE.Mesh(geometry, color);

    // Rotate and position the ring
    ring.rotation.x = - Math.PI / 2;
    ring.position.set(0, - ring_height / 2, 0);

    return ring;
}

function addInnerRing(obj, x, y, z) {
    'use strict';

    var ring = addRingAux(inner_ring_inner_radius, inner_ring_outer_radius, 
                material_inner_ring, x, y, z);

    obj.add(ring);
}

function addMiddleRing(obj, x, y, z) {
    'use strict';

    var ring = addRingAux(middle_ring_inner_radius, middle_ring_outer_radius, 
                material_middle_ring, x, y, z);
    
    obj.add(ring);
}

function addOuterRing(obj, x, y, z) {
    'use strict';
    
    var ring = addRingAux(outer_ring_inner_radius, outer_ring_outer_radius, 
                material_outer_ring, x, y, z);

    obj.add(ring);
}

function createInnerGroup(obj, x, y, z) {
    'use strict';

    innerGroup = new THREE.Object3D();
    innerGroup.position.set(x, y, z);

    addInnerRing(innerGroup, 0, 0, 0);
    /*
    figura1();
    figura2();
    figura3();
    ...
    */

   obj.add(innerGroup);
}

function createMiddleGroup(obj, x, y, z) {
    'use strict';

    middleGroup = new THREE.Object3D();
    middleGroup.position.set(x, y, z);

    addMiddleRing(middleGroup, 0, 0, 0);
    /*
    figura1();
    figura2();
    figura3();
    ...
    */

   obj.add(middleGroup);
}

function createOuterGroup(obj, x, y, z) {
    'use strict';

    outerGroup = new THREE.Object3D();
    outerGroup.position.set(x, y, z);

    addOuterRing(outerGroup, 0, 0, 0);
    /*
    figura1();
    figura2();
    figura3();
    ...
    */

   obj.add(outerGroup);
}

function createCarousel(x, y, z) {
    'use strict';

    carousel = new THREE.Object3D();
    addCylinder(carousel, 0, 0, 0);
    createInnerGroup(carousel, 0, -2, 0);
    createMiddleGroup(carousel, 0, -1, 0);
    createOuterGroup(carousel, 0, 0, 0);

    scene.add(carousel);
    carousel.position.set(x, y, z);
}

function createSkyDome(x, y, z) {
    'use strict';

    const geometry = new THREE.SphereGeometry(sky_dome_radius, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    skyDome = new THREE.Mesh(geometry, material_sky_dome);
    skyDome.position.set(x, y - cylinder_height / 2, z);
    scene.add(skyDome);
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

    var stepPerSecond = 0.1 * 60;
    var delta = clock.getDelta();
    var scaledStep = stepPerSecond * delta;
    var rotationStep = stepPerSecond * Math.PI * delta * 0.03;

    carousel.rotation.y += rotationStep;

    if (isAnimatingInnerRing) {
        // Move the inner ring up or down based on the animation direction
        innerGroup.position.y += animationInnerDirection * scaledStep;

        // Check if the inner ring has reached the top or bottom and reverse the direction
        if (innerGroup.position.y >= cylinder_height / 2 - 2 || innerGroup.position.y <= - cylinder_height / 2 + 2) {
            animationInnerDirection *= -1;
        }
    }

    if (isAnimatingMiddleRing) {
        // Move the inner ring up or down based on the animation direction
        middleGroup.position.y += animationMiddleDirection * scaledStep;

        // Check if the inner ring has reached the top or bottom and reverse the direction
        if (middleGroup.position.y >= cylinder_height / 2 - 2 || middleGroup.position.y <= - cylinder_height / 2 + 2) {
            animationMiddleDirection *= -1;
        }
    }

    if (isAnimatingOuterRing) {
        // Move the inner ring up or down based on the animation direction
        outerGroup.position.y += animationOuterDirection * scaledStep;

        // Check if the inner ring has reached the top or bottom and reverse the direction
        if (outerGroup.position.y >= cylinder_height / 2 - 2 || outerGroup.position.y <= - cylinder_height / 2 + 2) {
            animationOuterDirection *= -1;
        }
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

    clock = new THREE.Clock(true);

    createScene();
    createAllCameras();

    shown_camera = top_camera;
    
    render();
    window.addEventListener("keydown", onKeyDown);
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

        // Update the size of the renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update the aspect ratio and size of each camera
        front_camera.left = -window.innerWidth / 20;
        front_camera.right = window.innerWidth / 20;
        front_camera.top = window.innerHeight / 20;
        front_camera.bottom = -window.innerHeight / 20;
        front_camera.updateProjectionMatrix();
        
        lat_camera.left = -window.innerWidth / 20;
        lat_camera.right = window.innerWidth / 20;
        lat_camera.top = window.innerHeight / 20;
        lat_camera.bottom = -window.innerHeight / 20;
        lat_camera.updateProjectionMatrix();
        
        top_camera.left = -window.innerWidth / 30;
        top_camera.right = window.innerWidth / 30;
        top_camera.top = window.innerHeight / 30;
        top_camera.bottom = -window.innerHeight / 30;
        top_camera.updateProjectionMatrix();
        
        fixed_ort_camera.left = -window.innerWidth / 20;
        fixed_ort_camera.right = window.innerWidth / 20;
        fixed_ort_camera.top = window.innerHeight / 20;
        fixed_ort_camera.bottom = -window.innerHeight / 20;
        fixed_ort_camera.updateProjectionMatrix();
        
        fixed_persp_camera.aspect = window.innerWidth / window.innerHeight;
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
        isAnimatingInnerRing = !isAnimatingInnerRing;
        break;
    case 50: //2
        isAnimatingMiddleRing = !isAnimatingMiddleRing;
        break;
    case 51: //3
        isAnimatingOuterRing = !isAnimatingOuterRing;
        break;
    case 52: //4
        shown_camera = lat_camera;
        break;
    case 53: //5
        shown_camera = fixed_persp_camera;
        break;
    case 54: //6
        materials.forEach(function (material) {
            material.wireframe = !material.wireframe;
        });
    }
}


///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';
}

init();
animate();