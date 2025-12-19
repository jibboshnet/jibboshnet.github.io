window.CONFIG = {
  // Default empty until remote loads
  crawlOptions: [],
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

  submit: () => {
    CONFIG.locationMode = "AIRPORT";
    airportCode = "YFC";
    zipCode = null;

    CONFIG.unitField = 'metric';

    // Random greeting + crawl
    CONFIG.greeting =
      CONFIG.greetingOptions.length
        ? CONFIG.greetingOptions[Math.floor(Math.random() * CONFIG.greetingOptions.length)]
        : "";

    CONFIG.crawl =
      CONFIG.crawlOptions.length
        ? CONFIG.crawlOptions[Math.floor(Math.random() * CONFIG.crawlOptions.length)]
        : "";

    fetchCurrentWeather();

    setTimeout(() => {
      /* ---------- FORCE LOCATION ---------- */
      const forceQC = () => {
        const t1 = document.getElementById("infobar-location-text");
        const t2 = document.getElementById("hello-location-text");
        if (t1) t1.innerText = "Fredericton";
        if (t2) t2.innerText = "Fredericton";
      };

      let count = 0;
      const interval = setInterval(() => {
        forceQC();
        if (++count > 10) clearInterval(interval);
      }, 200);

      /* ---------- GREETING ---------- */
      const greetingEl = document.getElementById("greeting-text");
      if (greetingEl) greetingEl.innerText = CONFIG.greeting;

      /* ---------- CRAWL (FIXED) ---------- */
      const crawlEl = document.getElementById("crawl-text");
      if (crawlEl) {
        crawlEl.innerText = CONFIG.crawl;

        // Optional: scale speed by text length
        const duration = Math.max(6, CONFIG.crawl.length * 0.15);
        crawlEl.style.animationDuration = `${duration}s`;

        // Restart animation
        crawlEl.classList.remove("animate");
        void crawlEl.offsetWidth; // force reflow
        crawlEl.classList.add("animate");
      }

      /* ---------- WIND km/h ---------- */
      const windEl = document.getElementById("cc-wind");
      if (windEl) {
        let windText = windEl.innerText;
        let speed = parseInt(windText.replace(/\D/g, '')) || 0;
        windEl.innerText = `N ${Math.round(speed * 1.60934)} km/h`;
      }

      /* ---------- PRESSURE hPa ---------- */
      const pressureEl = document.getElementById("cc-pressure1");
      const pressureDecimalEl = document.getElementById("cc-pressure2");
      const pressureMetricEl = document.getElementById("cc-pressure-metric");
      if (pressureEl && pressureDecimalEl && pressureMetricEl) {
        let pressure =
          parseFloat(`${pressureEl.innerText}.${pressureDecimalEl.innerText}`) || 1013;
        pressureEl.innerText = Math.floor(pressure);
        pressureDecimalEl.innerText = '';
        pressureMetricEl.innerText = ' hPa';
      }
    }, 700);
  },

  /* ---------- LOAD REMOTE CONFIG ---------- */
  load: async () => {
    hideSettings();

    try {
      const res = await fetch(
        "https://jibboshtvfiles.jibbosh.com/config/i2.json",
        { cache: "no-store" }
      );
      const data = await res.json();

      CONFIG.crawlOptions = data.crawlOptions || [];
      CONFIG.greetingOptions = data.greetingOptions || [];
    } catch (err) {
      console.error("Failed to load remote config:", err);
      CONFIG.crawlOptions = ["Weather information unavailable"];
      CONFIG.greetingOptions = ["Hello!"];
    }

    CONFIG.submit();
  }
};

// Always metric
CONFIG.unitField = 'metric';
