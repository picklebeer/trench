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

    // Generate 15 red candles with varying heights
    const numCandles = 15;
    setTimeout(() => {
      for (let i = 0; i < numCandles; i++) {
        const candle = document.createElement("div");
        candle.className = "red-candle";
        const height = Math.random() * 200 + 100; // Random height between 100-300px
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
      }
    });
  }, observerOptions);

  // Observe scroll sections (more will be added as we build)
  document.querySelectorAll(".scroll-section").forEach((section) => {
    observer.observe(section);
  });
});
