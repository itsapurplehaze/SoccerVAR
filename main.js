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
      //1) Verifica HTTPS/localhost
      const isSecure = window.isSecureContext || location.protocol === "https:" || location.hostname === "localhost";
      if (!isSecure) {
        throw Object.assign(new Error("La cámara requiere HTTPS o localhost."), { code: "INSECURE_CONTEXT" });
      }

      //2) Espera a que A-Frame esté listo
      await waitSceneLoaded();

      //3) Sonda de permisos de cámara
      await probeCamera();

      //4) Arranca MindAR
      const arSystem = sceneEl.systems["mindar-image-system"];
      if (!arSystem || !arSystem.start) {
        throw Object.assign(new Error("MindAR no está inicializado en la escena."), { code: "AR_UNAVAILABLE" });
      }

      await arSystem.start();
      console.log("Sistema AR iniciado por el usuario.");
      startButton.textContent = "Ejecutando...";

    } catch (e) {
      console.error("Error al iniciar AR:", e);

      //Mensajes específicos según el error
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

      //Revertir UI
      landingPage.classList.remove("hidden");
      arContainer.classList.add("hidden");
      startButton.textContent = "Reintentar";
      startButton.disabled = false;
    }
  });

  //Eventos de target
  const mexicoFlagTarget = document.querySelector("#Mexico-flag");
  if (mexicoFlagTarget) {
    mexicoFlagTarget.addEventListener("targetFound", () => console.log("¡Bandera de México!"));
    mexicoFlagTarget.addEventListener("targetLost",  () => console.log("Bandera perdida"));
  }

  //HELP
  const helpButton  = document.querySelector("#helpButton");
  const helpModal   = document.querySelector("#help-modal");

  const openHelp = () => {
    helpModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  };

  const closeHelp = () => {
    helpModal.classList.add("hidden");
    document.body.style.overflow = "";
  };

  helpButton.addEventListener("click", openHelp);

  //cerrar tocando fuera del cuadro
  helpModal.addEventListener("click", (e) => {
    if (e.target === helpModal) {
      closeHelp();
    }
  });

  //cerrar ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !helpModal.classList.contains("hidden")) {
      closeHelp();
    }
  });

  //TRIVIA
  //1)preguntas
  const ALL_QUESTIONS = [
    {
      q: "¿Qué baile popular se originó en los barrios de Buenos Aires, Argentina, en el siglo XIX?",
      options: ["Samba", "Flamenco", "Salsa", "Tango"],
      correctIndex: 3
    },
    {
      q: "En Australia, ¿qué animal supera en número a la población humana?",
      options: ["Koalas", "Canguros", "Emúes", "Demonios de Tasmania"],
      correctIndex: 1
    },
    {
      q: "¿Qué ciudad de Brasil fue diseñada con forma de avión o pájaro?",
      options: ["Brasilia", "São Paulo", "Río de Janeiro", "Salvador"],
      correctIndex: 0
    },
    {
      q: "¿Cuál es el segundo país más grande del mundo por superficie terrestre?",
      options: ["Rusia", "China", "Estados Unidos", "Canadá"],
      correctIndex: 3
    },
    {
      q: "¿Cómo se conoce el sistema de edad tradicional en Corea del Sur, donde una persona tiene un año al nacer?",
      options: ["Edad solar", "Edad lunar", "Edad nominal", "Edad gregoriana"],
      correctIndex: 2
    },
    {
      q: "¿Qué país lleva el nombre de una característica geográfica?",
      options: ["Chile", "Perú", "Colombia", "Ecuador"],
      correctIndex: 3
    },
    {
      q: "En Estados Unidos, ¿qué parque de la ciudad de Nueva York es más grande que la Ciudad del Vaticano?",
      options: ["Prospect Park", "Hyde Park", "Central Park", "Golden Gate Park"],
      correctIndex: 2
    },
    {
      q: "¿Cómo se llama la celebración tradicional del Año Nuevo iraní, que marca el equinoccio de primavera?",
      options: ["Ashura", "Nowruz", "Eid al-Fitr", "Yalda"],
      correctIndex: 1
    },
    {
      q: "¿Qué país tiene la mayor densidad de máquinas expendedoras per cápita?",
      options: ["Estados Unidos", "China", "Alemania", "Japón"],
      correctIndex: 3
    },
    {
      q: "¿Qué país de Oriente Medio no tiene petróleo?",
      options: ["Jordania", "Kuwait", "Arabia Saudita", "Irak"],
      correctIndex: 0
    },
    {
      q: "¿Cuántas lenguas indígenas se hablan en México, además del español?",
      options: ["67", "50", "25", "10"],
      correctIndex: 0
    },
    {
      q: "En Nueva Zelanda, ¿qué animal supera en número a las personas en una proporción de aproximadamente seis a uno?",
      options: ["Vacas", "Kiwis", "Alpacas", "Ovejas"],
      correctIndex: 3
    },
    {
      q: "¿Qué famoso sistema de rutas comerciales atravesaba Uzbekistán?",
      options: ["La Ruta del Ámbar", "La Ruta de las Especias", "La Ruta de la Seda", "La Ruta del Incienso"],
      correctIndex: 2
    },
    {
      q: "¿Qué país ha sido sede de la Copa del Mundo en tres ocasiones?",
      options: ["Alemania", "Italia", "México", "Brasil"],
      correctIndex: 2
    },
    {
      q: "¿Cuántos países han ganado la Copa del Mundo en su propio país?",
      options: ["8", "2", "4", "6"],
      correctIndex: 3
    }
  ];

  const trivButton = document.querySelector("#trivButton");
  const triviaModal = document.querySelector("#triv-modal");
  const closeBtn = document.querySelector("#triv-close");

  const screenStart = document.querySelector("#triv-screen-start");
  const screenQuestion = document.querySelector("#triv-screen-question");
  const screenWin = document.querySelector("#triv-screen-win");
  const screenLose = document.querySelector("#triv-screen-lose");

  const beginBtn = document.querySelector("#triv-begin-btn");
  const playAgainWinBtn = document.querySelector("#triv-play-again-win");
  const playAgainLoseBtn = document.querySelector("#triv-play-again-lose");

  const questionText = document.querySelector("#triv-question-text");
  const optionsBox = document.querySelector("#triv-options");
  const correctSpan = document.querySelector("#triv-correct");
  const livesSpan = document.querySelector("#triv-lives");

  let questionSet = [];   //5 preguntas aleatorias
  let currentIndex = 0;   //índice de la pregunta actual
  let correctCount = 0;   //aciertos
  let livesLeft = 3;      //vidas

  function pick5RandomQuestions() {
    const copy = [...ALL_QUESTIONS];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 5);
  }

  function resetGame() {
    questionSet = pick5RandomQuestions();
    currentIndex = 0;
    correctCount = 0;
    livesLeft = 3;
    updateHUD();
  }

  function updateHUD() {
    if (correctSpan) correctSpan.textContent = `${correctCount}/5`;
    if (livesSpan) livesSpan.textContent = "❤️".repeat(livesLeft);
  }

  function showCurrentQuestion() {
    const qObj = questionSet[currentIndex];
    if (questionText) questionText.textContent = qObj.q;

    if (optionsBox) {
      optionsBox.innerHTML = "";
      qObj.options.forEach((text, idx) => {
        const btn = document.createElement("button");
        btn.className = "triv-option-btn";
        btn.textContent = text;
        btn.addEventListener("click", () => handleAnswer(idx));
        optionsBox.appendChild(btn);
      });
    }
  }

  function handleAnswer(chosenIndex) {
    const qObj = questionSet[currentIndex];
    const isCorrect = chosenIndex === qObj.correctIndex;

    const allOptionButtons = optionsBox ? optionsBox.querySelectorAll(".triv-option-btn") : [];
    allOptionButtons.forEach((btn, idx) => {
      if (idx === qObj.correctIndex) {
        btn.classList.add("correct");
      }
      if (idx === chosenIndex && !isCorrect) {
        btn.classList.add("wrong");
      }
      btn.disabled = true;
    });

    if (isCorrect) correctCount++;
    else livesLeft--;

    updateHUD();

    setTimeout(() => {
      if (correctCount >= 5) {
        goToScreen("win");
        return;
      }
      if (livesLeft <= 0) {
        goToScreen("lose");
        return;
      }

      currentIndex++;
      if (currentIndex >= questionSet.length) {
        goToScreen("lose");
      } else {
        showCurrentQuestion();
      }
    }, 700);
  }

  function goToScreen(which) {
    if (!screenStart || !screenQuestion || !screenWin || !screenLose) return;

    screenStart.classList.add("triv-hidden");
    screenQuestion.classList.add("triv-hidden");
    screenWin.classList.add("triv-hidden");
    screenLose.classList.add("triv-hidden");

    if (which === "start") screenStart.classList.remove("triv-hidden");
    else if (which === "question") screenQuestion.classList.remove("triv-hidden");
    else if (which === "win") screenWin.classList.remove("triv-hidden");
    else if (which === "lose") screenLose.classList.remove("triv-hidden");
  }

  if (trivButton && trivModal) {
    trivButton.addEventListener("click", () => {
      trivModal.classList.remove("triv-hidden");
      goToScreen("start");
      document.body.style.overflow = "hidden"; //bloquear scroll del fondo
    });
  }

  //cerrar con la X
  if (closeBtn && trivModal) {
    closeBtn.addEventListener("click", () => {
      trivModal.classList.add("triv-hidden");
      document.body.style.overflow = "";
    });
  }

  if (trivModal) {
    trivModal.addEventListener("click", (e) => {
      if (e.target === trivModal) {
        trivModal.classList.add("triv-hidden");
        document.body.style.overflow = "";
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && triviaModal && !triviaModal.classList.contains("triv-hidden")) {
      trivModal.classList.add("triv-hidden");
      document.body.style.overflow = "";
    }
  });

  if (beginBtn) {
    beginBtn.addEventListener("click", () => {
      resetGame();
      goToScreen("question");
      showCurrentQuestion();
    });
  }

  //"JUGAR OTRA VEZ" desde win
  if (playAgainWinBtn) {
    playAgainWinBtn.addEventListener("click", () => {
      resetGame();
      goToScreen("question");
      showCurrentQuestion();
    });
  }

  //"VOLVER A INTENTAR" desde lose
  if (playAgainLoseBtn) {
    playAgainLoseBtn.addEventListener("click", () => {
      resetGame();
      goToScreen("question");
      showCurrentQuestion();
    });
  }
});
