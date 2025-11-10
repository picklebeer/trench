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

    // Helper function to check if position overlaps with tank
    function isTooCloseToTank(left, top, minDistance = 25) {
      const distance = Math.sqrt(
        Math.pow(left - tankPosition.left, 2) +
          Math.pow(top - tankPosition.top, 2),
      );
      return distance < minDistance;
    }

    // Step 3: Place landmines first (avoiding tank area)
    const landminePositions = [];
    setTimeout(() => {
      const numLandmines = 6;
      for (let i = 0; i < numLandmines; i++) {
        const landmine = document.createElement("img");
        landmine.src = "img/Aux - Landmine.png";
        landmine.className = "landmine";

        // Find a position that doesn't overlap with tank
        let left,
          top,
          attempts = 0;
        do {
          // Scatter landmines across the middle and right portion, concentrated toward bottom
          left = 30 + Math.random() * 60; // 30% to 90% from left
          top = 50 + Math.random() * 40; // 50% to 90% from top (bottom half)
          attempts++;
        } while (isTooCloseToTank(left, top) && attempts < 50);

        landmine.style.left = `${left}%`;
        landmine.style.top = `${top}%`;

        // Store landmine position for collision detection
        landminePositions.push({ left, top });

        // Randomize animation delay for varied throbbing
        landmine.style.animationDelay = `${Math.random() * 2}s`;

        landminesContainer.appendChild(landmine);
      }
    }, 2500);

    // Step 4: Add tank and trigger entrance (after landmines appear)
    setTimeout(() => {
      const tank = document.createElement("img");
      tank.src = "img/Aux - Tank.png";
      tank.alt = "Tank";
      tankContainer.appendChild(tank);

      // Trigger tank entrance animation
      setTimeout(() => {
        tankContainer.classList.add("enter");
      }, 50);
    }, 3500); // 1 second after landmines

    // Helper function to check if position overlaps with landmines
    function isPositionSafe(left, top, minDistance = 15) {
      for (const landmine of landminePositions) {
        const distance = Math.sqrt(
          Math.pow(left - landmine.left, 2) + Math.pow(top - landmine.top, 2),
        );
        if (distance < minDistance) {
          return false;
        }
      }
      return true;
    }

    // Track character positions to prevent overlapping
    const characterPositions = [];

    // Helper function to check if position overlaps with other characters
    function isPositionSafeFromCharacters(left, top, minDistance = 18) {
      for (const char of characterPositions) {
        const distance = Math.sqrt(
          Math.pow(left - char.left, 2) + Math.pow(top - char.top, 2),
        );
        if (distance < minDistance) {
          return false;
        }
      }
      return true;
    }

    // Helper function to check if character position overlaps with tank
    function isPositionSafeFromTank(left, top, minDistance = 20) {
      const distance = Math.sqrt(
        Math.pow(left - tankPosition.left, 2) +
          Math.pow(top - tankPosition.top, 2),
      );
      return distance >= minDistance;
    }

    // Step 5: Spawn resistance characters
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

          // Position characters randomly all over the screen, avoiding landmines and other characters
          // Try to find a safe position
          let left,
            top,
            attempts = 0;
          do {
            // Concentrate characters on the left side
            left = 15 + Math.random() * 35; // 15% to 50% from left
            top = 15 + Math.random() * 70; // 15% to 85% from top

            attempts++;
          } while (
            (!isPositionSafe(left, top) ||
              !isPositionSafeFromCharacters(left, top) ||
              !isPositionSafeFromTank(left, top)) &&
            attempts < 100
          );

          character.style.left = `${left}%`;
          character.style.top = `${top}%`;

          // Store this character's position
          characterPositions.push({ left, top });

          resistanceContainer.appendChild(character);

          // Trigger spawn animation
          setTimeout(() => {
            character.classList.add("spawn");
          }, 50);
        },
        5500 + i * 300,
      ); // Start after tank (5.5s), 300ms delay between each character
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
