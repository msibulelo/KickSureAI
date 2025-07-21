// --- SureKick AI v2 Script.js ---

const apiKey = "9f0af8032a630bf720551c3c38b78057";
const baseUrl = "https://v3.football.api-sports.io";
const headers = {
  method: "GET",
  headers: {
    "x-apisports-key": apiKey
  }
};

// Utility: Fetch upcoming fixtures from tomorrow +2 days
async function getUpcomingFixtures(daysAhead = 3) {
  const today = new Date();
  today.setDate(today.getDate() + 1); // Start from tomorrow
  const start = today.toISOString().split("T")[0];
  today.setDate(today.getDate() + daysAhead);
  const end = today.toISOString().split("T")[0];

  const url = `${baseUrl}/fixtures?date=${start}&to=${end}`;
  const res = await fetch(url, headers);
  const data = await res.json();
  return data.response || [];
}

function calculateConfidence(match) {
  let confidence = 60;

  // Boost confidence based on ranking or form (mock logic)
  const homeWinChance = Math.random() * 20;
  const awayWinChance = Math.random() * 20;

  if (homeWinChance > awayWinChance) confidence += 10;
  if (match.teams.home.name.length > match.teams.away.name.length) confidence += 5;
  if (confidence > 90) confidence = 90;

  return Math.round(confidence);
}

function generatePrediction(match) {
  const confidence = calculateConfidence(match);
  const goalsExpected = Math.random() * 5;
  const markets = [];

  if (goalsExpected > 3.5) markets.push("Over 3.5 Goals");
  else if (goalsExpected > 2.5) markets.push("Over 2.5 Goals");
  else markets.push("Under 2.5 Goals");

  const doubleChanceTeam = Math.random() > 0.5 ? match.teams.home.name : match.teams.away.name;
  markets.push(`Double Chance (${doubleChanceTeam} Win or Draw)`);

  const prediction = {
    fixture: match.fixture,
    home: match.teams.home.name,
    away: match.teams.away.name,
    prediction: markets.join(" + "),
    confidence
  };

  return prediction;
}

async function loadPredictions() {
  const container = document.getElementById("predictions");
  container.innerHTML = "<p>Loading predictions...</p>";

  try {
    const matches = await getUpcomingFixtures();
    const tips = matches.slice(0, 10).map(generatePrediction);

    container.innerHTML = tips.map(t => `
      <div class="tip">
        <strong>${t.home} vs ${t.away}</strong><br>
        Prediction: ${t.prediction}<br>
        Confidence: ${t.confidence}%
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = "<p>Failed to load predictions.</p>";
  }
}

// Load Live Scores
async function loadLiveScores() {
  const res = await fetch(`${baseUrl}/fixtures?live=all`, headers);
  const data = await res.json();
  const matches = data.response || [];
  const container = document.getElementById("live");

  if (matches.length === 0) {
    container.innerHTML = "<p>No live matches.</p>";
    return;
  }

  container.innerHTML = matches.map(m => `
    <div class="live">
      <strong>${m.teams.home.name} ${m.goals.home} - ${m.goals.away} ${m.teams.away.name}</strong><br>
      Status: ${m.fixture.status.elapsed}'
    </div>
  `).join("");
}

window.onload = () => {
  const page = document.body.dataset.page;

  switch (page) {
    case "live":
      loadLiveScores();
      break;
    case "daily":
      loadPredictions();
      break;
    case "weekly":
    case "mega":
      loadPredictions(); // reuse base prediction logic for now
      break;
  }
};
