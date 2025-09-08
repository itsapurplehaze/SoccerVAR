/*Para que no tiemble el modelo*/
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
});

document.addEventListener("DOMContentLoaded", function() {
	const sceneEl = document.querySelector('a-scene');
	let arSystem;

	sceneEl.addEventListener('loaded', function () {
	  const arSystem = sceneEl.systems["mindar-image-system"];
    const target = document.querySelector("#Mexico-flag");

    /*Detecta bandera México */
    target.addEventListener("targetFound", () => {
      console.log("¡Bandera de México!");
    });
    target.addEventListener("targetLost", () => {
      console.log("Bandera perdida");
    });
  });
}); 

/*TODO VA DENTRO addEventListener si decido agregarlo

	const exampleTarget = document.querySelector('#example-target');
	const examplePlane = document.querySelector('#example-plane');
	const startButton = document.querySelector("#example-start-button");
	const stopButton = document.querySelector("#example-stop-button");
	const pauseButton = document.querySelector("#example-pause-button");
	const pauseKeepVideoButton = document.querySelector("#example-pause-keep-video-button");
	const unpauseButton = document.querySelector("#example-unpause-button");
	startButton.addEventListener('click', () => {
	  console.log("start");
	  arSystem.start(); // start AR 
	});
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