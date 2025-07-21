// SureKick AI - Enhanced Predictions Script

const API_KEY = '9f0af8032a630bf720551c3c38b78057';
const API_HOST = 'https://v3.football.api-sports.io';
const DAYS_AHEAD = 1; // Predict matches 1 day in advance

async function fetchFixtures() {
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + DAYS_AHEAD);
  const dateStr = targetDate.toISOString().split('T')[0];

  const url = `${API_HOST}/fixtures?date=${dateStr}`;
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
      document.getElementById('dailyTips').innerHTML = 'No upcoming fixtures for tomorrow.';
      return;
    }
    await generatePredictions(data.response);
  } catch (err) {
    document.getElementById('dailyTips').innerHTML = 'Failed to load predictions.';
    console.error(err);
  }
}

async function fetchTeamStats(teamId) {
  const url = `${API_HOST}/teams/statistics?season=2024&team=${teamId}&league=39`; // Premier League as example
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
    console.error('Stats fetch failed for team:', teamId);
    return null;
  }
}

function calculateConfidence(winRate) {
  if (winRate > 0.8) return 90;
  if (winRate > 0.7) return 80;
  if (winRate > 0.6) return 70;
  if (winRate > 0.5) return 65;
  return 60;
}

async function generatePredictions(fixtures) {
  const container = document.getElementById('dailyTips');
  container.innerHTML = '<h3>✅ Tomorrow's AI-Powered Predictions</h3>';

  for (const fix of fixtures) {
    const home = fix.teams.home;
    const away = fix.teams.away;
    const leagueId = fix.league.id;

    const homeStats = await fetchTeamStats(home.id);
    const awayStats = await fetchTeamStats(away.id);
    if (!homeStats || !awayStats) continue;

    const homeWins = homeStats.response.form?.split('').filter(c => c === 'W').length || 0;
    const awayWins = awayStats.response.form?.split('').filter(c => c === 'W').length || 0;

    const totalGames = homeStats.response.form?.length || 10;
    const homeWinRate = homeWins / totalGames;
    const awayWinRate = awayWins / totalGames;

    let market = 'Double Chance';
    let prediction = 'Draw or ';
    let favoredTeam = '';

    if (homeWinRate > awayWinRate) {
      favoredTeam = home.name;
      prediction += `${home.name}`;
    } else {
      favoredTeam = away.name;
      prediction += `${away.name}`;
    }

    const over25 = homeStats.response.goals.for.total.total / totalGames + awayStats.response.goals.for.total.total / totalGames > 2.5;

    const confidence = calculateConfidence(Math.max(homeWinRate, awayWinRate));
    const tips = [];

    tips.push(`⚽ <strong>${home.name} vs ${away.name}</strong>`);
    tips.push(`✅ Prediction: <strong>${prediction}</strong> (Favored: ${favoredTeam})`);
    tips.push(`📊 Market: <strong>${market}</strong>`);
    tips.push(`🎯 Confidence: <strong>${confidence}%</strong>`);
    if (over25) tips.push('🔥 Suggested Bet: <strong>Over 2.5 Goals</strong>');

    container.innerHTML += `<div class='card'>${tips.join('<br>')}</div>`;
  }
}

async function fetchLiveScores() {
  const url = `${API_HOST}/fixtures?live=all`;
  const options = {
    method: 'GET',
    headers: {
      'x-apisports-key': API_KEY
    }
  };

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    const container = document.getElementById('liveScores');
    container.innerHTML = '<h3>⚽ Live Matches</h3>';

    if (!data.response.length) {
      container.innerHTML += 'No live games currently.';
      return;
    }

    for (const match of data.response) {
      const home = match.teams.home.name;
      const away = match.teams.away.name;
      const score = `${match.goals.home} - ${match.goals.away}`;
      const time = match.fixture.status.elapsed;
      container.innerHTML += `<div class='card'>${home} vs ${away}<br>⏱ ${time}' | 🔢 ${score}</div>`;
    }
  } catch (err) {
    document.getElementById('liveScores').innerHTML = 'Live scores not available.';
    console.error(err);
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
  fetchLiveScores();
};
