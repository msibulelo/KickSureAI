// SureKick AI - Updated Script for Predictions and Accumulators

const API_KEY = '02a00468ecc46837206bb0c35f091625';
const API_HOST = 'https://v3.football.api-sports.io';
const DAYS_AHEAD = 3;

async function fetchFixtures() {
  const now = new Date();
  const toDate = new Date();
  toDate.setDate(now.getDate() + DAYS_AHEAD);

  const from = now.toISOString().split('T')[0];
  const to = toDate.toISOString().split('T')[0];

  const url = `${API_HOST}/fixtures?date=${from}&to=${to}`;
  const options = {
    method: 'GET',
    headers: {
      'x-apisports-key': API_KEY
    }
  };

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!data.response || data.response.length === 0) {
      document.getElementById('oddsBox').innerHTML = 'No upcoming fixtures.';
      return;
    }
    await generatePredictions(data.response);
  } catch (err) {
    document.getElementById('oddsBox').innerHTML = 'Failed to load predictions.';
    console.error(err);
  }
}

async function fetchLastMatches(teamId) {
  const url = `${API_HOST}/teams/statistics?season=2024&team=${teamId}`;
  const options = {
    method: 'GET',
    headers: {
      'x-apisports-key': API_KEY
    }
  };
  try {
    const res = await fetch(url, options);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch stats for team ' + teamId);
    return null;
  }
}

async function generatePredictions(fixtures) {
  const container = document.getElementById('oddsBox');
  container.innerHTML = '<h3>SureKick AI Predictions</h3>';
  const accTips = [];

  for (const fix of fixtures) {
    const home = fix.teams.home;
    const away = fix.teams.away;

    const homeStats = await fetchLastMatches(home.id);
    const awayStats = await fetchLastMatches(away.id);
    if (!homeStats || !awayStats) continue;

    const homeWinRate = homeStats.response.form?.split('').filter(c => c === 'W').length / homeStats.response.form.length || 0;
    const awayWinRate = awayStats.response.form?.split('').filter(c => c === 'W').length / awayStats.response.form.length || 0;

    let prediction = 'Draw';
    if (homeWinRate > awayWinRate + 0.2) prediction = 'Home Win';
    else if (awayWinRate > homeWinRate + 0.2) prediction = 'Away Win';

    const confidence = Math.round(Math.max(homeWinRate, awayWinRate) * 100);

    const text = `⚽ ${home.name} vs ${away.name}<br>
    ✅ Prediction: <strong>${prediction}</strong><br>
    🔢 Confidence: <strong>${confidence}%</strong><br>
    📊 Market: Win/Draw/Loss`;

    const tip = `<div class='card'>${text}</div>`;
    container.innerHTML += tip;

    if (confidence >= 75) accTips.push(`${home.name} vs ${away.name} - ${prediction} (${confidence}%)`);
  }

  // Add accumulator tips
  if (accTips.length) {
    container.innerHTML += `<div class='card'>
      <h4>🔥 SureKick AI Accumulator</h4>
      <ul>${accTips.map(t => `<li>${t}</li>`).join('')}</ul>
    </div>`;
  }
}

function switchTab(tabId) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".content").forEach(c => c.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  event.target.classList.add("active");
}

window.onload = () => {
  fetchFixtures();
};
