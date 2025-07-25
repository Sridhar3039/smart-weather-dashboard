const statusEl = document.getElementById("status");
const locationEl = document.getElementById("location");
const tempEl = document.getElementById("temperature");
const conditionEl = document.getElementById("condition");
const canvas = document.getElementById("tempChart");
const ctx = canvas.getContext("2d");

// Check network
if ("connection" in navigator) {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  if (connection.effectiveType === "2g" || connection.saveData) {
    alert(
      "You are on a slow or data-saving network. Some features may be limited."
    );
  }
}

// Get user's location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(success, error);
} else {
  statusEl.textContent = "Geolocation is not supported by this browser.";
}

let map;

function success(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  // Initialize Leaflet Map
  map = L.map("map").setView([lat, lon], 13);

  // Add OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // Add marker at user location
  const marker = L.marker([lat, lon]).addTo(map);
  marker.bindPopup("📍 You are here").openPopup();

  // Continue to get weather
  getWeather(lat, lon);
}

function error() {
  statusEl.textContent = "Unable to retrieve your location.";
}

async function getWeather(lat, lon) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m`
    );
    const data = await res.json();

    const place = `Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`;
    const temp = data.current_weather.temperature;
    const condition = data.current_weather.weathercode;

    statusEl.textContent = "Weather data loaded!";
    locationEl.textContent = place;
    tempEl.textContent = `${temp} °C`;
    conditionEl.textContent = getWeatherCondition(condition);

    drawGraph(data.hourly.temperature_2m.slice(0, 24));
  } catch (err) {
    statusEl.textContent = "Failed to fetch weather data.";
    console.error(err);
  }
}

function getWeatherCondition(code) {
  if (code === 0) return "Clear Sky";
  if (code < 3) return "Partly Cloudy";
  if (code < 45) return "Fog";
  if (code < 70) return "Rainy";
  return "Unknown";
}

// Draw temperature graph on Canvas
function drawGraph(temps) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(0, 150 - temps[0]);

  temps.forEach((temp, index) => {
    ctx.lineTo(index * 12, 150 - temp);
  });

  ctx.strokeStyle = "#2196F3";
  ctx.lineWidth = 2;
  ctx.stroke();
}
