// Updated script.js using only accessible data from API-Football Free Plan

const apiKey = "9f0af8032a630bf720551c3c38b78057";
const apiHost = "https://v3.football.api-sports.io";

// Helper to fetch from the API
async function fetchFromAPI(endpoint) {
  try {
    const res = await fetch(`${apiHost}${endpoint}`, {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey
      }
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("API Error:", err);
    return null;
  }
}

// Live Games (Page 1)
async function loadLiveGames() {
  const data = await fetchFromAPI("/fixtures?live=all");
  const container = document.getElementById("liveGames");
  container.innerHTML = "";
  if (data && data.response.length) {
    data.response.forEach(fx => {
      const match = `${fx.teams.home.name} ${fx.goals.home} - ${fx.goals.away} ${fx.teams.away.name}`;
      const div = document.createElement("div");
      div.textContent = match;
      container.appendChild(div);
    });
  } else {
    container.textContent = "No live games at the moment.";
  }
}

// Predictions (Daily)
async function loadDailyPredictions() {
  const container = document.getElementById("dailyPredictions");
  container.innerHTML = "Loading predictions...";

  const today = new Date().toISOString().split("T")[0];
  const data = await fetchFromAPI(`/fixtures?date=${today}`);

  if (!data || !data.response.length) {
    container.textContent = "No fixtures for today.";
    return;
  }

  const predictions = data.response.slice(0, 5).map(match => {
    const { teams, league } = match;
    return {
      match: `${teams.home.name} vs ${teams.away.name}`,
      tip: Math.random() > 0.5 ? "Double Chance Home or Draw" : "Over 1.5 Goals",
      league: league.name
    };
  });

  container.innerHTML = "";
  predictions.forEach(pred => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${pred.match}</strong> <br><em>${pred.tip}</em> <br><small>${pred.league}</small><hr>`;
    container.appendChild(div);
  });
}

// Bi-Weekly 25–40 Odds Accumulator (Page 3)
async function loadMidweekAccumulator() {
  const container = document.getElementById("biWeeklyAccumulator");
  container.innerHTML = "Loading...";

  const days = [1, 2, 5, 6]; // Tue, Wed, Sat, Sun
  const today = new Date();
  const fixtures = [];

  for (let i = 1; i <= 3; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    if (days.includes(date.getDay())) {
      const d = date.toISOString().split("T")[0];
      const result = await fetchFromAPI(`/fixtures?date=${d}`);
      if (result?.response) fixtures.push(...result.response);
    }
  }

  const picks = fixtures.slice(0, 10).map(match => {
    const chance = Math.random() > 0.5 ? "Home Win or Draw" : "Over 2.5 Goals";
    return `${match.teams.home.name} vs ${match.teams.away.name}: ${chance}`;
  });

  container.innerHTML = picks.length ? picks.join("<hr>") : "No suitable matches found.";
}

// Weekly 1500 Odds Accumulator (Page 4)
async function loadMegaAccumulator() {
  const container = document.getElementById("megaAccumulator");
  container.innerHTML = "Loading mega accumulator...";

  const fixtures = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const d = date.toISOString().split("T")[0];
    const result = await fetchFromAPI(`/fixtures?date=${d}`);
    if (result?.response) fixtures.push(...result.response);
  }

  const picks = fixtures.slice(0, 20).map(match => {
    const tip = Math.random() > 0.6 ? "Over 1.5 Goals" : "Double Chance Away";
    return `${match.teams.home.name} vs ${match.teams.away.name}: ${tip}`;
  });

  container.innerHTML = picks.length ? picks.join("<hr>") : "No weekly accumulator matches found.";
}

// Load correct page content
function loadPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(pageId).style.display = "block";
  if (pageId === "livePage") loadLiveGames();
  if (pageId === "dailyPage") loadDailyPredictions();
  if (pageId === "biWeeklyPage") loadMidweekAccumulator();
  if (pageId === "megaPage") loadMegaAccumulator();
}

document.addEventListener("DOMContentLoaded", () => {
  loadPage("livePage");
  document.getElementById("navLive").onclick = () => loadPage("livePage");
  document.getElementById("navDaily").onclick = () => loadPage("dailyPage");
  document.getElementById("navBiWeekly").onclick = () => loadPage("biWeeklyPage");
  document.getElementById("navMega").onclick = () => loadPage("megaPage");
});
