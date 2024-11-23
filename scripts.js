// Prix et noms des combinaisons
const prices = {
    ruby: {
        gold: { price: 1000, name: "Bague Rubis en Or" },
        silver: { price: 800, name: "Bague Rubis en Argent" },
        roseGold: { price: 950, name: "Bague Rubis en Or Rose" }
    },
    diamond: {
        gold: { price: 1500, name: "Bague Diamant en Or" },
        silver: { price: 1200, name: "Bague Diamant en Argent" },
        roseGold: { price: 1400, name: "Bague Diamant en Or Rose" }
    },
    yellowDiamond: {
        gold: { price: 1600, name: "Bague Diamant Jaune en Or" },
        silver: { price: 1300, name: "Bague Diamant Jaune en Argent" },
        roseGold: { price: 1500, name: "Bague Diamant Jaune en Or Rose" }
    }
};

// Variables pour suivre la sélection actuelle
let selectedStone = 'diamond'; // Par défaut Diamant
let selectedRing = 'gold'; // Par défaut Or

// Fonction pour mettre à jour le nom et le prix
function updatePriceAndName() {
    const ringInfo = prices[selectedStone][selectedRing];
    document.getElementById('ringName').textContent = `${ringInfo.name}`;
    document.getElementById('ringPrice').textContent = `Prix : ${ringInfo.price}€`;
}

// Interaction avec les boutons de pierres
document.getElementById('ruby').addEventListener('click', () => {
    selectedStone = 'ruby';
    updatePriceAndName(); // Mettre à jour le prix et le nom
    if (stone) {
        stone.traverse((child) => {
            if (child.isMesh) child.material = rubyMaterial;
        });
    }
});

document.getElementById('diamond').addEventListener('click', () => {
    selectedStone = 'diamond';
    updatePriceAndName(); // Mettre à jour le prix et le nom
    if (stone) {
        stone.traverse((child) => {
            if (child.isMesh) child.material = diamondMaterial;
        });
    }
});

document.getElementById('yellowDiamond').addEventListener('click', () => {
    selectedStone = 'yellowDiamond';
    updatePriceAndName(); // Mettre à jour le prix et le nom
    if (stone) {
        stone.traverse((child) => {
            if (child.isMesh) child.material = yellowDiamondMaterial;
        });
    }
});

// Interaction avec les boutons de métal
document.getElementById('gold').addEventListener('click', () => {
    selectedRing = 'gold';
    updatePriceAndName(); // Mettre à jour le prix et le nom
    if (ring) {
        ring.traverse((child) => {
            if (child.isMesh) child.material = goldMaterial;
        });
    }
});

document.getElementById('silver').addEventListener('click', () => {
    selectedRing = 'silver';
    updatePriceAndName(); // Mettre à jour le prix et le nom
    if (ring) {
        ring.traverse((child) => {
            if (child.isMesh) child.material = silverMaterial;
        });
    }
});

document.getElementById('roseGold').addEventListener('click', () => {
    selectedRing = 'roseGold';
    updatePriceAndName(); // Mettre à jour le prix et le nom
    if (ring) {
        ring.traverse((child) => {
            if (child.isMesh) child.material = roseGoldMaterial;
        });
    }
});

// Initialiser la scène, la caméra et le rendu
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight); // Largeur et hauteur 100% de la fenêtre
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// Mettre à jour dynamiquement la taille du rendu lors du redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight; // Ajuster le ratio de la caméra
    camera.updateProjectionMatrix(); // Mettre à jour la projection de la caméra
});

// Définir un fond clair
scene.background = new THREE.Color(0xE4E4E4); // Fond blanc clair

// Lumière pour éclairer le modèle
const light = new THREE.PointLight(0xFFFFFF, 1, 100);
light.position.set(0, 5, 5);
scene.add(light);

// Charger l'image HDR pour éclairage
const rgbeLoader = new THREE.RGBELoader();
rgbeLoader.load('./assets/rooftop_night_4k.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
});

// Matériaux pour pierres avec améliorations
const rubyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x9B111E,  // Un rouge plus profond pour le rubis
    metalness: 0.6, 
    roughness: 0.3,    // Réduction du roughness pour plus de brillance
    transparent: true, 
    opacity: 0.9       // Légèrement plus transparent pour un effet réaliste
});

const diamondMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xB9E3F9,  // Une couleur plus claire pour imiter le diamant
    metalness: 1.0,    // Brillance maximale pour simuler la réflexion intense
    roughness: 0.05,   // Très peu de roughness pour l'aspect poli du diamant
    transparent: true, 
    opacity: 0.95      // Haute transparence pour un aspect réaliste
});

const yellowDiamondMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xF1D100,  // Jaune plus saturé pour imiter un diamant jaune
    metalness: 0.9,    // Haute brillance
    roughness: 0.1,    // Faible roughness pour un aspect lisse et brillant
    transparent: true, 
    opacity: 0.9       // Transparence élevée
});


// Matériaux pour bague
const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xFFCC66, metalness: 1, roughness: 0.3 });
const silverMaterial = new THREE.MeshStandardMaterial({ color: 0xD3D3D3, metalness: 1, roughness: 0.4 });
const roseGoldMaterial = new THREE.MeshStandardMaterial({ color: 0xE4B7B2, metalness: 1, roughness: 0.4 });

// Variables de modèle et objets
let model, stone, ring;

// Fonction pour charger le modèle GLB
function loadModel() {
    const loader = new THREE.GLTFLoader();
    loader.load('./model.glb', (gltf) => {
        model = gltf.scene;
        scene.add(model); // Ajouter le modèle à la scène

        // Trouver les objets "stone" et "ring" dans le modèle
        stone = model.getObjectByName("stone"); // Assurez-vous que le nom correspond
        ring = model.getObjectByName("ring");   // Assurez-vous que le nom correspond

        // Appliquer les matériaux par défaut (diamant et or)
        if (stone) {
            stone.traverse((child) => {
                if (child.isMesh) {
                    child.material = diamondMaterial; // Par défaut, pierre = diamant
                }
            });
        }

        if (ring) {
            ring.traverse((child) => {
                if (child.isMesh) {
                    child.material = goldMaterial; // Par défaut, métal = or
                }
            });
        }

        // Mettre à jour le prix et le nom par défaut
        updatePriceAndName();
    });
}

// Fonction d'animation et mise à jour de la caméra
function animate() {
    requestAnimationFrame(animate);
    if (model) {
        model.rotation.y += 0.002; // Rotation lente du modèle
    }
    renderer.render(scene, camera);
}

// Lancer l'animation et le modèle
loadModel();
animate();

// Contrôles de la caméra (rotation et zoom)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.enableRotate = true; // Permettre la rotation du modèle
controls.enablePan = false; // Désactiver le pan
controls.screenSpacePanning = false;

// Initialisation de la caméra
camera.position.set(0, 1, 5);
camera.lookAt(0, 0, 0); // Positionner la caméra pour qu'elle regarde le modèle

// Variables pour la gravure
const engravingInput = document.getElementById('engraving-input');
const engravingButton = document.getElementById('engravingButton');
const engravingText = document.getElementById('engraving-text');

// Gestion de l'option de gravure
engravingButton.addEventListener('click', () => {
    const engravingValue = engravingInput.value.trim();
    
    if (engravingValue) {
        engravingText.textContent = `Gravure ajoutée : "${engravingValue}"`;
    } else {
        engravingText.textContent = "Aucune gravure sélectionnée";
    }
});

// Gestion du bouton Acheter (facultatif)
document.getElementById('buyButton').addEventListener('click', () => {
    const engravingValue = engravingInput.value.trim();
    if (engravingValue) {
        alert(`Vous avez acheté la bague avec la gravure : "${engravingValue}"`);
    } else {
        alert("Vous avez acheté la bague sans gravure.");
    }
});