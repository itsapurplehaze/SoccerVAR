document.addEventListener("DOMContentLoaded", function() {
  const startButton = document.querySelector("#startButton");
  const landingPage = document.querySelector("#landing-page");
  const arContainer = document.querySelector("#ar-container");
	const sceneEl = document.querySelector("a-scene");
  const errorMessageEl = document.querySelector("#error-message");

	let arSystem;
  let arReady = false;

  sceneEl.addEventListener("arReady", () => {
	  arSystem = sceneEl.systems["mindar-image-system"];
    arReady = true;
    console.log("MindAR está listo");

    startButton.disabled = false;
    startButton.textContent = "INICIAR";
  });

  sceneEl.addEventListener("arError", (event) => {
    errorMessageEl.textContent = "Error al iniciar la cámara. Verifique los permisos del navegador o intente con otro dispositivo.";
    errorMessageEl.classList.remove('hidden');
    console.error("MindAR falló al iniciar:", event);
    landingPage.classList.remove('hidden');
    arContainer.classList.add('hidden');
  });
  
  startButton.addEventListener('click', async () => {
    console.log("Comenzando la experiencia SoccerVAR...");

    // Inicia el motor de AR. Esto solicitará los permisos de la cámara.
    if (!arReady || !arSystem) {
      errorMessageEl.textContent = "Error: El sistema AR presenta un problema. Por favor, recargue la página.";
      errorMessageEl.classList.remove('hidden');
      return;
    } 
    
    try {
      await arSystem.start();
      landingPage.classList.add('hidden');
      arContainer.classList.remove('hidden');
    } catch (e) {
      console.error("Error al iniciar AR:", e);
      errorMessageEl.textContent = "Error al iniciar AR. Revise los permisos de cámara."
      errorMessageEl.classList.remove("hidden");
    }
  });

  /*Detección de banderas*/
    const mexicoFlagTarget = document.querySelector("#Mexico-flag");
    mexicoFlagTarget.addEventListener("targetFound", () => {
      console.log("¡Bandera de México!");
    });
    mexicoFlagTarget.addEventListener("targetLost", () => {
      console.log("Bandera perdida");
    });
}); 