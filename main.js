import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const width = window.innerWidth, height = window.innerHeight;

// Initialisation de la caméra et de la scène
const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10);
camera.position.z = 2;

const scene = new THREE.Scene();

// Charger un fond clair (HDRi ou couleur unie)
const hdrLoader = new RGBELoader();
hdrLoader.load('./assets/rooftop_night_4k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping; // Mapping pour réflexion
    scene.environment = texture;
    scene.background = texture;
}, undefined, (error) => {
    console.error('Erreur lors du chargement du HDRi:', error);
    scene.background = new THREE.Color(0xCCCCCC); // Gris clair si HDRi échoue
});

// Définir des matériaux de test
const plasticMaterial = new THREE.MeshStandardMaterial({
    color: 0xFF5733,  // Rouge orangé
    metalness: 0.1,
    roughness: 0.7
});

const basicMaterial = new THREE.MeshBasicMaterial({
    color: 0x3498DB, // Bleu
});

const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF, // Blanc
    wireframe: true
});

// Lumières
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Chargement du modèle GLTF
const loader = new GLTFLoader();
let model = null;

loader.load('./model.glb', (gltf) => {
    model = gltf.scene;
    model.traverse((child) => {
        if (child.isMesh) {
            if (child.name.toLowerCase().includes("stone")) {
                child.material = new THREE.MeshPhysicalMaterial({
                    color: 0xffffff,
                    metalness: 0.0,
                    roughness: 0.05,
                    transmission: 0.9,
                    ior: 2.42,
                    envMapIntensity: 1.0
                });
            } else if (child.name.toLowerCase().includes("ring")) {
                child.material = new THREE.MeshPhysicalMaterial({
                    color: 0xFFD700, // Or par défaut
                    metalness: 1.0,
                    roughness: 0.2
                });
            }
        }
    });
    model.scale.set(0.5, 0.5, 0.5);
    scene.add(model);
}, undefined, (error) => {
    console.error('Erreur lors du chargement du modèle :', error);
});

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Rotation manuelle
let isMouseDown = false;
let previousMousePosition = { x: 0, y: 0 };

document.addEventListener('mousedown', () => isMouseDown = true);
document.addEventListener('mouseup', () => isMouseDown = false);
document.addEventListener('mousemove', (event) => {
    if (isMouseDown && model) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        model.rotation.y += deltaX * 0.01;
        model.rotation.x += deltaY * 0.01;
    }
    previousMousePosition = { x: event.clientX, y: event.clientY };
});

// Animation
function animate() {
    renderer.render(scene, camera);
}

// Boutons pour tester les changements de matériaux
document.getElementById('plastic').addEventListener('click', () => {
    changeRingMaterial(plasticMaterial);
});
document.getElementById('basic').addEventListener('click', () => {
    changeRingMaterial(basicMaterial);
});
document.getElementById('wireframe').addEventListener('click', () => {
    changeRingMaterial(wireframeMaterial);
});

// Fonction pour changer le matériau de l'anneau
function changeRingMaterial(material) {
    if (model) {
        model.traverse((child) => {
            if (child.isMesh && child.name.toLowerCase().includes("ring")) {
                child.material = material;
                child.material.needsUpdate = true; // Assurer la mise à jour
            }
        });
    }
}
