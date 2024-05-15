import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { ParametricGeometries } from 'three/addons/geometries/ParametricGeometries.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var scene, renderer, clock;

var front_camera, lat_camera, top_camera, 
    fixed_ort_camera, fixed_persp_camera, shown_camera;

var current_material;
var material_lambert = new THREE.MeshLambertMaterial({ color: 0x503C3C, side: THREE.DoubleSide }); // DOUBLE SIDE NEEDED?
var material_phong = new THREE.MeshPhongMaterial({ color: 0x503C3C, side: THREE.DoubleSide });  // DOUBLE SIDE NEEDED?
var material_toon = new THREE.MeshToonMaterial({ color: 0x503C3C, side: THREE.DoubleSide });    // DOUBLE SIDE NEEDED?
var material_normal = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });              // DOUBLE SIDE NEEDED?

var scene_objects = [];
var figures = [];
var geometries = [];

var ambientLight, directionalGlobalLight, spotLights = [], mobiusPointLights = [];
var toCalcLights = true;

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

///////////////////////
/* __CREATE__SCENE__ */
///////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(35));

    createCarousel(0,0,0);
    //createSkyDome(0,0,0);
    createMobius(0, 15, 0);

    createAmbientLight();
    createGlobalLight();

    innerGroup.add(new THREE.AxesHelper(35));
    middleGroup.add(new THREE.AxesHelper(35));
    outerGroup.add(new THREE.AxesHelper(35));
}

////////////////////////
/* __CREATE__CAMERA__ */
////////////////////////
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
    top_camera.position.set(0,  100, 0);
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
    'use strict';
    createFrontCamera();
    createLatCamera();
    createTopCamera();
    createFixedOrthographicCamera();
    createFixedPerspectiveCamera();
}

////////////////////////
/* __CREATE__LIGHTS__ */
////////////////////////
function createAmbientLight() {
    'use strict';

    ambientLight = new THREE.AmbientLight(0xFFA500, 1);
    scene.add(ambientLight);
}

function createGlobalLight() {
    'use strict';

    directionalGlobalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalGlobalLight.position.set(100, 100, 100);
    scene.add(directionalGlobalLight);

    // Helper to visualize the light
    const directionalLightHelper = new THREE.DirectionalLightHelper(directionalGlobalLight, 5);
    scene.add(directionalLightHelper);
}

function createSpotLight(obj, mesh) {
    'use strict';

    var spotLight = new THREE.SpotLight(0xffffff, 100, 3, Math.PI/3);
    spotLight.position.set(mesh.position.x, mesh.position.y - 1, mesh.position.z);
    spotLight.target = mesh;

    spotLights.push(spotLight);

    const SpotLightHelper = new THREE.SpotLightHelper(spotLight, 2);
    obj.add(SpotLightHelper);
    obj.add(spotLight.target);
    obj.add(spotLight);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

////////////////////////
/* __BASE__CYLINDER__ */
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
    var mesh = new THREE.Mesh(geometry, current_material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
    scene_objects.push(mesh);
}

///////////////
/* __RINGS__ */
///////////////

function addRingAux(innerRadius, outerRadius, color) {
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

function addInnerRing(obj) {
    'use strict';

    var ring = addRingAux(inner_ring_inner_radius, inner_ring_outer_radius, 
                current_material);

    obj.add(ring);
    scene_objects.push(ring);
}

function addMiddleRing(obj) {
    'use strict';

    var ring = addRingAux(middle_ring_inner_radius, middle_ring_outer_radius, 
                current_material);
    
    obj.add(ring);
    scene_objects.push(ring);
}

function addOuterRing(obj) {
    'use strict';
    
    var ring = addRingAux(outer_ring_inner_radius, outer_ring_outer_radius, 
                current_material);

    obj.add(ring);
    scene_objects.push(ring);
}

/////////////////
/* __FIGURES__ */
/////////////////

var hyperboloidOneSheet = function (u, v, target) {
    'use strict';

    u = 2 * Math.PI * u; // u goes from 0 to 2π
    v = 3 * (v - 0.5);  // v goes from -3 to 3, adjust range as needed for the height
    const x = Math.cosh(v) * Math.cos(u);
    const y = Math.cosh(v) * Math.sin(u);
    const z = Math.sinh(v);

    target.set(x, y, z);
}

function createParametricGeometries() {
    'use strict';

    for (var i = 0; i < 8; i++) {
        geometries.push(new ParametricGeometry(hyperboloidOneSheet, 10, 10));
    }
}

function createFigure(obj, geometry, radius, angle) {
    'use strict';

    var mesh = new THREE.Mesh(geometry, current_material);
    mesh.position.set(Math.cos(angle)*radius, 1, Math.sin(angle)*radius);

    createSpotLight(obj, mesh);

    obj.add(mesh);
    figures.push(mesh);
    scene_objects.push(mesh);
}

///////////////////////
/* __RINGS__GROUPS__ */
///////////////////////

function createInnerGroup(obj, x, y, z) {
    'use strict';

    innerGroup = new THREE.Object3D();
    innerGroup.position.set(x, y, z);

    addInnerRing(innerGroup);
    for(var i = 0; i < 8; i++) {
        createFigure(innerGroup,
               geometries[i],
               inner_ring_inner_radius + (inner_ring_outer_radius - inner_ring_inner_radius)/2, 
               (Math.PI/4)*i);
    }

   obj.add(innerGroup);
}

function createMiddleGroup(obj, x, y, z) {
    'use strict';

    middleGroup = new THREE.Object3D();
    middleGroup.position.set(x, y, z);

    addMiddleRing(middleGroup);
    for(var i = 0; i < 8; i++) {
        createFigure(middleGroup,
               geometries[i],
               middle_ring_inner_radius + (middle_ring_outer_radius - middle_ring_inner_radius)/2, 
               (Math.PI/4)*i);
    }

   obj.add(middleGroup);
}

function createOuterGroup(obj, x, y, z) {
    'use strict';

    outerGroup = new THREE.Object3D();
    outerGroup.position.set(x, y, z);

    addOuterRing(outerGroup);
    for(var i = 0; i < 8; i++) {
        createFigure(outerGroup,
               geometries[i],
               outer_ring_inner_radius + (outer_ring_outer_radius - outer_ring_inner_radius)/2, 
               (Math.PI/4)*i);
    }

   obj.add(outerGroup);
}

/////////////////////
/* __GROUPS__ALL__ */
/////////////////////

function createCarousel(x, y, z) {
    'use strict';

    carousel = new THREE.Object3D();
    addCylinder(carousel, 0, 0, 0);
    createParametricGeometries();
    createInnerGroup(carousel, 0, -2, 0);
    createMiddleGroup(carousel, 0, -1, 0);
    createOuterGroup(carousel, 0, 0, 0);

    scene.add(carousel);
    carousel.position.set(x, y, z);
}

function createSkyDome(x, y, z) {
    'use strict';

    const geometry = new THREE.SphereGeometry(sky_dome_radius, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    skyDome = new THREE.Mesh(geometry, current_material);
    skyDome.position.set(x, y - cylinder_height / 2, z);
    scene.add(skyDome);
    scene_objects.push(skyDome);
}

////////////////
/* __MOBIUS__ */
////////////////
function generateMobiusVertices(obj, vertices, indices) {
    'use strict';

    const numSegments = 80; // Number of segments for a smoother curve
    const radius = 10;       // Radius of the strip's central circle
    const width = 2;         // Width of the strip

    var placelights = [];
    for (var i = 0; i < 8; i++) {
        placelights.push((i/8)*numSegments);
    }

    // Generate vertices and indices for the Möbius strip
    for (var i = 0; i <= numSegments; i++) {
        const theta = (i / numSegments) * 2 * Math.PI; // theta goes from 0 to 2PI
        
        [-1, 1].forEach(j => { // j flips between -1 and 1 for the two sides of the strip
            const phi = theta / 2; // Half twist distributed over the entire loop

            const x = radius * Math.cos(theta) + j * width * Math.cos(theta) * Math.cos(phi);
            const y = radius * Math.sin(theta) + j * width * Math.sin(theta) * Math.cos(phi);
            const z = j * width * Math.sin(phi);
            vertices.push(x, y, z);
        });

        if (placelights.includes(i)) {
            var mobiusPointLight = new THREE.PointLight(0xffffff, 100, 5);
            mobiusPointLight.position.set(radius * Math.cos(theta), radius * Math.sin(theta), 0);
            obj.add(mobiusPointLight);
            mobiusPointLights.push(mobiusPointLight);

            var pointLightHelper = new THREE.PointLightHelper(mobiusPointLight, 1);
            scene.add(pointLightHelper);
        }

        // Defining two triangles per segment
        if (i > 0) {
            const a = 2 * i - 2;  // vertex index at start of this segment
            const b = 2 * i - 1;  // vertex index at start of other side of this segment
            const c = 2 * i;      // vertex index at end of this segment
            const d = 2 * i + 1;  // vertex index at end of other side of this segment
            indices.push(a, b, c, b, d, c); // two triangles per segment
        }
    }

    // Connecting the last segment to the first to create a true Möbius strip
    indices.push(0, 1, 2 * numSegments, 1, 2 * numSegments + 1, 2 * numSegments);
}

function addMobiusStrip(obj, vertices, indices) {
    'use strict';

    var geometry = new THREE.BufferGeometry();

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    var mobiusMesh = new THREE.Mesh(geometry, current_material);

    obj.add(mobiusMesh);
    scene_objects.push(mobiusMesh);
}

function createMobius(x, y, z) {
    'use strict';

    var vertices = [], reversedVertices = [];
    var indices = [], reversedIndices = [];

    var mobiusStrip = new THREE.Object3D();
    mobiusStrip.position.set(x, y, z);
    mobiusStrip.rotation.x = Math.PI /2;

    generateMobiusVertices(mobiusStrip, vertices, indices);

    /* for (var i = 0; i < vertices.length; i += 6) {
        for (var j = 5; j >= 0; j--) {
            reversedVertices.unshift(vertices[i+j]);
        }
    }
    for (var i = 0; i < indices.length; i += 6) {
        for (var j = 5; j >= 0; j--) {
            reversedIndices.unshift(indices[i+j]);
        }
    } */

    addMobiusStrip(mobiusStrip, vertices, indices);
    //addMobiusStrip(mobiusStrip, reversedVertices, reversedIndices);

    scene.add(mobiusStrip);
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

    updateMaterials();

    figures.forEach(figure => {
        figure.rotation.y += rotationStep * 4;
    });
    
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

//////////////////////
/* UPDATE MATERIALS */
//////////////////////
function updateMaterials() {
    'use strict';

    scene_objects.forEach(obj => {
        obj.material = current_material;
    });
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

    current_material = material_lambert;
    clock = new THREE.Clock(true);

    createScene();
    createAllCameras();

    shown_camera = top_camera;
    
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
    case 68: //D
    case 100: //d
        directionalGlobalLight.visible = !directionalGlobalLight.visible;
        break;
    case 80: //P
    case 112: //p
        mobiusPointLights.forEach(light => {
            light.visible = !light.visible;
        });
        break;
    case 83: //S
    case 115: //s
        spotLights.forEach(light => {
            light.visible = !light.visible;
        });
        break;
    case 81: //Q
    case 113: //q
        current_material = material_lambert;
        break;
    case 87: //W
    case 119: //w
        current_material = material_phong;
        break;
    case 69: //E
    case 101: //e
        current_material = material_toon;
        break;
    case 82: //R
    case 114: //r
        current_material = material_normal;
        break;
    case 84: //T
    case 116: //t
        toCalcLights = !toCalcLights;
        ambientLight.visible = toCalcLights;
        directionalGlobalLight.visible = toCalcLights;
        spotLights.forEach(light => { light.visible = toCalcLights; });
        mobiusPointLights.forEach(light => { light.visible = toCalcLights; });
        break;
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