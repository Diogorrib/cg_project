import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var scene, renderer, clock;

var top_camera, stereoCamera, vr_camera, shown_camera;

var current_material_index;
var material_normal = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });

var skydome_material_lambert = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
var skydome_material_phong = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
var skydome_material_toon = new THREE.MeshToonMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
var skydome_material_mesh = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, side: THREE.DoubleSide });
var current_skydome_materials = [skydome_material_lambert, skydome_material_phong, skydome_material_toon, 
                                material_normal, skydome_material_mesh];

var mobius_material_lambert = new THREE.MeshLambertMaterial({ color: 0x4b3832, side: THREE.DoubleSide });
var mobius_material_phong = new THREE.MeshPhongMaterial({ color: 0x4b3832, side: THREE.DoubleSide });
var mobius_material_toon = new THREE.MeshToonMaterial({ color: 0x4b3832, side: THREE.DoubleSide });
var mobius_material_mesh = new THREE.MeshBasicMaterial({ color: 0x4b3832, wireframe: true, side: THREE.DoubleSide });
var current_mobius_materials = [mobius_material_lambert, mobius_material_phong, mobius_material_toon,
                               material_normal, mobius_material_mesh]

var figure_material_lambert = new THREE.MeshLambertMaterial({ color: 0xccbea5, side: THREE.DoubleSide });
var figure_material_phong = new THREE.MeshPhongMaterial({ color: 0xccbea5, side: THREE.DoubleSide });
var figure_material_toon = new THREE.MeshToonMaterial({ color: 0xccbea5, side: THREE.DoubleSide });
var figure_material_mesh = new THREE.MeshBasicMaterial({ color: 0xccbea5, wireframe: true, side: THREE.DoubleSide });
var current_figure_materials = [figure_material_lambert, figure_material_phong, figure_material_toon,
                               material_normal, figure_material_mesh];

var cylinder_material_lambert = new THREE.MeshLambertMaterial({ color: 0x887d69, side: THREE.DoubleSide });
var cylinder_material_phong = new THREE.MeshPhongMaterial({ color: 0x887d69, side: THREE.DoubleSide });
var cylinder_material_toon = new THREE.MeshToonMaterial({ color: 0x887d69, side: THREE.DoubleSide });
var cylinder_material_mesh = new THREE.MeshBasicMaterial({ color: 0x887d69, wireframe: true, side: THREE.DoubleSide });
var current_cylinder_materials = [cylinder_material_lambert, cylinder_material_phong, cylinder_material_toon,
                                 material_normal, cylinder_material_mesh];

var inner_ring_material_lambert = new THREE.MeshLambertMaterial({ color: 0xaa9b82, side: THREE.DoubleSide });
var inner_ring_material_phong = new THREE.MeshPhongMaterial({ color: 0xaa9b82, side: THREE.DoubleSide });
var inner_ring_material_toon = new THREE.MeshToonMaterial({ color: 0xaa9b82, side: THREE.DoubleSide });
var inner_ring_material_mesh = new THREE.MeshBasicMaterial({ color: 0xaa9b82, wireframe: true, side: THREE.DoubleSide });
var current_inner_ring_materials = [inner_ring_material_lambert, inner_ring_material_phong, inner_ring_material_toon,
                                   material_normal, inner_ring_material_mesh];

var middle_ring_material_lambert = new THREE.MeshLambertMaterial({ color: 0xb4a68f, side: THREE.DoubleSide });
var middle_ring_material_phong = new THREE.MeshPhongMaterial({ color: 0xb4a68f, side: THREE.DoubleSide });
var middle_ring_material_toon = new THREE.MeshToonMaterial({ color: 0xb4a68f, side: THREE.DoubleSide });
var middle_ring_material_mesh = new THREE.MeshBasicMaterial({ color: 0xb4a68f, wireframe: true, side: THREE.DoubleSide });
var current_middle_ring_materials = [middle_ring_material_lambert, middle_ring_material_phong, middle_ring_material_toon,
                                    material_normal, middle_ring_material_mesh];

var outer_ring_material_lambert = new THREE.MeshLambertMaterial({ color: 0xdbd2c3, side: THREE.DoubleSide });
var outer_ring_material_phong = new THREE.MeshPhongMaterial({ color: 0xdbd2c3, side: THREE.DoubleSide });
var outer_ring_material_toon = new THREE.MeshToonMaterial({ color: 0xdbd2c3, side: THREE.DoubleSide });
var outer_ring_material_mesh = new THREE.MeshBasicMaterial({ color: 0xdbd2c3, wireframe: true, side: THREE.DoubleSide });
var current_outer_ring_materials = [outer_ring_material_lambert, outer_ring_material_phong, outer_ring_material_toon,
                                   material_normal, outer_ring_material_mesh];

var figures = [];
var geometries = [];

var ambientLight, directionalGlobalLight, spotLights = [], mobiusPointLights = [];

var carousel, innerGroup, middleGroup, outerGroup;
var skyDome, cylinder, inner_ring, middle_ring, outer_ring, mobiusMesh;

/* Relevant size values for axis and position of elements */
var cylinder_height = 20, cylinder_radius = 5;
var ring_height = 1;
var inner_ring_inner_radius = 5, inner_ring_outer_radius = 10;
var middle_ring_inner_radius = 10, middle_ring_outer_radius = 15;
var outer_ring_inner_radius = 15, outer_ring_outer_radius = 20;
var sky_dome_radius = 100;

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

    createCarousel(0,0,0);
    createSkyDome(0,0,0);
    createMobius(0, 15, 0);

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
        
    top_camera.position.set(0, 80, 0);
    top_camera.lookAt(scene.position);
}

function createStereoCamera() {
    'use strict';
    stereoCamera = new THREE.StereoCamera();
    stereoCamera.aspect = 0.5;
    updateStereoCamera();  // Ensure the stereo camera is updated immediately after creation
}

function updateStereoCamera() {
    if (stereoCamera && vr_camera) {
        stereoCamera.update(vr_camera);
    }
}

function createVrCamera () {
    'use strict';
    vr_camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    vr_camera.position.set(8, 1, 8);
    //vr_camera.lookAt(8, 1, 8);
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
}

function createSpotLight(obj, mesh) {
    'use strict';

    var spotLight = new THREE.SpotLight(0xffffff, 100, 5, Math.PI/4);
    spotLight.position.set(mesh.position.x, mesh.position.y-0.1, mesh.position.z);
    spotLight.target = mesh;

    spotLights.push(spotLight);

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
    cylinder = new THREE.Mesh(geometry, cylinder_material_lambert);
    cylinder.position.set(x, y, z);
    obj.add(cylinder);
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

    inner_ring = addRingAux(inner_ring_inner_radius, inner_ring_outer_radius, 
                inner_ring_material_lambert);

    obj.add(inner_ring);
}

function addMiddleRing(obj) {
    'use strict';

    middle_ring = addRingAux(middle_ring_inner_radius, middle_ring_outer_radius, 
                    middle_ring_material_lambert);
    
    obj.add(middle_ring);
}

function addOuterRing(obj) {
    'use strict';
    
    outer_ring = addRingAux(outer_ring_inner_radius, outer_ring_outer_radius, 
                    outer_ring_material_lambert);

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

function createFigure(obj, geometry, radius, angle) {
    'use strict';

    var mesh = new THREE.Mesh(geometry, figure_material_lambert);
    mesh.position.set(Math.cos(angle)*radius, 0, Math.sin(angle)*radius);

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
               geometries[7-i],
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

    const geometry = new THREE.SphereGeometry(sky_dome_radius, 32, 32, 0, Math.PI * 2, 0, Math.PI);
    skyDome = new THREE.Mesh(geometry, skydome_material_lambert);
    skyDome.position.set(x, y - cylinder_height / 2, z);
    scene.add(skyDome);
}

////////////////
/* __MOBIUS__ */
////////////////
function generateMobiusVertices(obj, vertices, indices) {
    'use strict';

    const r = 10;       // Radius of the strip's central circle
    const w = 2;         // Width of the strip

    var theta = (0/8) * 2 * Math.PI;
    var phi = theta / 2;
    var costheta = r * Math.cos(theta);
    var sintheta = r * Math.sin(theta);
    var costhetaphi = w * Math.cos(theta) * Math.cos(phi);
    var sinthetaphi = w * Math.sin(theta) * Math.cos(phi);
    var sinphi = w * Math.sin(phi);

    const v1 = [costheta + costhetaphi, sintheta + sinthetaphi, sinphi];
    const v2 = [costheta - costhetaphi, sintheta - sinthetaphi, -sinphi];
    
    var mobiusPointLight = new THREE.PointLight(0xffffff, 100, 5);
    mobiusPointLight.position.set((v1[0] + v2[0])/2, (v1[1] + v2[1])/2, (v1[2] + v2[2])/2);
    obj.add(mobiusPointLight);
    mobiusPointLights.push(mobiusPointLight);

    theta = (1/8) * 2 * Math.PI;
    phi = theta / 2;
    costheta = r * Math.cos(theta);
    sintheta = r * Math.sin(theta);
    costhetaphi = w * Math.cos(theta) * Math.cos(phi);
    sinthetaphi = w * Math.sin(theta) * Math.cos(phi);
    sinphi = w * Math.sin(phi);

    const v3 = [costheta + costhetaphi, sintheta + sinthetaphi, sinphi];
    const v4 = [costheta - costhetaphi, sintheta - sinthetaphi, -sinphi];
    
    mobiusPointLight = new THREE.PointLight(0xffffff, 100, 5);
    mobiusPointLight.position.set((v3[0] + v4[0])/2, (v3[1] + v4[1])/2, (v3[2] + v4[2])/2);
    obj.add(mobiusPointLight);
    mobiusPointLights.push(mobiusPointLight);

    vertices.push(v1[0], v1[1], v1[2]);
    vertices.push(v2[0], v2[1], v2[2]);
    vertices.push(v3[0], v3[1], v3[2]);
    vertices.push(v2[0], v2[1], v2[2]);
    vertices.push(v4[0], v4[1], v4[2]);
    vertices.push(v3[0], v3[1], v3[2]);

    theta = (2/8) * 2 * Math.PI;
    phi = theta / 2;
    costheta = r * Math.cos(theta);
    sintheta = r * Math.sin(theta);
    costhetaphi = w * Math.cos(theta) * Math.cos(phi);
    sinthetaphi = w * Math.sin(theta) * Math.cos(phi);
    sinphi = w * Math.sin(phi);

    const v5 = [costheta + costhetaphi, sintheta + sinthetaphi, sinphi];
    const v6 = [costheta - costhetaphi, sintheta - sinthetaphi, -sinphi];
    
    mobiusPointLight = new THREE.PointLight(0xffffff, 100, 5);
    mobiusPointLight.position.set((v5[0] + v6[0])/2, (v5[1] + v6[1])/2, (v5[2] + v6[2])/2);
    obj.add(mobiusPointLight);
    mobiusPointLights.push(mobiusPointLight);

    vertices.push(v3[0], v3[1], v3[2]);
    vertices.push(v4[0], v4[1], v4[2]);
    vertices.push(v5[0], v5[1], v5[2]);
    vertices.push(v4[0], v4[1], v4[2]);
    vertices.push(v6[0], v6[1], v6[2]);
    vertices.push(v5[0], v5[1], v5[2]);

    theta = (3/8) * 2 * Math.PI;
    phi = theta / 2;
    costheta = r * Math.cos(theta);
    sintheta = r * Math.sin(theta);
    costhetaphi = w * Math.cos(theta) * Math.cos(phi);
    sinthetaphi = w * Math.sin(theta) * Math.cos(phi);
    sinphi = w * Math.sin(phi);

    const v7 = [costheta + costhetaphi, sintheta + sinthetaphi, sinphi];
    const v8 = [costheta - costhetaphi, sintheta - sinthetaphi, -sinphi];

    mobiusPointLight = new THREE.PointLight(0xffffff, 100, 5);
    mobiusPointLight.position.set((v7[0] + v8[0])/2, (v7[1] + v8[1])/2, (v7[2] + v8[2])/2);
    obj.add(mobiusPointLight);
    mobiusPointLights.push(mobiusPointLight);

    vertices.push(v5[0], v5[1], v5[2]);
    vertices.push(v6[0], v6[1], v6[2]);
    vertices.push(v7[0], v7[1], v7[2]);
    vertices.push(v6[0], v6[1], v6[2]);
    vertices.push(v8[0], v8[1], v8[2]);
    vertices.push(v7[0], v7[1], v7[2]);

    theta = (4/8) * 2 * Math.PI;
    phi = theta / 2;
    costheta = r * Math.cos(theta);
    sintheta = r * Math.sin(theta);
    costhetaphi = w * Math.cos(theta) * Math.cos(phi);
    sinthetaphi = w * Math.sin(theta) * Math.cos(phi);
    sinphi = w * Math.sin(phi);

    const v9 = [costheta + costhetaphi, sintheta + sinthetaphi, sinphi];
    const v10 = [costheta - costhetaphi, sintheta - sinthetaphi, -sinphi];

    mobiusPointLight = new THREE.PointLight(0xffffff, 100, 5);
    mobiusPointLight.position.set((v9[0] + v10[0])/2, (v9[1] + v10[1])/2, (v9[2] + v10[2])/2);
    obj.add(mobiusPointLight);
    mobiusPointLights.push(mobiusPointLight);

    vertices.push(v7[0], v7[1], v7[2]);
    vertices.push(v8[0], v8[1], v8[2]);
    vertices.push(v9[0], v9[1], v9[2]);
    vertices.push(v8[0], v8[1], v8[2]);
    vertices.push(v10[0], v10[1], v10[2]);
    vertices.push(v9[0], v9[1], v9[2]);

    theta = (5/8) * 2 * Math.PI;
    phi = theta / 2;
    costheta = r * Math.cos(theta);
    sintheta = r * Math.sin(theta);
    costhetaphi = w * Math.cos(theta) * Math.cos(phi);
    sinthetaphi = w * Math.sin(theta) * Math.cos(phi);
    sinphi = w * Math.sin(phi);

    const v11 = [costheta + costhetaphi, sintheta + sinthetaphi, sinphi];
    const v12 = [costheta - costhetaphi, sintheta - sinthetaphi, -sinphi];

    mobiusPointLight = new THREE.PointLight(0xffffff, 100, 5);
    mobiusPointLight.position.set((v11[0] + v12[0])/2, (v11[1] + v12[1])/2, (v11[2] + v12[2])/2);
    obj.add(mobiusPointLight);
    mobiusPointLights.push(mobiusPointLight);

    vertices.push(v9[0], v9[1], v9[2]);
    vertices.push(v10[0], v10[1], v10[2]);
    vertices.push(v11[0], v11[1], v11[2]);
    vertices.push(v10[0], v10[1], v10[2]);
    vertices.push(v12[0], v12[1], v12[2]);
    vertices.push(v11[0], v11[1], v11[2]);

    theta = (6/8) * 2 * Math.PI;
    phi = theta / 2;
    costheta = r * Math.cos(theta);
    sintheta = r * Math.sin(theta);
    costhetaphi = w * Math.cos(theta) * Math.cos(phi);
    sinthetaphi = w * Math.sin(theta) * Math.cos(phi);
    sinphi = w * Math.sin(phi);

    const v13 = [costheta + costhetaphi, sintheta + sinthetaphi, sinphi];
    const v14 = [costheta - costhetaphi, sintheta - sinthetaphi, -sinphi];

    mobiusPointLight = new THREE.PointLight(0xffffff, 100, 5);
    mobiusPointLight.position.set((v13[0] + v14[0])/2, (v13[1] + v14[1])/2, (v13[2] + v14[2])/2);
    obj.add(mobiusPointLight);
    mobiusPointLights.push(mobiusPointLight);

    vertices.push(v11[0], v11[1], v11[2]);
    vertices.push(v12[0], v12[1], v12[2]);
    vertices.push(v13[0], v13[1], v13[2]);
    vertices.push(v12[0], v12[1], v12[2]);
    vertices.push(v14[0], v14[1], v14[2]);
    vertices.push(v13[0], v13[1], v13[2]);

    theta = (7/8) * 2 * Math.PI;
    phi = theta / 2;
    costheta = r * Math.cos(theta);
    sintheta = r * Math.sin(theta);
    costhetaphi = w * Math.cos(theta) * Math.cos(phi);
    sinthetaphi = w * Math.sin(theta) * Math.cos(phi);
    sinphi = w * Math.sin(phi);

    const v15 = [costheta + costhetaphi, sintheta + sinthetaphi, sinphi];
    const v16 = [costheta - costhetaphi, sintheta - sinthetaphi, -sinphi];
    
    mobiusPointLight = new THREE.PointLight(0xffffff, 100, 5);
    mobiusPointLight.position.set((v15[0] + v16[0])/2, (v15[1] + v16[1])/2, (v15[2] + v16[2])/2);
    obj.add(mobiusPointLight);
    mobiusPointLights.push(mobiusPointLight);
    
    vertices.push(v13[0], v13[1], v13[2]);
    vertices.push(v14[0], v14[1], v14[2]);
    vertices.push(v15[0], v15[1], v15[2]);
    vertices.push(v14[0], v14[1], v14[2]);
    vertices.push(v16[0], v16[1], v16[2]);
    vertices.push(v15[0], v15[1], v15[2]);

    vertices.push(v15[0], v15[1], v15[2]);
    vertices.push(v16[0], v16[1], v16[2]);
    vertices.push(v1[0], v1[1], v1[2]);
    vertices.push(v16[0], v16[1], v16[2]);
    vertices.push(v2[0], v2[1], v2[2]);
    vertices.push(v1[0], v1[1], v1[2]);
}

function addMobiusStrip(obj, vertices, indices) {
    'use strict';

    var geometry = new THREE.BufferGeometry();

    //geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    mobiusMesh = new THREE.Mesh(geometry, mobius_material_lambert);

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

    figures.forEach(obj => {
        obj.material = current_figure_materials[current_material_index];
    });
    skyDome.material = current_skydome_materials[current_material_index];
    mobiusMesh.material = current_mobius_materials[current_material_index];
    inner_ring.material = current_inner_ring_materials[current_material_index];
    middle_ring.material = current_middle_ring_materials[current_material_index];
    outer_ring.material = current_outer_ring_materials[current_material_index];
    cylinder.material = current_cylinder_materials[current_material_index];
}

/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';

    renderer.render(scene, shown_camera);

    updateStereoCamera();  // Update stereo camera every frame based on the top camera's current state

    /* if (shown_camera === stereoCamera) {
        renderer.clear();

        // Render the left eye view
        renderer.setScissorTest(true);
        renderer.setScissor(0, 0, window.innerWidth / 2, window.innerHeight);
        renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight);
        renderer.render(scene, stereoCamera.cameraL);

        // Render the right eye view
        renderer.setScissor(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
        renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
        renderer.render(scene, stereoCamera.cameraR);

    } else {
        // Render with the full viewport when not using stereo camera
        renderer.setScissorTest(false); // Disable scissor test
        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight); // Use the full viewport
        renderer.render(scene, shown_camera);
    } */
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

    // Enable VR
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));

    current_material_index = 0;
    clock = new THREE.Clock(true);

    createScene();
    createTopCamera();
    createVrCamera();
    createStereoCamera();
    

    shown_camera = vr_camera;
    
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    // Use the VR-compatible animation loop
    renderer.setAnimationLoop(animate);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';

    update();
    render();

    //requestAnimationFrame(animate);   // ASK?!
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
        
        top_camera.aspect = window.innerWidth / window.innerHeight;
        top_camera.updateProjectionMatrix();
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
        shown_camera = vr_camera;
        break;
    case 53: //5
        shown_camera = top_camera;
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
            current_material_index = 4;
            scene_lights.forEach(light => { light.visible = false; });
        } else {
            current_material = material_lambert;    //default material
            scene_lights.forEach(light => { light.visible = true; });
        }
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