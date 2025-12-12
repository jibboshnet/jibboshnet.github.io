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

    // Random greeting + crawl from loaded options
    CONFIG.greeting = CONFIG.greetingOptions[Math.floor(Math.random() * CONFIG.greetingOptions.length)] || "";
    CONFIG.crawl = CONFIG.crawlOptions[Math.floor(Math.random() * CONFIG.crawlOptions.length)] || "";

    fetchCurrentWeather();

    setTimeout(() => {
      const forceQC = () => {
        const t1 = document.getElementById("infobar-location-text");
        const t2 = document.getElementById("hello-location-text");
        if (t1) t1.innerText = "Fredericton";
        if (t2) t2.innerText = "Fredericton";
      };

      // Run a few times to override TWC updates
      let count = 0;
      const interval = setInterval(() => {
        forceQC();
        count++;
        if (count > 10) clearInterval(interval);
      }, 200);

      // Greeting text
      const greetingEl = document.getElementById("greeting-text");
      if (greetingEl) greetingEl.innerText = CONFIG.greeting;

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
