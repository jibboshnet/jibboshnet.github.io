function guessZipCode(){
  // Skip geolookup until replaced with TWC (wunderground api dead)
  return;

  var zipCodeElement = getElement("zip-code-text");
  if(zipCodeElement.value != ""){
    return;
  }

  fetch(`https://api.wunderground.com/api/${CONFIG.secrets.wundergroundAPIKey}/geolookup/q/autoip.json`)
    .then(function(response) {
      if (response.status !== 200) {
        console.log("zip code request error");
        return;
      }
      response.json().then(function(data) {
        if(zipCodeElement.value == ""){
          zipCodeElement.value = data.location.zip;
        }
      });
    })
}

function fetchAlerts(){
  var alertCrawl = "";
  fetch(`https://api.weather.gov/alerts/active?point=${latitude},${longitude}`)
    .then(function(response) {
        if (response.status !== 200) {
            console.warn("Alerts Error, no alerts will be shown");
        }
      response.json().then(function(data) {
        if (data.features == undefined){
          fetchForecast();
          return;
        }
        if (data.features.length == 1) {
          alerts[0] = data.features[0].properties.event + '<br>' + data.features[0].properties.description.replace("..."," ").replace(/\*/g, "")
          for(var i = 0; i < data.features.length; i++){
            alertCrawl = alertCrawl + " " + data.features[i].properties.description.replace("...", " ");
          }
        }
        else {
          for(var i = 0; i < data.features.length; i++){
            alertCrawl = alertCrawl + " " + data.features[i].properties.description.replace("...", " ");
            alerts[i] = data.features[i].properties.event
          }
        }
        if(alertCrawl != ""){
          CONFIG.crawl = alertCrawl;
        }
        alertsActive = alerts.length > 0;
        fetchForecast();
      });
    })
}

function fetchForecast(){
  fetch(`https://api.weather.com/v1/geocode/${latitude}/${longitude}/forecast/daily/10day.json?language=${CONFIG.language}&units=${CONFIG.units}&apiKey=${CONFIG.secrets.twcAPIKey}`)
    .then(function(response) {
      if (response.status !== 200) {
        console.log('forecast request error');
        return;
      }
      response.json().then(function(data) {
        let forecasts = data.forecasts
        isDay = forecasts[0].day;
        let ns = []
        ns.push(forecasts[0].day || forecasts[0].night);
        ns.push(forecasts[0].night);
        ns.push(forecasts[1].day);
        ns.push(forecasts[1].night);
        for (let i = 0; i <= 3; i++) {
          let n = ns[i]
          forecastTemp[i] = n.temp
          forecastIcon[i] = n.icon_code
          forecastNarrative[i] = n.narrative
          forecastPrecip[i] = `${n.pop}% Chance<br/> of ${n.precip_type.charAt(0).toUpperCase() + n.precip_type.substr(1).toLowerCase()}`
        }
        for (var i = 0; i < 7; i++) {
          let fc = forecasts[i+1]
          outlookHigh[i] = fc.max_temp
          outlookLow[i] = fc.min_temp
          outlookCondition[i] = (fc.day ? fc.day : fc.night).phrase_32char.split(' ').join('<br/>')
          outlookCondition[i] = outlookCondition[i].replace("Thunderstorm", "Thunder</br>storm");
          outlookIcon[i] = (fc.day ? fc.day : fc.night).icon_code
        }
        fetchRadarImages();
      })
    })
}

function fetchCurrentWeather(){
  let location = "";
  console.log(CONFIG.locationMode)
  if(CONFIG.locationMode=="POSTAL") {location=`postalKey=${zipCode}:${CONFIG.countryCode}`}
  else if (CONFIG.locationMode=="AIRPORT") {
    let airportCodeLength=airportCode.length;
    if(airportCodeLength==3){location=`iataCode=${airportCode}`}
    else if (airportCodeLength==4){location=`icaoCode=${airportCode}`}
    else {
      alert("Please enter a valid ICAO or IATA Code")
      console.error(`Expected Airport Code Lenght to be 3 or 4 but was ${airportCodeLength}`)
      return;
    }
  }
  else {
    alert("Please select a location type");
    console.error("Unknown what to use for location")
    return;
  }

  fetch(`https://api.weather.com/v3/location/point?${location}&language=${CONFIG.language}&format=json&apiKey=${CONFIG.secrets.twcAPIKey}`)
      .then(function (response) {
          if (response.status == 404) {
              alert("Location not found!")
              console.log('conditions request error');
              return;
          }
          if (response.status !== 200) {
              alert("Something went wrong (check the console)")
              console.log('conditions request error');
              return;
          }
      response.json().then(function(data) {
        try {
          if(CONFIG.locationMode=="AIRPORT"){
            cityName = data.location.airportName
            .toUpperCase()
            .replace("INTERNATIONAL","INTL.")
            .replace("AIRPORT","")
            .trim();
            console.log(cityName);
          } else {
            cityName = data.location.city.toUpperCase();
          }
          latitude = data.location.latitude;
          longitude = data.location.longitude;
        } catch (err) {
          alert('Enter valid ZIP code');
          console.error(err)
          getZipCodeFromUser();
          return;
        }
        fetch(`https://api.weather.com/v1/geocode/${latitude}/${longitude}/observations/current.json?language=${CONFIG.language}&units=${CONFIG.units}&apiKey=${CONFIG.secrets.twcAPIKey}`)
          .then(function(response) {
            if (response.status !== 200) {
              console.log("conditions request error");
              return;
            }
            response.json().then(function(data) {
              let unit = data.observation[CONFIG.unitField];
              currentTemperature = Math.round(unit.temp);
              currentCondition = data.observation.phrase_32char;
              windSpeed = `${data.observation.wdir_cardinal} ${unit.wspd} ${CONFIG.units === 'm' ? 'km/h' : 'mph'}`;
              gusts = unit.gust || 'NONE';
              feelsLike = unit.feels_like
              visibility = Math.round(unit.vis)
              humidity = unit.rh
              dewPoint = unit.dewpt
              pressure = unit.altimeter.toPrecision(4);
              let ptendCode = data.observation.ptend_code
              pressureTrend = (ptendCode == 1 || ptendCode == 3) ? '▲' : ptendCode == 0 ? '' : '▼';
              currentIcon = data.observation.icon_code
              fetchAlerts();
            });
          });
      })
    });
}

function fetchRadarImages() {
  mapboxgl.accessToken = "pk.eyJ1Ijoid2VhdGhlciIsImEiOiJjbHAxbHNjdncwaDhvMmptcno1ZTdqNDJ0In0.iywE3NefjboFg11a11ON0Q"; // Replace with your Mapbox token

  map = new mapboxgl.Map({
    container: "radar-container",
    style: "mapbox://styles/mapbox/satellite-v9",
    center: [longitude, latitude],
    zoom: 8,
    interactive: false
  });

  fetch(`https://api.weather.com/v3/TileServer/series/productSet/PPAcore?filter=twcRadarMosaic&apiKey=${CONFIG.secrets.twcAPIKey}`)
    .then(r => r.json())
    .then(data => {
      timestamps = data.seriesInfo.series
        .sort((a, b) => b.ts - a.ts)
        .slice(0, CONFIG.radarImagesFetchAmount)
        .reverse();

      timestamps.forEach((t, i) => {
        map.addSource(`radarlayer_${t.ts}`, {
          type: "raster",
          tiles: [`https://api.weather.com/v3/TileServer/tile/twcRadarMosaic?ts=${t.ts}&apiKey=${CONFIG.secrets.twcAPIKey}`],
          tileSize: 512
        });

        map.addLayer({
          id: `radarlayer_${t.ts}`,
          type: "raster",
          source: `radarlayer_${t.ts}`,
          layout: { visibility: i === 0 ? "visible" : "none" },
          paint: { "raster-opacity": 1, "raster-brightness-max": 0.9 }
        });
      });

      initRadarCleanGraphics();
      startAnimateRadar(timestamps.length);
    });
}

function initRadarCleanGraphics() {
  const timeStr = new Date(timestamps[0].ts * 1000).toLocaleTimeString("en-US", {
    timeZone: CONFIG.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).replace(" PM", "p").replace(" AM", "a");

  document.getElementById("radar-time").textContent = timeStr;

  for (let i = 0; i < CONFIG.radarImagesFetchAmount; i++) {
    map.setLayoutProperty(
      `radarlayer_${timestamps[i].ts}`,
      "visibility",
      i === 0 ? "visible" : "none"
    );
  }
}

function startAnimateRadar(total) {
  animateRadar(0, total);
}

function animateRadar(startIndex, total) {
  let current = -1;
  const interval = setInterval(() => {
    current++;
    if (current === CONFIG.radarImagesFetchAmount) {
      clearInterval(interval);
      if (startIndex + 1 > total - 1) return;
      setTimeout(() => animateRadar(startIndex + 1, total), 500);
      return;
    }

    timestamps.forEach((t, i) => {
      map.setLayoutProperty(
        `radarlayer_${t.ts}`,
        "visibility",
        i === current ? "visible" : "none"
      );
    });

    const timeStr = new Date(timestamps[current].ts * 1000).toLocaleTimeString("en-US", {
      timeZone: CONFIG.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).replace(" PM", "p").replace(" AM", "a");

    document.getElementById("radar-time").textContent = timeStr;
  }, 80);
}
