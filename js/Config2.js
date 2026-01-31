window.CONFIG = {
  // Default empty until remote loads
  crawlOptions: [],
  crawlIndex: 0, // track which crawl we're on
  crawl: '',

  greetingOptions: [],
  greeting: '',

  language: 'en-US',
  countryCode: 'CA',
  units: 'm',
  unitField: 'metric',
  loop: true,
  locationMode: "AIRPORT",

  secrets: {
    twcAPIKey: 'e1f10a1e78da46f5b10a1e78da96f525'
  },

  locationOptions: [],
  options: [],

  addLocationOption: () => {},
  addOption: () => {},

  wallpapers: [],

  forceQuebecCity: () => {
    const t1 = document.getElementById("infobar-location-text");
    const t2 = document.getElementById("hello-location-text");

    // Only update if text is not already "FREDERICTON"
    if (t1 && t1.innerText !== "FREDERICTON") t1.innerText = "FREDERICTON";
    if (t2 && t2.innerText !== "FREDERICTON") t2.innerText = "FREDERICTON";

    // Periodically check in case something changes it
    setInterval(() => {
      if (t1 && t1.innerText !== "FREDERICTON") t1.innerText = "FREDERICTON";
      if (t2 && t2.innerText !== "FREDERICTON") t2.innerText = "FREDERICTON";
    }, 500);
  },

  submit: () => {
    CONFIG.locationMode = "AIRPORT";
    airportCode = "YFC";
    zipCode = null;
    CONFIG.unitField = 'metric';

    // Random greeting from loaded options
    CONFIG.greeting = CONFIG.greetingOptions[Math.floor(Math.random() * CONFIG.greetingOptions.length)] || "";

    // Force FREDERICTON immediately
    CONFIG.forceQuebecCity();

    if (typeof fetchCurrentWeather === "function") fetchCurrentWeather();

    setTimeout(() => {
      // Greeting text
      const greetingEl = document.getElementById("greeting-text");
      if (greetingEl) greetingEl.innerText = CONFIG.greeting;

      // Crawl text loop
      const crawlEl = document.getElementById("crawl-text");
      if (crawlEl && CONFIG.crawlOptions.length > 0) {
        CONFIG.crawl = CONFIG.crawlOptions[CONFIG.crawlIndex];
        crawlEl.innerText = CONFIG.crawl;

        // Reset animation
        crawlEl.style.animation = 'none';
        crawlEl.offsetHeight;
        crawlEl.style.animation = '';

        setInterval(() => {
          CONFIG.crawlIndex = (CONFIG.crawlIndex + 1) % CONFIG.crawlOptions.length;
          const nextCrawl = CONFIG.crawlOptions[CONFIG.crawlIndex];
          if (crawlEl.innerText !== nextCrawl) {
            CONFIG.crawl = nextCrawl;
            crawlEl.innerText = CONFIG.crawl;
            crawlEl.style.animation = 'none';
            crawlEl.offsetHeight;
            crawlEl.style.animation = '';
          }
        }, 7000);
      }

      // Convert wind to km/h
      const windEl = document.getElementById("cc-wind");
      if (windEl) {
        let speed = parseInt(windEl.innerText.replace(/\D/g, '')) || 0;
        windEl.innerText = `N ${Math.round(speed * 1.60934)} km/h`;
      }

      // Pressure conversion formatting
      const pressureEl = document.getElementById("cc-pressure1");
      const pressureDecimalEl = document.getElementById("cc-pressure2");
      const pressureMetricEl = document.getElementById("cc-pressure-metric");
      if (pressureEl && pressureDecimalEl && pressureMetricEl) {
        let pressure = parseFloat(`${pressureEl.innerText}.${pressureDecimalEl.innerText}`) || 1013;
        pressureEl.innerText = Math.floor(pressure);
        pressureDecimalEl.innerText = '';
        pressureMetricEl.innerText = ' hPa';
      }

      // Set wallpaper if available
      if (CONFIG.wallpapers.length > 0) {
        document.body.style.backgroundImage = `url('${CONFIG.wallpapers[0]}')`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
      }
    }, 700);
  },

  load: async () => {
    hideSettings?.();

    // 1️⃣ Load i2.json
    try {
      const res = await fetch("https://jibboshtvfiles.jibbosh.com/config/i2.json", { cache: "no-store" });
      const data = await res.json();
      CONFIG.crawlOptions = data.crawlOptions || [];
      CONFIG.greetingOptions = data.greetingOptions || [];
    } catch (err) {
      console.error("Failed to load i2.json:", err);
      CONFIG.crawlOptions = ["Failed to load crawl"];
      CONFIG.greetingOptions = ["Hello! (fallback)"];
    }

    // 2️⃣ Load wallpaper TXT from HTML-defined URL
    const wallpaperFileEl = document.getElementById("wallpaper-file-url");
    if (wallpaperFileEl) {
      const txtUrl = wallpaperFileEl.textContent.trim();
      if (txtUrl) {
        try {
          const wallpaperRes = await fetch(txtUrl, { cache: "no-store" });
          const wallpaperUrl = (await wallpaperRes.text()).trim();
          if (wallpaperUrl) CONFIG.wallpapers = [wallpaperUrl];
        } catch (err) {
          console.error("Failed to load wallpaper TXT:", err);
        }
      }
    }

    CONFIG.submit();
  }
};

// Always metric
CONFIG.unitField = 'metric';

// Start loading
CONFIG.load();
