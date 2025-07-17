const API_KEY = '1f03370e05msh97afed5228d91edp11a26cjsn38eed54f4fea';
const API_HOST = 'api-football-v1.p.rapidapi.com';
const BOOKMAKER_ID = 5; // Bet365
const PAGE = 1;

async function fetchOdds() {
  const url = `https://${API_HOST}/v2/odds/bookmaker/${BOOKMAKER_ID}?page=${PAGE}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': API_HOST
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    renderOdds(data.api.fixtures);
  } catch (error) {
    document.getElementById("oddsBox").innerHTML = "⚠️ Failed to load odds.";
    console.error(error);
  }
}

function renderOdds(fixtures) {
  const oddsBox = document.getElementById("oddsBox");
  oddsBox.innerHTML = '<h3>Live Odds from Bet365</h3>';

  if (!fixtures || fixtures.length === 0) {
    oddsBox.innerHTML += "<p>No odds data available.</p>";
    return;
  }

  fixtures.forEach(fixture => {
    oddsBox.innerHTML += `
      <div class="card">
        <strong>${fixture.teams.home} vs ${fixture.teams.away}</strong><br/>
        <small>${fixture.league.name}</small><br/>
        <ul>
          ${fixture.bookmakers[0]?.bets.map(bet => `
            <li><strong>${bet.label}</strong>: 
              ${bet.values.map(value => `${value.value} @ ${value.odd}`).join(', ')}
            </li>
          `).join('')}
        </ul>
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
  fetchOdds();
};

