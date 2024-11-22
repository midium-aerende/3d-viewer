// Déclaration des variables globales
let scene, camera, renderer, ring;

// Initialisation de la scène
function init() {
  // Scène
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // Caméra
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 5);

  // Rendu
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Contrôles de la caméra
  const controls = new OrbitControls(camera, renderer.domElement);

  // Lumières
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7.5);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  scene.add(ambientLight);

  // Charger le modèle
  loadModel();

  // Redimensionnement
  window.addEventListener("resize", onWindowResize, false);

  // Animation
  animate();
}

// Chargement du modèle 3D
function loadModel() {
  const loader = new OBJLoader();
  const modelPath = "./ring.obj"; // Assurez-vous que ce chemin est correct !

  loader.load(
    modelPath,
    (obj) => {
      // Le modèle est chargé avec succès
      console.log("Modèle chargé :", obj);
      ring = obj;

      // Réglage de l'échelle et de la position
      ring.scale.set(0.01, 0.01, 0.01); // Ajustez cette valeur selon la taille de votre modèle
      ring.position.set(0, 0, 0);

      // Appliquer un matériau par défaut
      ring.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ color: 0xfffff0 });
        }
      });

      // Ajouter le modèle à la scène
      scene.add(ring);

      // Mettre à jour le statut
      document.getElementById("status").textContent = "Modèle chargé avec succès !";
    },
    undefined,
    (error) => {
      // Gestion des erreurs
      console.error("Erreur lors du chargement :", error);
      document.getElementById("status").textContent =
        "Erreur : Impossible de charger le modèle. Vérifiez le chemin.";
    }
  );
}

// Mise à jour lors du redimensionnement de la fenêtre
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation de la scène
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Démarrer l'application
init();
