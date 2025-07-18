// SureKick AI - Free Plan Compatible Predictions & Accumulators

const API_KEY = '9f0af8032a630bf720551c3c38b78057';
const API_HOST = 'https://v3.football.api-sports.io';
const DAYS_AHEAD = 3;

async function fetchFixtures(range = 'daily') {
  const now = new Date();
  const toDate = new Date();
  if (range === 'biweekly') toDate.setDate(now.getDate() + 7);
  else if (range === 'weekly') toDate.setDate(now.getDate() + 10);
  else toDate.setDate(now.getDate() + DAYS_AHEAD);

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
    return data.response || [];
  } catch (err) {
    console.error('Error fetching fixtures:', err);
    return [];
  }
}

async function fetchTeamForm(teamId) {
  const url = `${API_HOST}/teams/statistics?season=2024&team=${teamId}&league=39`; // EPL for example
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
    console.error('Error fetching stats:', err);
    return null;
  }
}

function calculateWinConfidence(formString = '') {
  const form = formString.slice(-5);
  const wins = form.split('').filter(ch => ch === 'W').length;
  return Math.round((wins / form.length) * 100);
}

async function generatePredictions(target, range = 'daily') {
  const container = document.getElementById(target);
  container.innerHTML = '<h3>SureKick AI Predictions</h3>';

  const fixtures = await fetchFixtures(range);
  const predictions = [];

  for (const fix of fixtures) {
    const home = fix.teams.home;
    const away = fix.teams.away;

    const homeStats = await fetchTeamForm(home.id);
    const awayStats = await fetchTeamForm(away.id);
    if (!homeStats || !awayStats) continue;

    const homeConfidence = calculateWinConfidence(homeStats.response.form);
    const awayConfidence = calculateWinConfidence(awayStats.response.form);

    let prediction = 'Draw';
    let confidence = 50;
    if (homeConfidence > awayConfidence + 15) {
      prediction = 'Home Win';
      confidence = homeConfidence;
    } else if (awayConfidence > homeConfidence + 15) {
      prediction = 'Away Win';
      confidence = awayConfidence;
    }

    const card = `<div class="card">
      <b>${home.name} vs ${away.name}</b><br>
      ✅ Prediction: ${prediction}<br>
      🔢 Confidence: ${confidence}%<br>
      📊 Based on recent form
    </div>`;

    predictions.push({ html: card, confidence });
  }

  // Display top predictions only for accumulator
  const highConfidence = predictions.filter(p => p.confidence >= 70);
  highConfidence.forEach(p => (container.innerHTML += p.html));

  if (highConfidence.length) {
    container.innerHTML += `<div class='card'>
      <h4>🔥 SureKick AI Accumulator (${range})</h4>
      <ul>${highConfidence.map(p => `<li>${p.html.match(/<b>(.*?)<\/b>/)[1]}</li>`).join('')}</ul>
    </div>`;
  }
}

function showPage(id) {
  ['live', 'daily', 'biweekly', 'weekly'].forEach(pid => {
    document.getElementById(pid).style.display = pid === id ? 'block' : 'none';
  });
}

window.onload = async () => {
  // Live scores
  const liveUrl = `${API_HOST}/fixtures?live=all`;
  const res = await fetch(liveUrl, {
    headers: { 'x-apisports-key': API_KEY }
  });
  const data = await res.json();
  const liveBox = document.getElementById('live');
  if (data.response.length) {
    data.response.forEach(fix => {
      liveBox.innerHTML += `<div class='card'>
        🔴 ${fix.teams.home.name} ${fix.goals.home} - ${fix.goals.away} ${fix.teams.away.name}<br>
        ⏱️ ${fix.fixture.status.elapsed || 0}'
      </div>`;
    });
  } else {
    liveBox.innerHTML = '<p>No live games right now.</p>';
  }

  // Predictions
  generatePredictions('daily', 'daily');
  generatePredictions('biweekly', 'biweekly');
  generatePredictions('weekly', 'weekly');
};
