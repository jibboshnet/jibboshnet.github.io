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
    CONFIG.greeting = CONFIG.greetingOptions[Math.floor
