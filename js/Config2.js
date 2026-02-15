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
    }, 500); // check every 0.5s
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

    fetchCurrentWeather();

    setTimeout(() => {
      // Greeting text
      const greetingEl = document.getElementById("greeting-text");
      if (greetingEl) greetingEl.innerText = CONFIG.greeting;

      // Crawl text - SET ONLY ONCE (fixed)
      const crawlEl = document.getElementById("crawl-text");
      if (crawlEl && CONFIG.crawlOptions.length > 0) {
        // Set first crawl ONCE
        CONFIG.crawl = CONFIG.crawlOptions[CONFIG.crawlIndex];
        crawlEl.innerText = CONFIG.crawl;

        // Reset animation once
        crawlEl.style.animation = 'none';
        crawlEl.offsetHeight;
        crawlEl.style.animation = '';

        // NO LOOP INTERVAL - static crawl as requested
      }

      // Convert wind to km/h
      const windEl = document.getElementById("cc-wind");
      if (windEl) {
        let windText = windEl.innerText;
        let speed = parseInt(windText.replace(/\D/g, '')) || 0;
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
    }, 700);
  },

  // Load remote config first, then run submit()
  load: async () => {
    hideSettings();

    try {
      const res = await fetch("https://jibboshtvfiles.jibbosh.com/config/i2.json", {
        cache: "no-store"
      });
      const data = await res.json();

      CONFIG.crawlOptions = data.crawlOptions || [];
      CONFIG.greetingOptions = data.greetingOptions || [];

    } catch (err) {
      console.error("Failed to load remote config:", err);
      // fallback values so nothing breaks
      CONFIG.crawlOptions = ["Failed to load crawl"];
      CONFIG.greetingOptions = ["Hello! (fallback)"];
    }

    CONFIG.submit();
  }
};

// Always metric
CONFIG.unitField = 'metric';

// AUTO-START - Safe to call anytime (guards against undefined)
(function autoStart() {
  if (typeof CONFIG !== 'undefined' && typeof CONFIG.load === 'function') {
    CONFIG.load();
  } else {
    // Retry if not ready yet (handles MainScript.js loading first)
    setTimeout(autoStart, 50);
  }
})();
