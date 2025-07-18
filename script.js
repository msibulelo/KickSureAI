// SureKick AI - Multi-Screen Prediction Engine

const API_KEY = '9f0af8032a630bf720551c3c38b78057';
const API_HOST = 'https://v3.football.api-sports.io';
const DAYS_AHEAD = 3;

function switchTab(tabId) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".content").forEach(c => c.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  event.target.classList.add("active");

  if (tabId === 'live') fetchLiveGames();
  else if (tabId === 'daily') fetchFixtures('daily');
  else if (tabId === 'biweekly') fetchFixtures('biweekly');
  else if (tabId === 'weekly') fetchFixtures('weekly');
}

async function fetchLiveGames() {
  const container = document.getElementById('live');
  container.innerHTML = '<h3>Live Scores</h3>';

  try {
    const res = await fetch(`${API_HOST}/fixtures?live=all`, {
      method: 'GET',
      headers: { 'x-apisports-key': API_KEY }
    });
    const data = await res.json();
    if (!data.response.length) {
      container.innerHTML += 'No live matches right now.';
      return;
    }

    data.response.forEach(fix => {
      container.innerHTML += `<div class='card'>
        ${fix.teams.home.name} ${fix.goals.home} - ${fix.goals.away} ${fix.teams.away.name}
        <br><small>Status: ${fix.fixture.status.short}</small></div>`;
    });
  } catch (err) {
    container.innerHTML += 'Failed to load live scores.';
  }
}

async function fetchFixtures(type) {
  const container = document.getElementById(type);
  container.innerHTML = `<h3>${getTitle(type)}</h3>`;

  const now = new Date();
  const to = new Date();
  to.setDate(now.getDate() + (type === 'daily' ? 3 : 10));
  const from = now.toISOString().split('T')[0];
  const toDate = to.toISOString().split('T')[0];

  try {
    const res = await fetch(`${API_HOST}/fixtures?from=${from}&to=${toDate}`, {
      method: 'GET',
      headers: { 'x-apisports-key': API_KEY }
    });
    const data = await res.json();

    if (!data.response.length) {
      container.innerHTML += 'No upcoming fixtures.';
      return;
    }

    let acc = [];
    for (const fix of data.response.slice(0, 25)) {
      const pred = await predictMatch(fix);
      if (pred) {
        container.innerHTML += `<div class='card'>${pred.text}</div>`;
        if (pred.confidence >= getMinConfidence(type)) acc.push(pred.summary);
      }
    }

    if (acc.length) {
      container.innerHTML += `<div class='card'>
        <h4>🔥 SureKick AI Accumulator</h4>
        <ul>${acc.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>`;
    }
  } catch (err) {
    container.innerHTML += 'Prediction load failed.';
  }
}

async function predictMatch(fix) {
  const homeId = fix.teams.home.id;
  const awayId = fix.teams.away.id;

  try {
    const [homeStats, awayStats] = await Promise.all([
      fetchTeamForm(homeId),
      fetchTeamForm(awayId)
    ]);
    if (!homeStats || !awayStats) return null;

    const homeWinRate = calcWinRate(homeStats);
    const awayWinRate = calcWinRate(awayStats);

    let prediction = 'Draw';
    if (homeWinRate > awayWinRate + 0.2) prediction = 'Home Win';
    else if (awayWinRate > homeWinRate + 0.2) prediction = 'Away Win';

    const confidence = Math.round(Math.max(homeWinRate, awayWinRate) * 100);
    const summary = `${fix.teams.home.name} vs ${fix.teams.away.name} - ${prediction} (${confidence}%)`;

    return {
      text: `⚽ ${fix.teams.home.name} vs ${fix.teams.away.name}<br>
        ✅ Prediction: <strong>${prediction}</strong><br>
        🔢 Confidence: <strong>${confidence}%</strong><br>
        📊 Market: Win/Draw/Loss`,
      confidence,
      summary
    };
  } catch {
    return null;
  }
}

function getTitle(type) {
  return type === 'daily' ? 'Daily 3-Odd Predictions'
    : type === 'biweekly' ? 'Bi-Weekly 25–40 Odds'
    : 'Weekly 1500 Odds';
}

function getMinConfidence(type) {
  return type === 'daily' ? 85 : type === 'biweekly' ? 75 : 65;
}

function calcWinRate(stats) {
  return stats.split('').filter(c => c === 'W').length / stats.length;
}

async function fetchTeamForm(teamId) {
  try {
    const res = await fetch(`${API_HOST}/teams/statistics?season=2024&team=${teamId}`, {
      method: 'GET',
      headers: { 'x-apisports-key': API_KEY }
    });
    const data = await res.json();
    return data.response.form || '';
  } catch {
    return '';
  }
}

window.onload = () => {
  fetchLiveGames();
};
