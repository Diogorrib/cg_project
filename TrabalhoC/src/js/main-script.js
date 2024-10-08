import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var scene, renderer, clock;

var top_camera, vr_camera, stereo_camera, current_camera;

var material_normal = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
var skydome_materials = createMaterialsForObject(0xffffff, true);
var mobius_materials = createMaterialsForObject(0x4b3832);
var figure_materials = createMaterialsForObject(0xccbea5);
var cylinder_materials = createMaterialsForObject(0x887d69);
var inner_ring_materials = createMaterialsForObject(0xaa9b82);
var middle_ring_materials = createMaterialsForObject(0xb4a68f);
var outer_ring_materials = createMaterialsForObject(0xdbd2c3);

var current_material_index, old_material_index;

var figures = [];
var geometries = [];

var ambientLight, directionalGlobalLight, spotLights = [], mobiusPointLights = [], scene_lights = [];

var carousel, innerGroup, middleGroup, outerGroup;
var skyDome, cylinder, inner_ring, middle_ring, outer_ring, mobiusMesh;

/* Relevant size values for axis and position of elements */
var cylinder_height = 20, cylinder_radius = 5;
var ring_height = 1;
var inner_ring_inner_radius = 5, inner_ring_outer_radius = 10;
var middle_ring_inner_radius = 10, middle_ring_outer_radius = 15;
var outer_ring_inner_radius = 15, outer_ring_outer_radius = 20;
var sky_dome_radius = 100;

var isAnimatingInnerRing = true;
var isAnimatingMiddleRing = true;
var isAnimatingOuterRing = true;
var animationInnerDirection = 1;
var animationMiddleDirection = 1;
var animationOuterDirection = 1;

///////////////////////
/* __CREATE__SCENE__ */
///////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();

    createCarousel(0,0,0);
    createSkyDome(0,0,0);
    createMobius(0, 20, 0);

    createAmbientLight();
    createGlobalLight();
}

////////////////////////
/* __CREATE__CAMERA__ */
////////////////////////
function createTopCamera() {
    'use strict';
    top_camera = new THREE.PerspectiveCamera(34,
        (window.innerWidth / window.innerHeight));
        
    top_camera.position.set(50, 50, 50);
    top_camera.lookAt(scene.position);
}

function createStereoCamera() {
    'use strict';
    stereo_camera = new THREE.StereoCamera();
    stereo_camera.aspect = 0.5;
    vr_camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
    stereo_camera.update(vr_camera);
}

////////////////////////
/* __CREATE__LIGHTS__ */
////////////////////////
function createAmbientLight() {
    'use strict';

    ambientLight = new THREE.AmbientLight(0xFFA500, 1);
    scene.add(ambientLight);
    scene_lights.push(ambientLight);
}

function createGlobalLight() {
    'use strict';

    directionalGlobalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalGlobalLight.position.set(100, 100, 100);
    scene.add(directionalGlobalLight);
    scene_lights.push(directionalGlobalLight);
}

function createSpotLight(obj, mesh) {
    'use strict';

    var spotLight = new THREE.SpotLight(0xffffff, 100, 5, Math.PI/4);
    spotLight.position.set(mesh.position.x, mesh.position.y-0.1, mesh.position.z);
    spotLight.target = mesh;

    spotLights.push(spotLight);
    scene_lights.push(spotLight);

    obj.add(spotLight.target);
    obj.add(spotLight);
}

function createPointLight(obj, x, y, z) {
    'use strict';
    var mobiusPointLight = new THREE.PointLight(0xffffff, 100, 5);
    mobiusPointLight.position.set(x, y, z);
    obj.add(mobiusPointLight);
    mobiusPointLights.push(mobiusPointLight);
    scene_lights.push(mobiusPointLight);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createMaterialsForObject(color, applyTexture=false) {

    var texture = null;
    if (applyTexture) {
        texture = new THREE.TextureLoader().load('textures/texture.png');
    }

    var materials = [];
    materials.push(new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide, map: texture }));
    materials.push(new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide, map: texture }));
    materials.push(new THREE.MeshToonMaterial({ color: color, side: THREE.DoubleSide, map: texture}));
    materials.push(material_normal);
    materials.push(new THREE.MeshBasicMaterial({ color: color, wireframe: false, side: THREE.DoubleSide, map: texture}));

    return materials;
}

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
    cylinder = new THREE.Mesh(geometry, cylinder_materials[0]);
    cylinder.position.set(x, y, z);
    obj.add(cylinder);
}

///////////////
/* __RINGS__ */
///////////////

function addRingAux(innerRadius, outerRadius, color) {
    'use strict';

    var shape = new THREE.Shape();

    shape.moveTo(outerRadius, 0);
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

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

    ring.rotation.x = - Math.PI / 2;
    ring.position.set(0, - ring_height / 2, 0);

    return ring;
}

function addInnerRing(obj) {
    'use strict';

    inner_ring = addRingAux(inner_ring_inner_radius, inner_ring_outer_radius, 
                inner_ring_materials[0]);

    obj.add(inner_ring);
}

function addMiddleRing(obj) {
    'use strict';

    middle_ring = addRingAux(middle_ring_inner_radius, middle_ring_outer_radius, 
                    middle_ring_materials[0]);
    
    obj.add(middle_ring);
}

function addOuterRing(obj) {
    'use strict';
    
    outer_ring = addRingAux(outer_ring_inner_radius, outer_ring_outer_radius, 
                    outer_ring_materials[0]);

    obj.add(outer_ring);
}

////////////////////////////
/* __FIGURES__FUNCTIONS__ */
////////////////////////////
var hyperboloidOneSheet = function (u, v, target) {
    'use strict';
    const a = 1;
    const b = 1;
    const c = 1;

    u = 2 * Math.PI * u; // 0 to 2pi
    v = 2 * (v - 0.5);  // -1 to 1

    const x = a * Math.cosh(v) * Math.cos(u);
    const y = c * Math.sinh(v);
    const z = b * Math.cosh(v) * Math.sin(u);

    target.set(x, y + 3, z);
}

var hyperboloidTwoSheets = function (u, v, target) {
    'use strict';
    const a = 1.5;
    const b = 1.5;
    const c = 4;

    u = 2 * Math.PI * u; // 0 to 2pi
    v = 2 * (v - 0.5);  // -1 to 1

    const x = a * Math.sinh(v) * Math.cos(u);
    const y = c * Math.cosh(v);
    const z = b * Math.sinh(v) * Math.sin(u);

    target.set(x, y - 2.5, z);
}

var torus = function (u, v, target) {
    'use strict';
    const R = 1.5;
    const r = 0.5;

    u = 2 * Math.PI * u; // 0 to 2pi
    v = 2 * Math.PI * v; // 0 to 2pi

    const x = (R + r * Math.cos(v)) * Math.cos(u);
    const y = (R + r * Math.cos(v)) * Math.sin(u);
    const z = r * Math.sin(v);

    target.set(x, y + 3, z);
}

var torusKnot = function (u, v, target) {
    'use strict';
    const R = 2;
    const r = 0.5;
    const p = 5; // nr of Turns Around Torus Axis
    const q = 2; // nr of Turns Around the Tube

    u = 2 * Math.PI * u; // 0 to 2pi
    v = 2 * Math.PI * v; // 0 to 2pi

    const x = (R + r * Math.cos(q * u) * Math.cos(v)) * Math.cos(p * u);
    const y = (R + r * Math.cos(q * u) * Math.cos(v)) * Math.sin(p * u);
    const z = r * Math.sin(q * u) * Math.sin(v);

    target.set(x, y + 3, z);
}

var klein = function (u, v, target) {
    'use strict';
    const R = 1.1; // Main radius
    const r = 0.7; // Tube radius

    u = u * 2 * Math.PI; // 0 to 2pi
    v = v * 2 * Math.PI; // 0 to 2pi

    const x = (R + r * Math.cos(u / 2) * Math.sin(v) - r * Math.sin(u / 2) * Math.sin(2 * v)) * Math.cos(u);
    const y = r * Math.sin(u / 2) * Math.sin(v) + r * Math.cos(u / 2) * Math.sin(2 * v);
    const z = (R + r * Math.cos(u / 2) * Math.sin(v) - r * Math.sin(u / 2) * Math.sin(2 * v)) * Math.sin(u);

    target.set(x, y + 3, z);
}

var ellipsoid = function (u, v, target) {
    'use strict';
    const a = 1.5;
    const b = 1;
    const c = 0.5;

    u = 2 * Math.PI * u; // 0 to 2pi
    v = Math.PI * (v - 0.5); // -pi/2 to pi/2

    const x = a * Math.cos(v) * Math.cos(u);
    const y = c * Math.sin(v);
    const z = b * Math.cos(v) * Math.sin(u);

    target.set(x, y + 3, z);
}

var helicoid = function (u, v, target) {
    'use strict';
    const a = 1.5;
    const height = 2.5;

    u = 2.5 * Math.PI * u; // 0 to 4pi
    v = 2 * (v - 0.5); // -1 to 1

    const x = a * v * Math.cos(u);
    const y = height * u / (2 * Math.PI);
    const z = a * v * Math.sin(u);

    target.set(x, y + 1.5, z);
}

var fourLeafClover = function (u, v, target) {
    'use strict';
    const a = 1.5;

    u = 2 * Math.PI * u; // 0 to 2pi
    v = 0.5 * (v - 0.5); // -1 to 1

    const x = a * Math.cos(2 * u) * Math.cos(u);
    const y = a * Math.cos(2 * u) * Math.sin(u);
    const z = a * v;

    target.set(x, y + 3, z);
}

/////////////////
/* __FIGURES__ */
/////////////////
function createParametricGeometries() {
    'use strict';

    var parametricFigures = [hyperboloidOneSheet, hyperboloidTwoSheets, torus, klein,
                                ellipsoid, helicoid, torusKnot, fourLeafClover];

    parametricFigures.forEach(figure => {
        geometries.push(new ParametricGeometry(figure, 20, 20));
    });
} 

function createFigure(obj, geometry, radius, angle, size, rotationX) {
    'use strict';

    var mesh = new THREE.Mesh(geometry, figure_materials[0]);
    mesh.position.set(Math.cos(angle)*radius, 0, Math.sin(angle)*radius);
    mesh.scale.set(size, size, size);
    mesh.rotation.x = rotationX;

    createSpotLight(obj, mesh);

    obj.add(mesh);
    figures.push(mesh);
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
               (Math.PI/4)*i, 0.5, (Math.PI/8));
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
               geometries[7-i],
               middle_ring_inner_radius + (middle_ring_outer_radius - middle_ring_inner_radius)/2, 
               (Math.PI/4)*i, 0.8, (Math.PI/-8));
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
               (Math.PI/4)*i, 1, 0);
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

    const geometry = new THREE.SphereGeometry(sky_dome_radius, 32, 32, 0, Math.PI * 2, 0, Math.PI);
    skyDome = new THREE.Mesh(geometry, skydome_materials[0]);
    skyDome.position.set(x, y - cylinder_height / 2, z);
    scene.add(skyDome);
}

////////////////
/* __MOBIUS__ */
////////////////
function generateMobiusVertices(obj, vertices) {
    'use strict';

    const r = 10, w = 2;
    var prev1 = [r + w, 0, 0];
    var prev2 = [r - w, 0, 0];

    for (var i = 1; i <= 8; i++) {
        const theta = (i/8) * 2 * Math.PI;
        const phi = theta / 2;
        const costheta = r * Math.cos(theta);
        const sintheta = r * Math.sin(theta);
        const costhetaphi = w * Math.cos(theta) * Math.cos(phi);
        const sinthetaphi = w * Math.sin(theta) * Math.cos(phi);
        const sinphi = w * Math.sin(phi);

        var v1 = [costheta + costhetaphi, sintheta + sinthetaphi, sinphi];
        var v2 = [costheta - costhetaphi, sintheta - sinthetaphi, -sinphi];

        createPointLight(obj, (v1[0] + v2[0])/2, (v1[1] + v2[1])/2, (v1[2] + v2[2])/2);

        vertices.push(prev1[0], prev1[1], prev1[2]);
        vertices.push(prev2[0], prev2[1], prev2[2]);
        vertices.push(v1[0], v1[1], v1[2]);
        vertices.push(prev2[0], prev2[1], prev2[2]);
        vertices.push(v2[0], v2[1], v2[2]);
        vertices.push(v1[0], v1[1], v1[2]);

        prev1 = v1;
        prev2 = v2;
    }
}

function addMobiusStrip(obj, vertices) {
    'use strict';

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    mobiusMesh = new THREE.Mesh(geometry, mobius_materials[0]);

    obj.add(mobiusMesh);
}

function createMobius(x, y, z) {
    'use strict';

    var vertices = [];
    var indices = [];

    var mobiusStrip = new THREE.Object3D();
    mobiusStrip.position.set(x, y, z);
    mobiusStrip.rotation.x = Math.PI /2;

    generateMobiusVertices(mobiusStrip, vertices, indices);

    addMobiusStrip(mobiusStrip, vertices, indices);
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
        innerGroup.position.y += animationInnerDirection * scaledStep * 0.8;

        // Check if the inner ring has reached the top or bottom and reverse the direction
        if ((innerGroup.position.y >= cylinder_height / 2 - 2 && animationInnerDirection == 1) ||
            (innerGroup.position.y <= - cylinder_height / 2 + 2 && animationInnerDirection == -1)) {
            animationInnerDirection *= -1;
        }
    }

    if (isAnimatingMiddleRing) {
        // Move the inner ring up or down based on the animation direction
        middleGroup.position.y += animationMiddleDirection * scaledStep * 0.6;

        // Check if the inner ring has reached the top or bottom and reverse the direction
        if ((middleGroup.position.y >= cylinder_height / 2 - 2 && animationMiddleDirection == 1) ||
            (middleGroup.position.y <= - cylinder_height / 2 + 2 && animationMiddleDirection == -1)) {
            animationMiddleDirection *= -1;
        }
    }

    if (isAnimatingOuterRing) {
        // Move the inner ring up or down based on the animation direction
        outerGroup.position.y += animationOuterDirection * scaledStep * 0.4;

        // Check if the inner ring has reached the top or bottom and reverse the direction
        if ((outerGroup.position.y >= cylinder_height / 2 - 2 && animationOuterDirection == 1) ||
            (outerGroup.position.y <= - cylinder_height / 2 + 2 && animationOuterDirection == -1)) {
            animationOuterDirection *= -1;
        }
    }
}

//////////////////////
/* UPDATE MATERIALS */
//////////////////////
function updateMaterials() {
    'use strict';

    figures.forEach(obj => {
        obj.material = figure_materials[current_material_index];
    });
    skyDome.material = skydome_materials[current_material_index];
    mobiusMesh.material = mobius_materials[current_material_index];
    inner_ring.material = inner_ring_materials[current_material_index];
    middle_ring.material = middle_ring_materials[current_material_index];
    outer_ring.material = outer_ring_materials[current_material_index];
    cylinder.material = cylinder_materials[current_material_index];
}

/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';

    if (current_camera == stereo_camera) {
        stereo_camera.update(vr_camera);

        // Set the viewport to the left eye's view
        renderer.setScissorTest(true);
        renderer.setScissor(0, 0, window.innerWidth/2, window.innerHeight);
        renderer.setViewport(0, 0, window.innerWidth/2, window.innerHeight);
        renderer.render(scene, stereo_camera.cameraL);

        // Set the viewport to the right eye's view
        renderer.setScissor(window.innerWidth/2, 0, window.innerWidth/2, window.innerHeight);
        renderer.setViewport(window.innerWidth/2, 0, window.innerWidth/2, window.innerHeight);
        renderer.render(scene, stereo_camera.cameraR);

        renderer.setScissorTest(false);
    } else {
        renderer.render(scene, top_camera);
    }
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));

    current_material_index = 0;
    old_material_index = 0;
    clock = new THREE.Clock(true);

    createScene();
    createTopCamera();
    createStereoCamera();

    current_camera = top_camera;

    // Move the camera arround the scene when not in VR
    var controls = new OrbitControls(top_camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    renderer.xr.addEventListener('sessionstart', () => {
        current_camera = stereo_camera;
        scene.position.set(0, -cylinder_height/4-2, 0);
        scene.scale.set(0.6, 0.6, 0.6);
    });
    renderer.xr.addEventListener('sessionend', () => {
        current_camera = top_camera;
        scene.position.set(0, 0, 0);
        scene.scale.set(1, 1, 1);
    });

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    renderer.setAnimationLoop(animate);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';

    update();
    render();
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        vr_camera.aspect = window.innerWidth / window.innerHeight;
        vr_camera.updateProjectionMatrix();
        top_camera.aspect = window.innerWidth / window.innerHeight;
        top_camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        stereo_camera.aspect = 0.5;
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
        if (current_material_index != 4)
            current_material_index = 0;
        break;
    case 87: //W
    case 119: //w
        if (current_material_index != 4)
            current_material_index = 1;
        break;
    case 69: //E
    case 101: //e
        if (current_material_index != 4)
            current_material_index = 2;
        break;
    case 82: //R
    case 114: //r
        if (current_material_index != 4)
            current_material_index = 3;
        break;
    case 84: //T
    case 116: //t
        if (current_material_index != 4) {
            old_material_index = current_material_index;
            current_material_index = 4;
            scene_lights.forEach(light => { light.visible = false; });
        } else {
            current_material_index = old_material_index;
            scene_lights.forEach(light => { light.visible = true; });
        }
        break;
    }
}

init();