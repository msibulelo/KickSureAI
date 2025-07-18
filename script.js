const apiKey = '9f0af8032a630bf720551c3c38b78057';
const headers = {
  'X-RapidAPI-Key': apiKey,
  'X-RapidAPI-Host': 'v3.football.api-sports.io',
};

const today = new Date();
const getDateString = (offsetDays) => {
  const date = new Date();
  date.setDate(today.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

async function fetchAPI(endpoint) {
  try {
    const res = await fetch(`https://v3.football.api-sports.io/${endpoint}`, { headers });
    const data = await res.json();
    return data.response || [];
  } catch (error) {
    console.error('API error:', error);
    return [];
  }
}

function showLoading(id, message = 'Loading...') {
  document.getElementById(id).innerHTML = `<p>${message}</p>`;
}

function switchTab(tabId, e) {
  document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  e.target.classList.add('active');
}

function getConfidence(home, away) {
  const diff = home - away;
  if (diff > 1.5) return 90;
  if (diff > 1) return 80;
  if (diff > 0.5) return 70;
  return 60;
}

function formatPrediction(match, prediction, confidence) {
  return `
    <div class="matchCard">
      <h4>${match.teams.home.name} vs ${match.teams.away.name}</h4>
      <p><strong>Tip:</strong> ${prediction}</p>
      <p><strong>Kick-off:</strong> ${match.fixture.date.split('T')[0]} ${match.fixture.date.split('T')[1].slice(0, 5)}</p>
      <p><strong>Confidence:</strong> ${confidence}%</p>
    </div>
  `;
}

function formatLiveGame(match) {
  const time = match.fixture.status.elapsed || 0;
  return `
    <div class="liveCard">
      <h4>${match.teams.home.name} ${match.goals.home} - ${match.goals.away} ${match.teams.away.name}</h4>
      <p><strong>Time:</strong> ${time}'</p>
      <p><strong>Status:</strong> ${match.fixture.status.long}</p>
    </div>
  `;
}

async function loadLiveScores() {
  showLoading('liveGames', 'Loading live matches...');
  const matches = await fetchAPI('fixtures?live=all');
  const html = matches.length
    ? matches.map(formatLiveGame).join('')
    : '<p>No live matches currently.</p>';
  document.getElementById('liveGames').innerHTML = html;
}

async function loadPredictions(id, startOffset, endOffset, maxTips) {
  showLoading(id, 'Generating tips...');
  let tips = [];
  for (let i = startOffset; i <= endOffset; i++) {
    const date = getDateString(i);
    const fixtures = await fetchAPI(`fixtures?date=${date}`);
    for (const match of fixtures) {
      if (!match.teams.home.winner && !match.teams.away.winner) {
        const homeForm = match.teams.home.league?.form?.length || 2;
        const awayForm = match.teams.away.league?.form?.length || 2;
        const prediction = homeForm > awayForm ? "Home Win" : "Double Chance";
        const confidence = getConfidence(homeForm, awayForm);
        tips.push(formatPrediction(match, prediction, confidence));
        if (tips.length >= maxTips) break;
      }
    }
    if (tips.length >= maxTips) break;
  }
  document.getElementById(id).innerHTML = tips.length ? tips.join('') : '<p>No strong predictions available.</p>';
}

async function loadApp() {
  loadLiveScores();
  loadPredictions('dailyTips', 0, 0, 3);        // Today: max 3 tips
  loadPredictions('biweeklyTips', 0, 3, 8);     // Next 3 days: max 8 tips
  loadPredictions('weeklyTips', 0, 5, 15);      // Weekly: max 15 tips
}

loadApp();
