
const API_KEY = '1f03370e05msh97afed5228d91edp11a26cjsn38eed54f4fea';
const API_HOST = 'bet36528.p.rapidapi.com';
const EVENT_ID = 'id1000001750850531';

async function fetchOdds() {
  const url = `https://${API_HOST}/odds_bet365?eventId=${EVENT_ID}&oddsFormat=decimal&raw=false`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': API_HOST
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    renderOdds(data);
  } catch (error) {
    document.getElementById("oddsBox").innerHTML = "Failed to load odds.";
    console.error(error);
  }
}

function renderOdds(data) {
  const oddsBox = document.getElementById("oddsBox");
  if (!data || !data.result || !data.result.odds) {
    oddsBox.innerHTML = "No odds data available.";
    return;
  }
  const odds = data.result.odds;
  oddsBox.innerHTML = '<h3>Live Odds (Bet365)</h3>';
  for (const market in odds) {
    const marketData = odds[market];
    oddsBox.innerHTML += `<div class='card'><strong>${market}</strong><ul>`;
    for (const outcome of marketData) {
      oddsBox.innerHTML += `<li>${outcome.name}: ${outcome.odds}</li>`;
    }
    oddsBox.innerHTML += '</ul></div>';
  }
}

function switchTab(tabId, event) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".content").forEach(c => c.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  if (event) event.target.classList.add("active");
}

window.onload = () => {
  fetchOdds();
};
