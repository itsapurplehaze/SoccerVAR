document.addEventListener("DOMContentLoaded", function() {
  const startButton = document.querySelector("#startButton");
  const landingPage = document.querySelector("#landing-page");
  const arContainer = document.querySelector("#ar-container");
	const sceneEl = document.querySelector('a-scene');
  const errorMessageEl = document.querySelector("#error-message");

	let arSystem;
	sceneEl.addEventListener('loaded', () => {
	  arSystem = sceneEl.systems["mindar-image-system"];
    console.log("Sistema AR listo");
  });
  
  startButton.addEventListener('click', () => {
    console.log("Comenzando la experiencia SoccerVAR...");

    // Inicia el motor de AR. Esto solicitará los permisos de la cámara.
    if (!arSystem) {
      errorMessageEl.textContent = "Error: El sistema AR presenta un problema. Por favor, recargue la página.";
      errorMessageEl.classList.remove('hidden');
      return;
    } try {
      arSystem.start();
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
      // Oculta la página de inicio y muestra el contenedor de AR
      landingPage.classList.add('hidden');
      arContainer.classList.remove('hidden');
    } catch (e) {
      console.error("Error al iniciar AR:", e);
    }
  });

  /*Para que no tiemble el modelo
  AFRAME.registerComponent('smooth-follow', {
    schema: {
      lerpFactor: {type: 'number', default: 0.1}
    },
    tick: function () {
      const target = this.el.parentEl.object3D;
      const current = this.el.object3D;
      current.position.lerp(target.position, this.data.lerpFactor);
      current.quaternion.slerp(target.quaternion, this.data.lerpFactor);
    }
  });*/

  // Oyentes de eventos
  sceneEl.addEventListener("arReady", (event) => {
    console.log("MindAR está listo para la detección de targets.");
  });

  sceneEl.addEventListener("arError", (event) => {
    errorMessageEl.textContent = "Error al iniciar la cámara. Verifique los permisos del navegador o intente con otro dispositivo.";
    errorMessageEl.classList.remove('hidden');
    console.error("MindAR falló al iniciar:", event);
    landingPage.classList.remove('hidden');
    arContainer.classList.add('hidden');
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










/*TODO VA DENTRO addEventListener si decido agregarlo

	const exampleTarget = document.querySelector('#example-target');
	const examplePlane = document.querySelector('#example-plane');
	const stopButton = document.querySelector("#example-stop-button");
	const pauseButton = document.querySelector("#example-pause-button");
	const pauseKeepVideoButton = document.querySelector("#example-pause-keep-video-button");
	const unpauseButton = document.querySelector("#example-unpause-button");

	stopButton.addEventListener('click', () => {
	  arSystem.stop(); // stop AR 
	});
	pauseButton.addEventListener('click', () => {
	  arSystem.pause(); // pause AR, pause video
	});
	pauseKeepVideoButton.addEventListener('click', () => {
	  arSystem.pause(true); // pause AR, keep video
	});
	unpauseButton.addEventListener('click', () => {
	  arSystem.unpause(); // unpause AR and video
	});
	// arReady event triggered when ready
	sceneEl.addEventListener("arReady", (event) => {
	  // console.log("MindAR is ready")
	});
	// arError event triggered when something went wrong. Mostly browser compatbility issue
	sceneEl.addEventListener("arError", (event) => {
	  // console.log("MindAR failed to start")
	});
	// detect target found
	exampleTarget.addEventListener("targetFound", event => {
	  console.log("target found");
	});
	// detect target lost
	exampleTarget.addEventListener("targetLost", event => {
	  console.log("target lost");
	});
	// detect click event
	examplePlane.addEventListener("click", event => {
	  console.log("plane click");
	});*/