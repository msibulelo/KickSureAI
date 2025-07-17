// script.js - Using API-FOOTBALL (api-football.com)

const API_KEY = '02a00468ecc46837206bb0c35f091625';
const BASE_URL = 'https://v3.football.api-sports.io';

async function fetchLiveMatches() {
  const url = `${BASE_URL}/fixtures?live=all`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': API_KEY
      }
    });

    const result = await response.json();
    renderMatches(result.response);
  } catch (error) {
    document.getElementById("oddsBox").innerHTML = "⚠️ Failed to load live matches.";
    console.error(error);
  }
}

function renderMatches(matches) {
  const oddsBox = document.getElementById("oddsBox");
  if (!matches || matches.length === 0) {
    oddsBox.innerHTML = "No live matches currently.";
    return;
  }

  oddsBox.innerHTML = '<h3>Live Football Matches</h3>';

  matches.forEach(match => {
    const teams = `${match.teams.home.name} vs ${match.teams.away.name}`;
    const score = `${match.goals.home} - ${match.goals.away}`;
    const league = match.league.name;
    const time = match.fixture.status.elapsed;

    oddsBox.innerHTML += `
      <div class='card'>
        <strong>${teams}</strong><br/>
        <span>Score: ${score}</span><br/>
        <span>League: ${league}</span><br/>
        <span>Time: ${time}'</span>
      </div>
    `;
  });
}

function switchTab(tabId) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".content").forEach(c => c.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  event.target.classList.add("active");
}

window.onload = () => {
  fetchLiveMatches();
};
