// Mission Loading Animation
document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById("loading-screen");
  const mainContent = document.getElementById("main-content");
  const loadingPercentage = document.querySelector(".loading-percentage");
  const backgroundMusic = document.getElementById("background-music");

  // Attempt to play background music on user interaction
  const playMusic = () => {
    if (backgroundMusic) {
      backgroundMusic.volume = 0.3; // Set volume to 30%
      backgroundMusic.play().catch((error) => {
        console.log("Autoplay prevented, waiting for user interaction:", error);
      });
    }
  };

  // Try to play music immediately
  playMusic();

  // If autoplay is blocked, play on first user interaction
  const enableAudioOnInteraction = () => {
    playMusic();
    document.removeEventListener("click", enableAudioOnInteraction);
    document.removeEventListener("keydown", enableAudioOnInteraction);
    document.removeEventListener("touchstart", enableAudioOnInteraction);
  };

  document.addEventListener("click", enableAudioOnInteraction);
  document.addEventListener("keydown", enableAudioOnInteraction);
  document.addEventListener("touchstart", enableAudioOnInteraction);

  // Check if elements exist
  if (!loadingPercentage) {
    console.error("Loading percentage element not found");
    return;
  }

  // Simulate loading progress
  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += Math.random() * 8;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadingInterval);

      // Complete loading after a short delay
      setTimeout(() => {
        completeLoading();
      }, 1500);
    }

    if (loadingPercentage) {
      loadingPercentage.textContent = Math.floor(progress) + "%";
    }
  }, 100);

  function completeLoading() {
    // Fade out loading screen
    loadingScreen.classList.add("fade-out");

    // Show main content
    setTimeout(() => {
      loadingScreen.style.display = "none";
      mainContent.classList.remove("hidden");

      // Trigger explosion sound effect (optional - can be added later)
      triggerExplosionSequence();
    }, 500);
  }

  function triggerExplosionSequence() {
    // Add screen shake effect during explosion
    const heroSection = document.querySelector(".hero-section");

    setTimeout(() => {
      heroSection.classList.add("screen-shake");

      // Remove shake after animation completes
      setTimeout(() => {
        heroSection.classList.remove("screen-shake");
      }, 600);
    }, 300); // Sync with explosion animation start
  }

  // Missile Animation on Scroll
  let lastScrollY = 0;
  let lastScrollDirection = null; // Track the last scroll direction
  let missileTimeout = null;
  let isAnimating = false;
  let scrollCheckTimeout = null;
  const missile = document.getElementById("missile");
  const missileContainer = document.getElementById("missile-container");
  const explosionBottomRight = document.getElementById(
    "explosion-bottom-right",
  );
  const explosionTopLeft = document.getElementById("explosion-top-left");
  const heroSection = document.getElementById("hero");
  const scrollSection = document.getElementById("scroll-section-1");

  function triggerMissile(direction) {
    if (isAnimating) return;

    isAnimating = true;

    // Remove previous animation classes
    missile.classList.remove("fly-down", "fly-up");
    explosionBottomRight.classList.remove("explode");
    explosionTopLeft.classList.remove("explode");

    // Force reflow to restart animation
    void missile.offsetWidth;

    // Add appropriate animation class
    if (direction === "down") {
      missile.classList.add("fly-down");

      // Trigger explosion at bottom-right after missile reaches edge
      setTimeout(() => {
        triggerExplosion("bottom-right");
      }, 1200); // Trigger just before missile disappears (1.5s animation - 300ms)
    } else {
      missile.classList.add("fly-up");

      // Trigger explosion at top-left after missile reaches edge
      setTimeout(() => {
        triggerExplosion("top-left");
      }, 1200); // Trigger just before missile disappears (1.5s animation - 300ms)
    }

    // Reset after animation completes
    setTimeout(() => {
      isAnimating = false;
      missile.classList.remove("fly-down", "fly-up");
    }, 1500);
  }

  function triggerExplosion(position) {
    const explosion =
      position === "bottom-right" ? explosionBottomRight : explosionTopLeft;

    // Add explosion animation
    explosion.classList.add("explode");

    // Add screen flash effect
    missileContainer.classList.add("flash");

    // Add screen shake
    const bodyElement = document.body;
    bodyElement.style.animation =
      "screenShake 0.4s cubic-bezier(.36,.07,.19,.97) both";

    // Clean up explosion after animation
    setTimeout(() => {
      explosion.classList.remove("explode");
      missileContainer.classList.remove("flash");
      bodyElement.style.animation = "";
    }, 1200);
  }

  // Scroll direction detection and missile triggering
  if (mainContent) {
    mainContent.addEventListener("scroll", () => {
      const currentScrollY = mainContent.scrollTop;

      // Ignore tiny scroll changes (less than 5 pixels)
      if (Math.abs(currentScrollY - lastScrollY) < 5) {
        return;
      }

      // Determine current scroll direction
      const currentDirection = currentScrollY > lastScrollY ? "down" : "up";

      // Check if direction has changed
      if (
        currentDirection !== lastScrollDirection &&
        lastScrollDirection !== null
      ) {
        // Direction changed! Trigger missile animation
        if (!isAnimating) {
          triggerMissile(currentDirection);
          // Update last scroll position and direction ONLY when animation starts
          lastScrollY = currentScrollY;
          lastScrollDirection = currentDirection;
        }
      } else if (lastScrollDirection === null) {
        // First scroll - trigger missile
        if (!isAnimating) {
          triggerMissile(currentDirection);
          // Update last scroll position and direction ONLY when animation starts
          lastScrollY = currentScrollY;
          lastScrollDirection = currentDirection;
        }
      } else {
        // Same direction, just update scroll position
        lastScrollY = currentScrollY;
      }
    });

    // Parallax scrolling effect for warfield background
    mainContent.addEventListener("scroll", () => {
      const scrolled = mainContent.scrollTop;
      const warfield = document.querySelector(".warfield-background");

      if (warfield) {
        warfield.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    });
  }

  // Section 1: Jeets Animation
  function startSection1Animation() {
    const section1 = document.getElementById("scroll-section-1");
    const textBox = section1.querySelector(".section-text-box");
    const animationContainer = section1.querySelector(
      ".jeets-animation-container",
    );
    const candlesContainer = section1.querySelector(".red-candles-container");
    const jeetsContainer = section1.querySelector(".jeets-container");

    // Clear previous animation
    candlesContainer.innerHTML = "";
    jeetsContainer.innerHTML = "";
    textBox.classList.remove("show");
    animationContainer.classList.remove("active");

    // Show text box immediately
    textBox.classList.add("show");

    // Start animation container
    animationContainer.classList.add("active");

    // Generate 15 red candles with exponential decay pattern (downward trend)
    const numCandles = 15;
    setTimeout(() => {
      for (let i = 0; i < numCandles; i++) {
        const candle = document.createElement("div");
        candle.className = "red-candle";

        // Exponential decay: tallest on left, shortest on right
        const progress = i / (numCandles - 1); // 0 to 1
        const baseHeight = 400 * Math.exp(-3 * progress); // Exponential decay
        const variation = Math.random() * 30 - 15; // Small random variation
        const height = Math.max(50, baseHeight + variation); // Minimum 50px

        candle.style.height = `${height}px`;
        candle.style.animationDelay = `${i * 0.1}s`;
        candlesContainer.appendChild(candle);
      }
    }, 600); // Start shortly after text box appears

    // Spawn 100 Jeets over 2 seconds
    const numJeets = 100;
    const spawnDuration = 2000; // 2 seconds

    for (let i = 0; i < numJeets; i++) {
      setTimeout(
        () => {
          const jeet = document.createElement("img");
          jeet.src = "img/Character - NPC.png";
          jeet.className = "jeet-character";

          // Random position based on candle locations
          const candleIndex = Math.floor(Math.random() * numCandles);

          // Position jeet near a candle
          const left =
            (candleIndex / numCandles) * 100 + (Math.random() * 5 - 2.5);
          const bottom = Math.random() * 30 + 20; // Random height above candles

          jeet.style.left = `${left}%`;
          jeet.style.bottom = `${bottom}%`;
          jeet.style.animationDelay = "0s";

          jeetsContainer.appendChild(jeet);
        },
        (i / numJeets) * spawnDuration + 600,
      ); // Start with candles
    }
  }

  // Section 2: Resistance Animation
  // Pre-defined positions for Section 2 (used in both Section 2 and Section 3)
  const section2Positions = {
    tank: { left: 5, top: 50 },
    resistanceCharacters: [
      { left: 45, top: 15 }, // Catpop - top center-left
      { left: 10, top: 15 }, // DogeWW1 - top left
      { left: 42, top: 25 }, // Dogwifhat - upper-mid left
      { left: 27, top: 10 }, // Moodeng - top center (between Doge and Popcat, higher)
      { left: 45, top: 58 }, // Pepe - mid center-left
      { left: 20, top: 62 }, // Wojak - lower-mid left
      { left: 8, top: 75 }, // Soyjak - lower left
      { left: 38, top: 88 }, // Shiba - bottom center-left
    ],
    landmines: [
      { left: 55, top: 65 },
      { left: 70, top: 55 },
      { left: 45, top: 75 },
      { left: 80, top: 70 },
      { left: 60, top: 85 },
      { left: 75, top: 80 },
    ],
    jeets: [], // Will be populated dynamically
  };

  // Store Section 2 state for use in Section 3
  const section2State = {
    jeets: [],
    landmines: [],
    tank: null,
    resistanceCharacters: [],
  };

  function startSection2Animation() {
    const section2 = document.getElementById("scroll-section-2");
    const textBox = section2.querySelector(".section-text-box");
    const animationContainer = section2.querySelector(
      ".resistance-animation-container",
    );
    const tankContainer = section2.querySelector(".tank-container");
    const landminesContainer = section2.querySelector(".landmines-container");
    const resistanceContainer = section2.querySelector(
      ".resistance-characters-container",
    );
    const jeetsSeaContainer = section2.querySelector(".jeets-sea-container");

    // Clear previous animation
    tankContainer.innerHTML = "";
    landminesContainer.innerHTML = "";
    resistanceContainer.innerHTML = "";
    jeetsSeaContainer.innerHTML = "";
    textBox.classList.remove("show");
    animationContainer.classList.remove("active");
    tankContainer.classList.remove("enter");
    jeetsSeaContainer.classList.remove("active");

    // Reset state
    section2State.jeets = [];
    section2State.landmines = [];
    section2State.tank = null;
    section2State.resistanceCharacters = [];

    // Show text box immediately
    textBox.classList.add("show");

    // Start animation container
    animationContainer.classList.add("active");

    // Use predefined positions

    // Step 1: Spawn sea of jeets first (right side)
    const numJeetsSea = 50;

    setTimeout(() => {
      jeetsSeaContainer.classList.add("active");

      // Spawn jeets in a dense grid pattern on right side
      for (let i = 0; i < numJeetsSea; i++) {
        setTimeout(() => {
          const jeet = document.createElement("img");
          jeet.src = "img/Character - NPC.png";
          jeet.className = "jeet-sea-character";

          // Create dense grid: 5 columns x 10 rows
          const col = i % 5;
          const row = Math.floor(i / 5);

          // Position in grid with slight random offset
          const leftInContainer = col * 20 + (Math.random() * 8 - 4); // 0-80% within container
          const top = row * 10 + (Math.random() * 5 - 2.5); // 0-90% within container

          jeet.style.left = `${leftInContainer}%`;
          jeet.style.top = `${top}%`;
          jeet.style.animationDelay = `${(i / numJeetsSea) * 0.8}s`;

          jeetsSeaContainer.appendChild(jeet);

          // Store jeet position - convert to absolute position (container is 20% wide at right: 0)
          const absoluteLeft = 80 + leftInContainer * 0.2; // 80% + position within 20% container
          section2State.jeets.push({ left: absoluteLeft, top, element: jeet });
        }, 100);
      }
    }, 500); // Start shortly after text box

    // Step 4: Place landmines at fixed positions one by one (after jeets sea completes)
    section2Positions.landmines.forEach((position, i) => {
      setTimeout(
        () => {
          const landmine = document.createElement("img");
          landmine.src = "img/Aux - Landmine.png";
          landmine.className = "landmine";

          landmine.style.left = `${position.left}%`;
          landmine.style.top = `${position.top}%`;

          // Randomize animation delay for varied throbbing
          landmine.style.animationDelay = `${Math.random() * 2}s`;

          landminesContainer.appendChild(landmine);

          // Store landmine position
          section2State.landmines.push({
            left: position.left,
            top: position.top,
            element: landmine,
          });
        },
        1900 + i * 50,
      ); // After jeets sea (600ms + 1.3s), 200ms delay between each landmine
    });

    // Step 5: Add tank and trigger entrance (after landmines appear)
    setTimeout(() => {
      const tank = document.createElement("img");
      tank.src = "img/Aux - Tank.png";
      tank.alt = "Tank";
      tankContainer.appendChild(tank);

      // Store tank position
      section2State.tank = {
        left: section2Positions.tank.left,
        top: section2Positions.tank.top,
        element: tank,
      };

      // Trigger tank entrance animation
      setTimeout(() => {
        tankContainer.classList.add("enter");
      }, 50);
    }, 1900); // 0 second after landmines

    // Step 6: Spawn resistance characters (after tank enters)
    const resistanceImages = [
      "img/Character - Catpop.png",
      "img/Character - DogeWW1.png",
      "img/Character - Dogwifhat.png",
      "img/Character - Moodeng.png",
      "img/Character - Pepe.png",
      "img/Character - Wojak.png",
      "img/Character - Soyjak.png",
      "img/Character - Shiba.png",
    ];

    // Spawn each character individually with delay between them
    resistanceImages.forEach((imgSrc, i) => {
      setTimeout(
        () => {
          const character = document.createElement("img");
          character.src = imgSrc;
          character.className = "resistance-character";

          // Use fixed position for this character
          const position = section2Positions.resistanceCharacters[i];
          character.style.left = `${position.left}%`;
          character.style.top = `${position.top}%`;

          resistanceContainer.appendChild(character);

          // Store resistance character position
          section2State.resistanceCharacters.push({
            left: position.left,
            top: position.top,
            element: character,
          });

          // Trigger spawn animation
          setTimeout(() => {
            character.classList.add("spawn");
          }, 50);
        },
        2300 + i * 50,
      ); // Start after tank completes (2.9s + 2s), 300ms delay between each character
    });
  }

  // Section 3: Missile Barrage Animation
  function startSection3Animation() {
    const section3 = document.getElementById("scroll-section-3");
    const textBox = section3.querySelector(".section-text-box");

    // Clear previous animation - remove all dynamically added elements
    const existingElements = section3.querySelectorAll("img, .barrage-missile");
    existingElements.forEach((el) => el.remove());
    textBox.classList.remove("show");

    // Detect mobile portrait mode
    const isMobilePortrait = window.matchMedia(
      "(max-width: 768px) and (orientation: portrait)",
    ).matches;
    const mobileResistancePositions = [
      { left: 45, top: 15 }, // Catpop - top center-left
      { left: 10, top: 15 }, // DogeWW1 - top left
      { left: 42, top: 25 }, // Dogwifhat - upper-mid left
      { left: 27, top: 10 }, // Moodeng - top center (between Doge and Popcat, higher)
      { left: 45, top: 58 }, // Pepe - mid center-left
      { left: 20, top: 62 }, // Wojak - lower-mid left
      { left: 8, top: 75 }, // Soyjak - lower left
      { left: 38, top: 88 }, // Shiba - bottom center-left
    ];
    const resistancePositions = isMobilePortrait
      ? mobileResistancePositions
      : section2Positions.resistanceCharacters;

    // Show text box immediately
    textBox.classList.add("show");

    // Recreate Section 2 state in Section 3 using predefined positions - all appear at once
    setTimeout(() => {
      // Display all jeets at once
      section2State.jeets.forEach((jeet) => {
        const jeetImg = document.createElement("img");
        jeetImg.src = "img/Character - NPC.png";
        jeetImg.className = "jeet-sea-character";
        jeetImg.style.position = "absolute";
        jeetImg.style.left = `${jeet.left}%`;
        jeetImg.style.top = `${jeet.top}%`;
        jeetImg.style.width = "60px";
        jeetImg.style.opacity = "0";
        jeetImg.style.animation = "fadeInAnimation 0.5s ease-in forwards";
        section3.appendChild(jeetImg);
        jeet.element = jeetImg; // Update reference for missiles
      });

      // Display all landmines at once
      section2Positions.landmines.forEach((position) => {
        const landmineImg = document.createElement("img");
        landmineImg.src = "img/Aux - Landmine.png";
        landmineImg.className = "landmine";
        landmineImg.style.position = "absolute";
        landmineImg.style.left = `${position.left}%`;
        landmineImg.style.top = `${position.top}%`;
        landmineImg.style.width = "60px";
        landmineImg.style.opacity = "0";
        landmineImg.style.animation =
          "fadeInAnimation 0.5s ease-in forwards, landmineThrobbing 2s ease-in-out 0.5s infinite";
        section3.appendChild(landmineImg);
      });

      // Display tank
      const tankImg = document.createElement("img");
      tankImg.src = "img/Aux - Tank.png";
      tankImg.style.position = "absolute";
      tankImg.style.left = `${section2Positions.tank.left}%`;
      tankImg.style.top = `${section2Positions.tank.top}%`;
      tankImg.style.width = "540px";
      tankImg.style.transform = "translateY(-50%)";
      tankImg.style.filter = "drop-shadow(0 0 20px rgba(74, 124, 58, 0.6))";
      tankImg.style.opacity = "0";
      tankImg.style.animation = "fadeInAnimation 0.5s ease-in forwards";
      section3.appendChild(tankImg);

      // Display all resistance characters at once
      const resistanceImages = [
        "img/Character - Catpop.png",
        "img/Character - DogeWW1.png",
        "img/Character - Dogwifhat.png",
        "img/Character - Moodeng.png",
        "img/Character - Pepe.png",
        "img/Character - Wojak.png",
        "img/Character - Soyjak.png",
        "img/Character - Shiba.png",
      ];

      resistancePositions.forEach((position, i) => {
        const characterImg = document.createElement("img");
        characterImg.src = resistanceImages[i];
        characterImg.className = "resistance-character";
        characterImg.style.position = "absolute";
        characterImg.style.left = `${position.left}%`;
        characterImg.style.top = `${position.top}%`;
        characterImg.style.width = "140px";
        characterImg.style.opacity = "0";
        characterImg.style.filter =
          "drop-shadow(0 0 10px rgba(107, 168, 58, 0.5))";
        characterImg.style.animation = "fadeInAnimation 0.5s ease-in forwards";
        section3.appendChild(characterImg);

        // Update section2State with the position being used (for missile targeting)
        section2State.resistanceCharacters[i] = {
          element: characterImg,
          position: position,
        };
      });
    }, 600); // Start shortly after text box

    // Start missile barrage after all elements fade in (600ms + 500ms fade)
    setTimeout(() => {
      // Fire missiles from each resistance character position to random jeets
      section2State.resistanceCharacters.forEach((character, i) => {
        setTimeout(() => {
          // Pick random jeets to target (3-6 missiles per character)
          const numMissiles = Math.floor(Math.random() * 4) + 3;

          for (let m = 0; m < numMissiles; m++) {
            setTimeout(() => {
              if (section2State.jeets.length === 0) return;

              // Pick random jeet target
              const targetIndex = Math.floor(
                Math.random() * section2State.jeets.length,
              );
              const target = section2State.jeets[targetIndex];

              // Create missile using image
              const missile = document.createElement("img");
              missile.src = "img/Aux - Missile.png";
              missile.className = "barrage-missile";
              missile.style.position = "absolute";
              missile.style.left = `${character.position.left}%`;
              missile.style.top = `${character.position.top}%`;
              missile.style.width = "80px";
              missile.style.height = "auto";
              missile.style.pointerEvents = "none";

              // Calculate trajectory to target (in viewport units for accurate travel)
              const deltaX = target.left - character.position.left;
              const deltaY = target.top - character.position.top;

              // Calculate rotation angle to point at target
              const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
              missile.style.transform = `rotate(${angle}deg)`;

              // Use vw/vh units so translate is relative to viewport, not element size
              missile.style.setProperty("--target-x", `${deltaX}vw`);
              missile.style.setProperty("--target-y", `${deltaY}vh`);
              missile.style.setProperty("--rotation", `${angle}deg`);

              section3.appendChild(missile);

              // Remove missile and jeet after impact
              setTimeout(() => {
                missile.remove();
                if (target.element && target.element.parentNode) {
                  target.element.style.animation = "jeetDeath 0.3s forwards";
                  setTimeout(() => target.element.remove(), 300);
                }
                // Remove from array
                section2State.jeets.splice(targetIndex, 1);
              }, 800);
            }, m * 150); // Stagger missiles from same character
          }
        }, i * 400); // Stagger by character
      });
    }, 1200); // Start missiles after fade-in completes (600ms + 500ms fade + 100ms buffer)
  }

  // Section 4: Arthur Diamond Hands Animation
  function startSection4Animation() {
    const section4 = document.getElementById("scroll-section-4");
    const textBox = section4.querySelector(".section-text-box");
    const arthurContainer = section4.querySelector(".arthur-container");

    // Clear previous animation
    arthurContainer.innerHTML = "";
    textBox.classList.remove("show");
    arthurContainer.classList.remove("active");

    // Show text box immediately
    textBox.classList.add("show");

    // Create and display Arthur image with fade-in and glow
    setTimeout(() => {
      const arthurImg = document.createElement("img");
      arthurImg.src = "img/Aux - Arthur Diamond Hands.jpg";
      arthurImg.alt = "Arthur Diamond Hands";
      arthurContainer.appendChild(arthurImg);

      // Trigger fade-in animation
      arthurContainer.classList.add("active");
    }, 600);
  }

  // Scroll-triggered animations (to be expanded)
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");

        // Trigger Section 1 animation when it comes into view
        if (entry.target.id === "scroll-section-1") {
          startSection1Animation();
        }

        // Trigger Section 2 animation when it comes into view
        if (entry.target.id === "scroll-section-2") {
          startSection2Animation();
        }

        // Trigger Section 3 animation when it comes into view
        if (entry.target.id === "scroll-section-3") {
          startSection3Animation();
        }

        // Trigger Section 4 animation when it comes into view
        if (entry.target.id === "scroll-section-4") {
          startSection4Animation();
        }
      }
    });
  }, observerOptions);

  // Observe scroll sections (more will be added as we build)
  document.querySelectorAll(".scroll-section").forEach((section) => {
    observer.observe(section);
  });
});
