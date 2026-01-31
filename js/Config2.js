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

    if (t1 && t1.innerText !== "QUEBEC CITY") t1.innerText = "QUEBEC CITY";
    if (t2 && t2.innerText !== "QUEBEC CITY") t2.innerText = "QUEBEC CITY";

    setInterval(() => {
      if (t1 && t1.innerText !== "QUEBEC CITY") t1.innerText = "QUEBEC CITY";
      if (t2 && t2.innerText !== "QUEBEC CITY") t2.innerText = "QUEBEC CITY";
    }, 500);
  },

  submit: () => {
    CONFIG.locationMode = "AIRPORT";
    airportCode = "YQB";
    zipCode = null;
    CONFIG.unitField = 'metric';

    CONFIG.greeting = CONFIG.greetingOptions[Math.floor(Math.random() * CONFIG.greetingOptions.length)] || "";

    CONFIG.forceQuebecCity();

    if (typeof fetchCurrentWeather === "function") fetchCurrentWeather();

    setTimeout(() => {
      // Greeting
      const greetingEl = document.getElementById("greeting-text");
      if (greetingEl) greetingEl.innerText = CONFIG.greeting;

      // Crawl text loop
      const crawlEl = document.getElementById("crawl-text");
      if (crawlEl && CONFIG.crawlOptions.length > 0) {
        CONFIG.crawl = CONFIG.crawlOptions[CONFIG.crawlIndex];
        crawlEl.innerText = CONFIG.crawl;
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
