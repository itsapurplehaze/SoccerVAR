document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.querySelector("#startButton");
  const landingPage = document.querySelector("#landing-page");
  const arContainer = document.querySelector("#ar-container");
  const sceneEl = document.querySelector("a-scene");
  const errorMessageEl = document.querySelector("#error-message");

  //espera a que la escena esté lista
  const waitSceneLoaded = () => new Promise((resolve) => {
    if (sceneEl.hasLoaded) return resolve();
    sceneEl.addEventListener("loaded", resolve, { once: true });
  });

  //prueba permisos de cámara antes de iniciar MindAR
  const probeCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err = new Error("Tu navegador no soporta getUserMedia o no está en HTTPS.");
      err.code = "UNSUPPORTED";
      throw err;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } }, audio: false
    });
    stream.getTracks().forEach(t => t.stop());
  };

  const showError = (msg) => {
    errorMessageEl.textContent = msg;
    errorMessageEl.classList.remove("hidden");
  };

  startButton.addEventListener("click", async () => {
    errorMessageEl.classList.add("hidden");
    startButton.textContent = "INICIAR...";
    startButton.disabled = true;
    landingPage.classList.add("hidden");
    arContainer.classList.remove("hidden");

    try {
      // 1) Verifica HTTPS/localhost
      const isSecure = window.isSecureContext || location.protocol === "https:" || location.hostname === "localhost";
      if (!isSecure) {
        throw Object.assign(new Error("La cámara requiere HTTPS o localhost."), { code: "INSECURE_CONTEXT" });
      }

      // 2) Espera a que A-Frame esté listo
      await waitSceneLoaded();

      // 3) Sonda de permisos de cámara
      await probeCamera();

      // 4) Arranca MindAR
      const arSystem = sceneEl.systems["mindar-image-system"];
      if (!arSystem || !arSystem.start) {
        throw Object.assign(new Error("MindAR no está inicializado en la escena."), { code: "AR_UNAVAILABLE" });
      }

      await arSystem.start();
      console.log("Sistema AR iniciado por el usuario.");
      startButton.textContent = "Ejecutando...";

    } catch (e) {
      console.error("Error al iniciar AR:", e);

      // Mensajes específicos según el error
      if (e.name === "NotAllowedError") {
        showError("Has denegado el permiso de cámara. Ve a los permisos del navegador y habilítala, luego recarga.");
      } else if (e.name === "NotFoundError" || e.name === "OverconstrainedError") {
        showError("No se encontró una cámara disponible. Conecta una cámara o cambia de dispositivo.");
      } else if (e.name === "NotReadableError" || e.name === "TrackStartError") {
        showError("Otra app está usando la cámara. Ciérrala e inténtalo de nuevo.");
      } else if (e.code === "INSECURE_CONTEXT") {
        showError("La cámara requiere HTTPS o localhost");
      } else if (e.code === "UNSUPPORTED") {
        showError("Tu navegador no soporta acceso a cámara. Prueba con Chrome/Edge/Safari actualizados.");
      } else if (e.code === "AR_UNAVAILABLE") {
        showError("MindAR no está listo. Revisa que el script de MindAR cargó y que el atributo mindar-image está en <a-scene>.");
      } else {
        showError("Error al iniciar AR. Revisa permisos de cámara y recarga la página.");
      }

      // Revertir UI
      landingPage.classList.remove("hidden");
      arContainer.classList.add("hidden");
      startButton.textContent = "Reintentar";
      startButton.disabled = false;
    }
  });

  // Eventos de target
  const mexicoFlagTarget = document.querySelector("#Mexico-flag");
  if (mexicoFlagTarget) {
    mexicoFlagTarget.addEventListener("targetFound", () => console.log("¡Bandera de México!"));
    mexicoFlagTarget.addEventListener("targetLost",  () => console.log("Bandera perdida"));
  }
});
