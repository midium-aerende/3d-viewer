let scene, camera, renderer, hdrTexture, model, controls, textureLoader;
let appliedTexture = null;
let canvas, context;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('three-container').appendChild(renderer.domElement);

    // Créer un canvas HTML pour dessiner l'image
    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');

    // Charger l'environnement HDR pour les reflets
    const rgbeLoader = new THREE.RGBELoader();
    rgbeLoader.setDataType(THREE.UnsignedByteType).load('./assets/rooftop_night_4k.hdr', function (texture) {
        hdrTexture = texture;
        hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = hdrTexture;

        // Lumière ambiante et directionnelle pour l'éclairage réaliste
        const ambientLight = new THREE.HemisphereLight(0xFFFFFF, 0x010101, 1.0);
        scene.add(ambientLight);
    });

    // Définir le fond
    scene.background = new THREE.Color(0xE5E5E5);

    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load('./model.glb', function (gltf) {
        model = gltf.scene;

        // Appliquer un matériau céramique à tout le modèle, mais nous allons modifier la texture uniquement de l'objet "map"
        model.traverse(function (child) {
            if (child.isMesh) {
                const ceramicMaterial = new THREE.MeshStandardMaterial({
                    color: 0xefefefe,
                    roughness: 0.2,
                    metalness: 0.05,
                    envMap: hdrTexture,
                    envMapIntensity: 0.6,
                    clearcoat: 0.8,
                    clearcoatRoughness: 0.05,
                    reflectivity: 0.4
                });

                // Si l'objet est celui avec le nom "map", nous n'appliquons pas ce matériau général
                if (child.name === "map") {
                    // Ne pas appliquer le matériau céramique ici, nous allons appliquer la texture plus tard
                } else {
                    child.material = ceramicMaterial;
                }
            }
        });

        model.scale.set(1, 1, 1);
        model.position.set(0, 0, 0);
        scene.add(model);
    }, undefined, function (error) {
        console.error(error);
    });

    camera.position.z = 5;
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
    textureLoader = new THREE.TextureLoader();
}

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

init();

// Fonction pour cacher/afficher la fenêtre 2
function toggleWindow() {
    const secondWindow = document.querySelectorAll('.window')[1];
    secondWindow.classList.toggle('window-hidden');
}

let zoomFactor = 1;  // Facteur de zoom initial
const zoomStep = 0.1; // Valeur du pas de zoom

let offsetX = 0; // Décalage horizontal initial
let offsetY = 0; // Décalage vertical initial
const moveStep = 10; // Valeur du pas de déplacement

let isDragging = false; // Pour savoir si l'utilisateur est en train de déplacer
let startX, startY; // Position initiale de la souris

// Ajouter les écouteurs pour gérer les interactions de la souris
canvas.addEventListener('mousedown', (event) => {
    if (event.shiftKey) {
        // Shift + clic gauche pour redimensionner
        isDragging = false; // Désactiver le déplacement
        startY = event.clientY; // Enregistrer la position Y pour le redimensionnement
    } else {
        // Clic gauche normal pour déplacer
        isDragging = true;
        startX = event.clientX - offsetX; // Enregistrer l'offset X
        startY = event.clientY - offsetY; // Enregistrer l'offset Y
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (isDragging) {
        // Déplacement de l'image
        offsetX = event.clientX - startX; // Calculer le nouvel offset X
        offsetY = event.clientY - startY; // Calculer le nouvel offset Y
        drawImageOnCanvas(); // Redessiner l'image
    } else if (event.shiftKey && event.buttons === 1) {
        // Redimensionnement lorsque Shift est maintenu
        const deltaY = event.clientY - startY; // Calculer le changement vertical
        zoomFactor = Math.max(0.1, zoomFactor - deltaY * 0.001); // Ajuster le facteur de zoom
        startY = event.clientY; // Réinitialiser la position Y
        drawImageOnCanvas(); // Redessiner l'image
    }
});

function handleMouseDown(event) {
    if (event.shiftKey) {
        // Si Shift est maintenu, activer le mode redimensionnement
        isDragging = false; // Désactiver le déplacement
        startY = event.clientY; // Enregistrer la position verticale initiale
    } else {
        // Sinon, activer le mode déplacement
        isDragging = true;
        startX = event.clientX - offsetX; // Calculer l'offset X initial
        startY = event.clientY - offsetY; // Calculer l'offset Y initial
    }
}

function handleMouseMove(event) {
    if (isDragging) {
        // Mode déplacement
        offsetX = event.clientX - startX; // Calculer le nouvel offset X
        offsetY = event.clientY - startY; // Calculer le nouvel offset Y
        drawImageOnCanvas(); // Redessiner l'image avec les nouveaux offsets
    } else if (event.shiftKey && event.buttons === 1) {
        // Mode redimensionnement (Shift + clic gauche)
        const deltaY = event.clientY - startY; // Calculer le changement vertical
        zoomFactor = Math.max(0.1, zoomFactor - deltaY * 0.001); // Ajuster le zoom avec une limite minimale
        startY = event.clientY; // Réinitialiser la position verticale
        drawImageOnCanvas(); // Redessiner l'image avec le nouveau zoom
    }
}

function handleMouseUp() {
    isDragging = false; // Désactiver le déplacement ou le redimensionnement
}

canvas.addEventListener('mouseup', () => {
    isDragging = false; // Arrêter de déplacer/redimensionner
});

// Ajouter la gestion des interactions tactiles pour déplacer et zoomer l'image
let isTouchDragging = false; // Indique si l'utilisateur déplace en mode tactile
let touchStartX = 0, touchStartY = 0; // Position initiale pour le déplacement
let initialDistance = 0; // Distance initiale entre deux doigts pour le zoom

// Fonction utilitaire pour calculer la distance entre deux touches
function getDistanceBetweenTouches(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}


let image = new Image(); // Déclarez l'objet image globalement

// Fonction pour initialiser le canvas et préparer le contexte
function initCanvas() {
    canvas = document.getElementById('imageCanvas'); // Utilisez le canvas existant dans votre HTML
    context = canvas.getContext('2d');

    // Écouteur d'événement pour l'importation d'une image
    document.getElementById('imageInput').addEventListener('change', handleImageUpload);

    // Gestion des interactions souris
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
}


// Fonction pour traiter l'image importée
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            image.onload = function() {
                // Assurez-vous que l'image est bien chargée avant de la dessiner
                drawImageOnCanvas();
            };
            image.src = e.target.result; // Charge l'image dans l'objet image
            applyTextureToMap(e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// Fonction pour dessiner l'image sur le canvas en conservant son aspect ratio

function drawImageOnCanvas() {
    const canvasWidth = 850;
    const canvasHeight = 350;

    // Calculer le ratio d'aspect de l'image
    const aspectRatio = image.width / image.height;

    let newWidth, newHeight;

    // Adapter l'image au canvas en respectant son aspect ratio
    if (aspectRatio > canvasWidth / canvasHeight) {
        newWidth = canvasWidth * zoomFactor;
        newHeight = newWidth / aspectRatio;
    } else {
        newHeight = canvasHeight * zoomFactor;
        newWidth = newHeight * aspectRatio;
    }

    // Calculer le décalage pour le centrage
    const offsetXCenter = (canvasWidth - newWidth) / 2;
    const offsetYCenter = (canvasHeight - newHeight) / 2;

    // Ajouter le déplacement tactile
    const finalOffsetX = offsetXCenter + offsetX;
    const finalOffsetY = offsetYCenter + offsetY;

    // Effacer le canvas
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // Dessiner l'image avec les nouveaux offsets
    context.drawImage(image, finalOffsetX, finalOffsetY, newWidth, newHeight);

    // Appliquer la texture mise à jour
    const canvasDataUrl = canvas.toDataURL();
    applyTextureToMap(canvasDataUrl);
}

window.addEventListener('load', initCanvas); // Initialisation du canvas au chargement de la page

// Appliquer la texture à l'objet "map" en utilisant l'intégralité des UV (0, 1)
function applyTextureToMap(textureUrl) {
    // Créer un canvas pour dessiner la couleur de fond
    const canvasBackground = document.createElement('canvas');
    const ctxBackground = canvasBackground.getContext('2d');

    const canvasWidth = 2048; // Ou toute autre taille de canvas souhaitée
    const canvasHeight = 2048;

    // Remplir le canvas avec la couleur de fond #c5c5c5
    const backgroundColor = "#fefefe";
    canvasBackground.width = canvasWidth;
    canvasBackground.height = canvasHeight;
    ctxBackground.fillStyle = backgroundColor;
    ctxBackground.fillRect(0, 0, canvasWidth, canvasHeight); // Remplir tout le canvas avec la couleur de fond

    // Charger l'image de la texture
    const image = new Image();
    image.onload = function() {
        // Calculer le ratio d'aspect de l'image
        const aspectRatio = image.width / image.height;

        // Calculer la nouvelle taille de l'image pour respecter l'aspect ratio tout en remplissant le canvas
        let newWidth, newHeight;

        if (aspectRatio > canvasWidth / canvasHeight) {
            newWidth = canvasWidth;
            newHeight = newWidth / aspectRatio;
        } else {
            newHeight = canvasHeight;
            newWidth = newHeight * aspectRatio;
        }

        // Calculer le décalage pour centrer l'image sur le canvas
        const offsetX = (canvasWidth - newWidth) / 2;
        const offsetY = (canvasHeight - newHeight) / 2;

        // Dessiner l'image sur le canvas avec le fond gris et respecter l'aspect ratio
        ctxBackground.drawImage(image, offsetX, offsetY, newWidth, newHeight);

        // Créer une texture à partir du canvas combiné (fond + image)
        const combinedTexture = new THREE.CanvasTexture(canvasBackground);
        combinedTexture.minFilter = THREE.LinearFilter; // Assurez-vous que la texture est correctement lissée
        combinedTexture.magFilter = THREE.LinearFilter;
        combinedTexture.wrapS = THREE.ClampToEdgeWrapping; // Empêcher la répétition horizontale
        combinedTexture.wrapT = THREE.ClampToEdgeWrapping; // Empêcher la répétition verticale

        // Appliquer la texture combinée à l'objet "map" sans inverser les UV
        model.traverse(function (child) {
            if (child.isMesh && child.name === "map") {
                // Appliquer la texture combinée à l'objet map
                child.material.map = combinedTexture;

                // Ne pas inverser les UV
                child.material.map.offset.set(0, 1); // Aucune inversion des UV sur l'axe Y
                child.material.map.repeat.set(1, -1); // Appliquer les coordonnées UV complètes

                // Assurez-vous que la texture utilise les UV correctement
                child.material.needsUpdate = true;
            }
        });
    };

    // Charger l'image
    image.src = textureUrl;
}

function downloadImage() {
    // Obtenez une référence au canvas principal
    const canvas = document.getElementById('imageCanvas');
    const context = canvas.getContext('2d');

    // Créer un canvas temporaire pour préparer l'image finale
    const downloadCanvas = document.createElement('canvas');
    const downloadContext = downloadCanvas.getContext('2d');

    // Taille du canvas de téléchargement
    downloadCanvas.width = canvas.width;
    downloadCanvas.height = canvas.height;

    // Dessiner le fond de la couleur de fond
    downloadContext.fillStyle = '#fefefe'; // Couleur de fond
    downloadContext.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);

    // Dessiner l'image du canvas principal
    downloadContext.drawImage(canvas, 0, 0);

    // Convertir le canvas en une image au format PNG
    const dataUrl = downloadCanvas.toDataURL('image/png');

    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'image_design.png'; // Nom du fichier téléchargé

    // Simuler un clic sur le lien pour déclencher le téléchargement
    link.click();
}

function backHome() {
    window.location.href = "../index.html";
}

// Cibler l'élément avec la classe 'image-frame'
const imageFrame = document.querySelector('.image-frame');

// Déplacez les écouteurs d'événements tactiles et souris vers l'élément `image-frame`
imageFrame.addEventListener('mousedown', handleMouseDown);
imageFrame.addEventListener('mousemove', handleMouseMove);
imageFrame.addEventListener('mouseup', handleMouseUp);

imageFrame.addEventListener('touchstart', handleTouchStart);
imageFrame.addEventListener('touchmove', handleTouchMove);
imageFrame.addEventListener('touchend', handleTouchEnd);

// Modifier les fonctions pour prendre en compte `imageFrame` au lieu de `document.body`
function handleMouseDown(event) {
    if (event.shiftKey) {
        // Si Shift est maintenu, activer le mode redimensionnement
        isDragging = false; // Désactiver le déplacement
        startY = event.clientY; // Enregistrer la position verticale initiale
    } else {
        // Sinon, activer le mode déplacement
        isDragging = true;
        startX = event.clientX - offsetX; // Calculer l'offset X initial
        startY = event.clientY - offsetY; // Calculer l'offset Y initial
    }
}

function handleMouseMove(event) {
    if (isDragging) {
        // Mode déplacement
        offsetX = event.clientX - startX; // Calculer le nouvel offset X
        offsetY = event.clientY - startY; // Calculer le nouvel offset Y
        drawImageOnCanvas(); // Redessiner l'image avec les nouveaux offsets
    } else if (event.shiftKey && event.buttons === 1) {
        // Mode redimensionnement (Shift + clic gauche)
        const deltaY = event.clientY - startY; // Calculer le changement vertical
        zoomFactor = Math.max(0.1, zoomFactor - deltaY * 0.001); // Ajuster le zoom avec une limite minimale
        startY = event.clientY; // Réinitialiser la position verticale
        drawImageOnCanvas(); // Redessiner l'image avec le nouveau zoom
    }
}

function handleMouseUp() {
    isDragging = false; // Désactiver le déplacement ou le redimensionnement
}

function handleTouchStart(event) {
    if (event.touches.length === 1) {
        // Initialiser le déplacement avec un doigt
        isTouchDragging = true;
        const touch = event.touches[0];
        touchStartX = touch.clientX - offsetX; // Calculer l'offset X initial
        touchStartY = touch.clientY - offsetY; // Calculer l'offset Y initial
    } else if (event.touches.length === 2) {
        // Initialiser le zoom avec deux doigts
        isTouchDragging = false; // Désactiver le déplacement
        initialDistance = getDistanceBetweenTouches(event.touches); // Calculer la distance initiale
    }
}

function handleTouchMove(event) {
    if (event.touches.length === 1 && isTouchDragging) {
        // Déplacer l'image avec un seul doigt
        const touch = event.touches[0];
        offsetX = touch.clientX - touchStartX; // Mettre à jour l'offset X
        offsetY = touch.clientY - touchStartY; // Mettre à jour l'offset Y
        drawImageOnCanvas(); // Redessiner l'image avec les nouveaux offsets
    } else if (event.touches.length === 2) {
        // Zoomer avec deux doigts
        const currentDistance = getDistanceBetweenTouches(event.touches);
        if (initialDistance > 0) {
            const scale = currentDistance / initialDistance; // Calculer le facteur de zoom
            zoomFactor = Math.max(0.1, zoomFactor * scale); // Ajuster le zoom (minimum 0.1)
            drawImageOnCanvas(); // Redessiner l'image avec le nouveau zoom
        }
        initialDistance = currentDistance; // Réinitialiser la distance
    }

    event.preventDefault(); // Empêcher le comportement par défaut (scroll sur mobile)
}

function handleTouchEnd() {
    isTouchDragging = false; // Arrêter le déplacement
    initialDistance = 0; // Réinitialiser la distance pour le zoom
}
