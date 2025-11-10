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
      if (!isSecure) throw Object.assign(new Error("La cámara requiere HTTPS o localhost."), { code: "INSECURE_CONTEXT" });

      // 1.5) Pide permiso de cámara ANTES de MindAR (evita dummyRun undefined)
      await probeCamera();

      //2) Espera a que A-Frame esté listo
      await waitSceneLoaded();

      //3) Arranca MindAR
      const arSystem = sceneEl.systems["mindar-image-system"];
      if (!arSystem || !arSystem.start) throw Object.assign(new Error("MindAR no está inicializado en la escena."), { code: "AR_UNAVAILABLE" });

      await arSystem.start();
      console.log("AR ON");
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
  const mexModel = document.querySelector('#Mexico-flag a-gltf-model');


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
  (() => {
    const ALL_QUESTIONS = [
      { q: "¿Qué baile popular se originó en los barrios de Buenos Aires, Argentina, en el siglo XIX?", options: ["Samba","Flamenco","Salsa","Tango"], correctIndex: 3 },
      { q: "En Australia, ¿qué animal supera en número a la población humana?", options: ["Koalas","Canguros","Emúes","Demonios de Tasmania"], correctIndex: 1 },
      { q: "¿Qué ciudad de Brasil fue diseñada con forma de avión o pájaro?", options: ["Brasilia","São Paulo","Río de Janeiro","Salvador"], correctIndex: 0 },
      { q: "¿Cuál es el segundo país más grande del mundo por superficie terrestre?", options: ["Rusia","China","Estados Unidos","Canadá"], correctIndex: 3 },
      { q: "¿Cómo se conoce el sistema de edad tradicional en Corea del Sur, donde una persona tiene un año al nacer?", options: ["Edad solar","Edad lunar","Edad nominal","Edad gregoriana"], correctIndex: 2 },
      { q: "¿Qué país lleva el nombre de una característica geográfica?", options: ["Chile","Perú","Colombia","Ecuador"], correctIndex: 3 },
      { q: "En Estados Unidos, ¿qué parque de la ciudad de Nueva York es más grande que la Ciudad del Vaticano?", options: ["Prospect Park","Hyde Park","Central Park","Golden Gate Park"], correctIndex: 2 },
      { q: "¿Cómo se llama la celebración tradicional del Año Nuevo iraní, que marca el equinoccio de primavera?", options: ["Ashura","Nowruz","Eid al-Fitr","Yalda"], correctIndex: 1 },
      { q: "¿Qué país tiene la mayor densidad de máquinas expendedoras per cápita?", options: ["Estados Unidos","China","Alemania","Japón"], correctIndex: 3 },
      { q: "¿Qué país de Oriente Medio no tiene petróleo?", options: ["Jordania","Kuwait","Arabia Saudita","Irak"], correctIndex: 0 },
      { q: "¿Cuántas lenguas indígenas se hablan en México, además del español?", options: ["67","50","25","10"], correctIndex: 0 },
      { q: "En Nueva Zelanda, ¿qué animal supera en número a las personas en una proporción de aproximadamente seis a uno?", options: ["Vacas","Kiwis","Alpacas","Ovejas"], correctIndex: 3 },
      { q: "¿Qué famoso sistema de rutas comerciales atravesaba Uzbekistán?", options: ["La Ruta del Ámbar","La Ruta de las Especias","La Ruta de la Seda","La Ruta del Incienso"], correctIndex: 2 },
      { q: "¿Qué país ha sido sede de la Copa del Mundo en tres ocasiones?", options: ["Alemania","Italia","México","Brasil"], correctIndex: 2 },
      { q: "¿Cuántos países han ganado la Copa del Mundo en su propio país?", options: ["8","2","4","6"], correctIndex: 3 }
    ];

    //
    const trivButton   = document.querySelector("#trivButton");
    const trivModalEl  = document.querySelector("#triv-modal");
    const closeBtn     = document.querySelector("#triv-close");

    const screenStart    = document.querySelector("#triv-modal .triv-dialog");
    const screenQuestion = document.querySelector("#triv-screen-question");
    const screenWin      = document.querySelector("#triv-screen-win");
    const screenLose     = document.querySelector("#triv-screen-lose");

    const beginBtn         = document.querySelector("#triv-begin-btn");
    const playAgainWinBtn  = document.querySelector("#triv-play-again-win");
    const playAgainLoseBtn = document.querySelector("#triv-play-again-lose");

    const questionText = document.querySelector("#triv-question-text");
    const optionsBox   = document.querySelector("#triv-options");
    const correctSpan  = document.querySelector("#triv-correct");
    const livesSpan    = document.querySelector("#triv-lives");

    let questionSet = [];
    let currentIndex = 0;
    let correctCount = 0;
    let livesLeft = 3;

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
      if (livesSpan)   livesSpan.textContent   = "❤️".repeat(livesLeft);
    }

    function showCurrentQuestion() {
      const qObj = questionSet[currentIndex];
      if (!qObj) return;
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
        if (idx === qObj.correctIndex) btn.classList.add("correct");
        if (idx === chosenIndex && !isCorrect) btn.classList.add("wrong");
        btn.disabled = true;
      });

      if (isCorrect) correctCount++;
      else livesLeft--;

      updateHUD();

      setTimeout(() => {
        if (correctCount >= 5) { goToScreen("win"); return; }
        if (livesLeft <= 0)   { goToScreen("lose"); return; }

        currentIndex++;
        if (currentIndex >= questionSet.length) goToScreen("lose");
        else showCurrentQuestion();
      }, 700);
    }

    function hideAll() {
      if (screenStart)    screenStart.classList.add("triv-hidden");
      if (screenQuestion) screenQuestion.classList.add("triv-hidden");
      if (screenWin)      screenWin.classList.add("triv-hidden");
      if (screenLose)     screenLose.classList.add("triv-hidden");
    }

    function goToScreen(which) {
      hideAll();
      if (which === "start"    && screenStart)    screenStart.classList.remove("triv-hidden");
      if (which === "question" && screenQuestion) screenQuestion.classList.remove("triv-hidden");
      if (which === "win"      && screenWin)      screenWin.classList.remove("triv-hidden");
      if (which === "lose"     && screenLose)     screenLose.classList.remove("triv-hidden");
    }

    if (trivButton && trivModalEl) {
      trivButton.addEventListener("click", () => {
        trivModalEl.classList.remove("triv-hidden");
        goToScreen("start");
        document.body.style.overflow = "hidden";
      });
    }

    //Cerrar con el fondo
    if (trivModalEl) {
      trivModalEl.addEventListener("click", (e) => {
        if (e.target === trivModalEl) {
          trivModalEl.classList.add("triv-hidden");
          document.body.style.overflow = "";
        }
      });
    }

    //Cerrar con ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && trivModalEl && !trivModalEl.classList.contains("triv-hidden")) {
        trivModalEl.classList.add("triv-hidden");
        document.body.style.overflow = "";
      }
    });

    //Empezar
    if (beginBtn) {
      beginBtn.addEventListener("click", () => {
        resetGame();
        goToScreen("question");
        showCurrentQuestion();
      });
    }

    //Reintentos
    if (playAgainWinBtn) {
      playAgainWinBtn.addEventListener("click", () => {
        resetGame();
        goToScreen("question");
        showCurrentQuestion();
      });
    }
    if (playAgainLoseBtn) {
      playAgainLoseBtn.addEventListener("click", () => {
        resetGame();
        goToScreen("question");
        showCurrentQuestion();
      });
    }
  })();

  //VIDEOS
  const videoOpenBtn   = document.getElementById('vidsButton');
  const vidModal       = document.getElementById('vid-modal');
  const vidDialog      = document.querySelector('.vid-dialog');
  const backFromVids   = document.getElementById('backFromVids');
  const filterButtons  = document.querySelectorAll('.filter-btn');

  const getVideoFrames = () => document.querySelectorAll('.video-frame');

  function openVidModal() {
    if (!vidModal) return;
    vidModal.classList.remove('hidden');
  }

  function closeVidModal() {
    if (!vidModal) return;
    vidModal.classList.add('hidden');

    getVideoFrames().forEach(frame => {
      const iframe = frame.querySelector('iframe');
      if (iframe) {
        const src = iframe.getAttribute('src');
        iframe.setAttribute('src', src);
      }
    });
  }

  if (videoOpenBtn) {
    videoOpenBtn.addEventListener('click', openVidModal);
  }

  //cerrar con HOME
  if (backFromVids) {
    backFromVids.addEventListener('click', closeVidModal);
  }

  //cerrar con el fondo
  if (vidModal) {
    vidModal.addEventListener('click', (ev) => {
      if (ev.target === vidModal) closeVidModal();
    });
  }

  //=== Filtros ===
  function applyFilterToVideos(filterName) {
    let filterValue = 'none';

    switch (filterName) {
      case 'none': filterValue = 'var(--filter-none)'; break;
      case 'warm': filterValue = 'var(--filter-warm)'; break;
      case 'cool': filterValue = 'var(--filter-cool)'; break;
      case 'bw'  : filterValue = 'var(--filter-bw)';   break;
      case 'retro': filterValue = 'var(--filter-retro)'; break;
    }

    getVideoFrames().forEach(frame => {
      frame.style.setProperty('--video-filter', filterValue);
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const chosen = btn.getAttribute('data-filter');
      applyFilterToVideos(chosen);
    });
  });

  document.querySelector('.filter-btn[data-filter="none"]')?.classList.add('active');

  /*UXUI AR*/
  (() => {
    const arUI         = document.getElementById('ar-ui');           
    const btnPlayAnim  = document.getElementById('btnPlayAnim');     
    const btnStats     = document.getElementById('btnStats');        
    const btnCountry   = document.getElementById('btnCountry');      
    const panelStats   = document.getElementById('panel-stats');
    const panelCountry = document.getElementById('panel-country');
    const statsBody    = document.getElementById('stats-body');
    const countryBody  = document.getElementById('country-body');
    const sceneEl          = document.querySelector('a-scene');
    const mexicoFlagTarget = document.getElementById('Mexico-flag');
    const mexModel         = document.getElementById('mexModel');

    const DATA = {
      mexico: {
        stats: {
          seleccion: "México",
          apodos: ["El Tri"],
          copasDelMundo: 0,
          copaConfederaciones: 1,
          copaOro: 13,
          ligaNacionesCONCACAF: 1,
          oroOlimpico: 1,
          bronceOlimpico: 1,
          mundialSub17: 2,
          participacionesMundial: 18,
          mejorResultado: "Cuartos de final (1970, 1986)",
          confederaciones: 1,
          estrellas: ["Hirving Lozano", "Edson Álvarez", "Santiago Giménez"]
        },
        info: {
          pais: "México",
          capital: "Ciudad de México",
          region: "Norteamérica",
          idioma: "Español",
          lenguasIndigenasReconocidas: "68",
          presidenta: "Claudia Sheinbaum Pardo",
          periodoPresidencial: "2024-2030",
          moneda: "Peso mexicano (MXN)",
          curiosidad: "Sede mundialista en 1970 y 1986."
        }
      }
    };

    //animación
    const mexModelContainer = document.getElementById('mexModelContainer');
  
    // Estado de la animación (mucho más simple)
    const animState = { playing: false };
    // Función para actualizar el botón y el estado
    function setPlayUI(isPlaying) {
      animState.playing = !!isPlaying;
      if (btnPlayAnim) {
        btnPlayAnim.textContent = animState.playing ? '⏸' : '▶';
        btnPlayAnim.setAttribute('aria-label', animState.playing ? 'Pausar' : 'Reproducir');
      }
    }
  
    // Tracking: mostrar/ocultar UI y resetear anim/botón
    mexicoFlagTarget?.addEventListener('targetFound', () => {
      arUI?.classList.remove('hidden');
      setPlayUI(false);
    });
    mexicoFlagTarget?.addEventListener('targetLost', () => {
      arUI?.classList.add('hidden');
      panelStats?.classList.add('hidden');
      panelCountry?.classList.add('hidden');
      setPlayUI(false);
    });
  
    // ▶ / ⏸
    btnPlayAnim?.addEventListener('click', () => {
      setPlayUI(!animState.playing);
    });
  
    sceneEl?.addEventListener('tick', () => {
      // Si el estado es 'playing' y el contenedor existe...
      if (animState.playing && mexModelContainer) {
        // Obtenemos la rotación actual
        const currentRotation = mexModelContainer.getAttribute('rotation');
        // Le sumamos 1 grado a la rotación en Y
        mexModelContainer.setAttribute('rotation', { 
          x: currentRotation.x, 
          y: currentRotation.y + 1, // Puedes cambiar '1' a '0.5' (más lento) o '2' (más rápido)
          z: currentRotation.z 
        });
      }
    });

    //INFO
    document.querySelectorAll('.panel-close')?.forEach(b=>{
      b.addEventListener('click', (e)=>{
        const sel = e.currentTarget.getAttribute('data-close');
        document.querySelector(sel)?.classList.add('hidden');
      });
    });

    btnStats?.addEventListener('click', () => {
      const d = DATA.mexico.stats;
      statsBody.innerHTML = `
        <p><strong>Selección:</strong> ${d.seleccion}</p>
        <p><strong>Apodos:</strong> ${d.apodos.join(', ')}</p>
        <p class="pill">Copas del Mundo: ${d.copasDelMundo}</p>
        <p class="pill">Participaciones: ${d.participacionesMundial}</p>
        <p><strong>Mejor resultado:</strong> ${d.mejorResultado}</p>
        <p class="pill">Copa Confederaciones: ${d.confederaciones}</p>
        <p class="pill">Copa Oro: ${d.copaOro}</p>
        <p class="pill">Liga de Naciones CONCACAF: ${d.ligaNacionesCONCACAF}</p>
        <p class="pill">Oro Olímpico: ${d.oroOlimpico}</p>
        <p class="pill">Bronce Olímpico: ${d.bronceOlimpico}</p>
        <p class="pill">Mundial Sub-17: ${d.mundialSub17}</p>
        <p><strong>Jugadores clave:</strong> ${d.estrellas.join(', ')}</p>
      `;
      panelCountry?.classList.add('hidden');
      panelStats?.classList.remove('hidden');
    });

    btnCountry?.addEventListener('click', () => {
      const d = DATA.mexico.info;
      countryBody.innerHTML = `
        <p><strong>País:</strong> ${d.pais}</p>
        <p><strong>Capital:</strong> ${d.capital}</p>
        <p><strong>Región:</strong> ${d.region}</p>
        <p><strong>Idioma:</strong> ${d.idioma}</p>
        <p><strong>Lenguas indígenas reconocidas:</strong> ${d.lenguasIndigenasReconocidas}</p>
        <p><strong>Presidencia:</strong> ${d.presidenta} (${d.periodoPresidencial})</p>
        <p><strong>Moneda:</strong> ${d.moneda}</p>
        <p><strong>Dato:</strong> ${d.curiosidad}</p>
      `;
      panelStats?.classList.add('hidden');
      panelCountry?.classList.remove('hidden');
    });

    sceneEl?.addEventListener('click', (e) => {
      if (!e.target.closest?.('.ui-bar') && !e.target.closest?.('.side-panel')) {
        panelStats?.classList.add('hidden');
        panelCountry?.classList.add('hidden');
      }
    });
  })();
});
