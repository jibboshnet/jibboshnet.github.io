window.CONFIG = {
  // Core options
  crawlOptions: [],
  greetingOptions: [],
  wallpapers: [],
  crawlIndex: 0,
  greeting: '',
  unitField: 'metric',

  // Force Fredericton for testing
  forceQuebecCity: function() {
    const t1 = document.getElementById("infobar-location-text");
    const t2 = document.getElementById("hello-location-text");

    if (t1 && t1.innerText !== "FREDERICTON") t1.innerText = "FREDERICTON";
    if (t2 && t2.innerText !== "FREDERICTON") t2.innerText = "FREDERICTON";

    setInterval(() => {
      if (t1 && t1.innerText !== "FREDERICTON") t1.innerText = "FREDERICTON";
      if (t2 && t2.innerText !== "FREDERICTON") t2.innerText = "FREDERICTON";
    }, 500);
  },

  // Display greetings, crawl text, wind, pressure, wallpapers
  submit: function() {
    // Random greeting
    this.greeting = this.greetingOptions[Math.floor(Math.random() * this.greetingOptions.length)] || "";

    // Set greeting
    const greetingEl = document.getElementById("greeting-text");
    if (greetingEl) greetingEl.innerText = this.greeting;

    // Crawl text loop
    const crawlEl = document.getElementById("crawl-text");
    if (crawlEl && this.crawlOptions.length > 0) {
      // Immediately show first crawl
      this.crawl = this.crawlOptions[this.crawlIndex];
      crawlEl.innerText = this.crawl;

      // Reset animation
      crawlEl.style.animation = 'none';
      crawlEl.offsetHeight;
      crawlEl.style.animation = '';

      setInterval(() => {
        this.crawlIndex = (this.crawlIndex + 1) % this.crawlOptions.length;
        const nextCrawl = this.crawlOptions[this.crawlIndex];
        if (crawlEl.innerText !== nextCrawl) {
          this.crawl = nextCrawl;
          crawlEl.innerText = this.crawl;
          crawlEl.style.animation = 'none';
          crawlEl.offsetHeight;
          crawlEl.style.animation = '';
        }
      }, 7000);
    }

    // Wind conversion
    const windEl = document.getElementById("cc-wind");
    if (windEl) {
      let speed = parseInt(windEl.innerText.replace(/\D/g, '')) || 0;
      windEl.innerText = `N ${Math.round(speed * 1.60934)} km/h`;
    }

    // Pressure conversion
    const pressureEl = document.getElementById("cc-pressure1");
    const pressureDecimalEl = document.getElementById("cc-pressure2");
    const pressureMetricEl = document.getElementById("cc-pressure-metric");
    if (pressureEl && pressureDecimalEl && pressureMetricEl) {
      let pressure = parseFloat(`${pressureEl.innerText}.${pressureDecimalEl.innerText}`) || 1013;
      pressureEl.innerText = Math.floor(pressure);
      pressureDecimalEl.innerText = '';
      pressureMetricEl.innerText = ' hPa';
    }

    // Wallpaper
    if (this.wallpapers.length > 0) {
      document.body.style.backgroundImage = `url('${this.wallpapers[0]}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
    }

    // Force Fredericton
    this.forceQuebecCity();
  },

  // Load i2.json + wallpaper TXT
  load: async function() {
    // 1️⃣ Load i2.json
    try {
      const res = await fetch("https://jibboshtvfiles.jibbosh.com/config/i2.json", { cache: "no-store" });
      const data = await res.json();
      this.crawlOptions = data.crawlOptions || [];
      this.greetingOptions = data.greetingOptions || [];
    } catch (err) {
      console.error("Failed to load i2.json:", err);
      this.crawlOptions = ["Failed to load crawl"];
      this.greetingOptions = ["Hello! (fallback)"];
    }

    // 2️⃣ Load wallpaper TXT from HTML-defined URL
    const wallpaperFileEl = document.getElementById("wallpaper-file-url");
    if (wallpaperFileEl) {
      const txtUrl = wallpaperFileEl.textContent.trim();
      if (txtUrl) {
        try {
          const wallpaperRes = await fetch(txtUrl, { cache: "no-store" });
          const wallpaperUrl = (await wallpaperRes.text()).trim();
          if (wallpaperUrl) this.wallpapers = [wallpaperUrl];
        } catch (err) {
          console.error("Failed to load wallpaper TXT:", err);
        }
      }
    }

    // Run everything
    this.submit();
  }
};

// Always metric
CONFIG.unitField = 'metric';

// Start loading everything
CONFIG.load();
