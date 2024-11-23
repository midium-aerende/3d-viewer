import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js';

const width = window.innerWidth, height = window.innerHeight;

const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10);
camera.position.z = 2;

const scene = new THREE.Scene();

const hdrLoader = new RGBELoader();
hdrLoader.load('./assets/rooftop_night_4k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
}, undefined, (error) => {
    console.error('Erreur lors du chargement de l\'HDRI :', error);
});

scene.background = new THREE.Color(0xd6d0c3);

const diamondMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.2,
    roughness: 0.01,
    transmission: 1.0,
    ior: 2.42,
    sheen: 0.8,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 3.0
});

const rubyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xE0115F,
    metalness: 0.2,
    roughness: 0.02,
    transmission: 1.0,
    ior: 1.77,
    sheen: 0.7,
    clearcoat: 0.9,
    envMapIntensity: 2.5
});

const yellowDiamondMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xFFFEA0,
    metalness: 0.2,
    roughness: 0.01,
    transmission: 1.0,
    ior: 2.42,
    sheen: 0.8,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    envMapIntensity: 3.0
});

const ringMaterialGold = new THREE.MeshPhysicalMaterial({
    color: 0xFFD700,
    metalness: 1.0,
    roughness: 0.1,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
    envMapIntensity: 2.0
});

const ringMaterialSilver = new THREE.MeshPhysicalMaterial({
    color: 0xE0E0E0,
    metalness: 1.0,
    roughness: 0.1,
    clearcoat: 0.6,
    clearcoatRoughness: 0.1,
    envMapIntensity: 2.0
});

const ringMaterialRoseGold = new THREE.MeshPhysicalMaterial({
    color: 0xC29F9F,
    metalness: 1.0,
    roughness: 0.2,
    clearcoat: 0.4,
    clearcoatRoughness: 0.15,
    envMapIntensity: 2.0
});

const light = new THREE.AmbientLight(0x404040, 1);
scene.add(light);

const spotLight = new THREE.SpotLight(0xffffff, 1.5);
spotLight.position.set(2, 3, 2);
spotLight.castShadow = true;
scene.add(spotLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const loader = new GLTFLoader();
let model = null;

loader.load('./model.glb', (gltf) => {
    model = gltf.scene;
    model.traverse((child) => {
        if (child.isMesh) {
            if (child.name.toLowerCase().includes("stone")) {
                child.material = diamondMaterial;
            } else if (child.name.toLowerCase().includes("ring")) {
                child.material = ringMaterialGold;
            }
        }
    });
    model.scale.set(0.5, 0.5, 0.5);
    scene.add(model);
}, undefined, (error) => {
    console.error('Erreur lors du chargement du modèle :', error);
});

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const vignettePass = new ShaderPass(VignetteShader);
composer.addPass(vignettePass);

vignettePass.uniforms['offset'].value = 0.8;
vignettePass.uniforms['darkness'].value = 1.5;

let isMouseDown = false;
let previousMousePosition = { x: 0, y: 0 };

document.addEventListener('mousedown', () => {
    isMouseDown = true;
});

document.addEventListener('mouseup', () => {
    isMouseDown = false;
});

document.addEventListener('mousemove', (event) => {
    if (isMouseDown && model) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        model.rotation.y += deltaX * 0.01;
        model.rotation.x += deltaY * 0.01;
    }
    previousMousePosition = { x: event.clientX, y: event.clientY };
});

document.getElementById('ruby').addEventListener('click', () => {
    changeStoneMaterial(rubyMaterial);
});

document.getElementById('diamond').addEventListener('click', () => {
    changeStoneMaterial(diamondMaterial);
});

document.getElementById('yellowDiamond').addEventListener('click', () => {
    changeStoneMaterial(yellowDiamondMaterial);
});

document.getElementById('gold').addEventListener('click', () => {
    changeRingMaterial(ringMaterialGold);
});

document.getElementById('silver').addEventListener('click', () => {
    changeRingMaterial(ringMaterialSilver);
});

document.getElementById('roseGold').addEventListener('click', () => {
    changeRingMaterial(ringMaterialRoseGold);
});

function changeStoneMaterial(material) {
    if (model) {
        model.traverse((child) => {
            if (child.isMesh && child.name.toLowerCase().includes("stone")) {
                child.material = material;
                child.material.needsUpdate = true;
            }
        });
    }
}

function changeRingMaterial(material) {
    if (model) {
        model.traverse((child) => {
            if (child.isMesh && child.name.toLowerCase().includes("ring")) {
                child.material = material;
                child.material.needsUpdate = true;
            }
        });
    }
}

function animate() {
    if (model) {
        model.rotation.y += 0.001;
    }
    composer.render();
}

renderer.setAnimationLoop(animate);
