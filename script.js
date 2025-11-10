// Mission Loading Animation
document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById("loading-screen");
  const mainContent = document.getElementById("main-content");
  const loadingPercentage = document.querySelector(".loading-percentage");

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
  let section1Triggered = false;

  function startSection1Animation() {
    if (section1Triggered) return;
    section1Triggered = true;

    const section1 = document.getElementById("scroll-section-1");
    const textElement = section1.querySelector(".section-1-text");
    const animationContainer = section1.querySelector(
      ".jeets-animation-container",
    );
    const candlesContainer = section1.querySelector(".red-candles-container");
    const jeetsContainer = section1.querySelector(".jeets-container");

    // Step 1: Show text for 2 seconds
    setTimeout(() => {
      textElement.classList.add("fade-out");
    }, 2000);

    // Step 2: Start animation container fade in (after 0.5s fade out)
    setTimeout(() => {
      animationContainer.classList.add("active");
    }, 2500);

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
    }, 2500);

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
        (i / numJeets) * spawnDuration + 2500,
      ); // Start after 2.5s (after text fades)
    }
  }

  // Section 2: Resistance Animation
  let section2Triggered = false;

  function startSection2Animation() {
    if (section2Triggered) return;
    section2Triggered = true;

    const section2 = document.getElementById("scroll-section-2");
    const textElement = section2.querySelector(".section-2-text");
    const animationContainer = section2.querySelector(
      ".resistance-animation-container",
    );
    const tankContainer = section2.querySelector(".tank-container");
    const landminesContainer = section2.querySelector(".landmines-container");
    const resistanceContainer = section2.querySelector(
      ".resistance-characters-container",
    );

    // Step 1: Show text for 2 seconds
    setTimeout(() => {
      textElement.classList.add("fade-out");
    }, 2000);

    // Step 2: Start animation container fade in (after 0.5s fade out)
    setTimeout(() => {
      animationContainer.classList.add("active");
    }, 2500);

    // Define tank position (left: 5%, centered vertically at 50%)
    const tankPosition = { left: 5, top: 50 };

    // Fixed positions for resistance characters (4 columns x 2 rows, more dispersed)
    const characterFixedPositions = [
      { left: 15, top: 15 }, // Catpop
      { left: 30, top: 25 }, // DogeWW1
      { left: 45, top: 15 }, // Dogwifhat
      { left: 60, top: 25 }, // Moodeng
      { left: 15, top: 45 }, // Pepe
      { left: 30, top: 55 }, // Wojak
      { left: 45, top: 45 }, // Soyjak
      { left: 60, top: 55 }, // Shiba
    ];

    // Fixed positions for landmines (avoiding tank and character positions, concentrated at bottom)
    const landmineFixedPositions = [
      { left: 55, top: 65 },
      { left: 70, top: 55 },
      { left: 45, top: 75 },
      { left: 80, top: 70 },
      { left: 60, top: 85 },
      { left: 75, top: 80 },
    ];

    // Step 3: Spawn sea of jeets first (right side)
    const jeetsSeaContainer = section2.querySelector(".jeets-sea-container");
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
          const left = col * 20 + (Math.random() * 8 - 4); // 0-80% within container
          const top = row * 10 + (Math.random() * 5 - 2.5); // 0-90% within container

          jeet.style.left = `${left}%`;
          jeet.style.top = `${top}%`;
          jeet.style.animationDelay = `${(i / numJeetsSea) * 0.8}s`;

          jeetsSeaContainer.appendChild(jeet);
        }, 100);
      }
    }, 2500);

    // Step 4: Place landmines at fixed positions one by one (after jeets sea completes)
    landmineFixedPositions.forEach((position, i) => {
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
        },
        3800 + i * 200,
      ); // After jeets sea (2.5s + 1.3s), 200ms delay between each landmine
    });

    // Step 5: Add tank and trigger entrance (after landmines appear)
    setTimeout(() => {
      const tank = document.createElement("img");
      tank.src = "img/Aux - Tank.png";
      tank.alt = "Tank";
      tankContainer.appendChild(tank);

      // Trigger tank entrance animation
      setTimeout(() => {
        tankContainer.classList.add("enter");
      }, 50);
    }, 4800); // 1 second after landmines

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

          // Flip specific characters vertically
          if (
            imgSrc.includes("Moodeng") ||
            imgSrc.includes("Wojak") ||
            imgSrc.includes("Soyjak")
          ) {
            character.style.transform = "scaleY(-1)";
          }

          // Use fixed position for this character
          const position = characterFixedPositions[i];
          character.style.left = `${position.left}%`;
          character.style.top = `${position.top}%`;

          resistanceContainer.appendChild(character);

          // Trigger spawn animation
          setTimeout(() => {
            character.classList.add("spawn");
          }, 50);
        },
        6800 + i * 300,
      ); // Start after tank completes (4.8s + 2s), 300ms delay between each character
    });
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
      }
    });
  }, observerOptions);

  // Observe scroll sections (more will be added as we build)
  document.querySelectorAll(".scroll-section").forEach((section) => {
    observer.observe(section);
  });
});
