document.addEventListener("DOMContentLoaded", function() {
  const startButton = document.querySelector("#startButton");
  const landingPage = document.querySelector("#landing-page");
  const arContainer = document.querySelector("#ar-container");
  const sceneEl = document.querySelector("a-scene");
  const errorMessageEl = document.querySelector("#error-message");

  startButton.addEventListener('click', async () => {
    //Cambia el texto del botón y lo deshabilita para evitar múltiples clics.
    startButton.textContent = "INICIAR...";
    startButton.disabled = true;

    //Oculta la página de inicio y muestra el contenedor de AR.
    landingPage.classList.add('hidden');
    arContainer.classList.remove('hidden');

    try {
      //permisos de cámara.
      const arSystem = sceneEl.systems["mindar-image-system"];
      await arSystem.start(); 
      console.log("Sistema AR iniciado por el usuario.");

    } catch (e) {
      //Si usuario niega permisos o hay error
      console.error("Error al iniciar AR:", e);
      errorMessageEl.textContent = "Error al iniciar AR. Revisa los permisos de cámara y recarga la página.";
      errorMessageEl.classList.remove("hidden");
      
      //Opcional: Volver a mostrar la landing page si falla
      landingPage.classList.remove('hidden');
      arContainer.classList.add('hidden');
      startButton.textContent = "Reintentar";
      startButton.disabled = false;
    }
  });

  /* Detección de banderas*/
  const mexicoFlagTarget = document.querySelector("#Mexico-flag");
  mexicoFlagTarget.addEventListener("targetFound", () => {
    console.log("¡Bandera de México!");
  });
  mexicoFlagTarget.addEventListener("targetLost", () => {
    console.log("Bandera perdida");
  });
});