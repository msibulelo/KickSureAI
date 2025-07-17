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

    if (!data.api || !data.api.fixtures || data.api.fixtures.length === 0) {
      throw new Error("No odds data returned.");
    }

    renderOdds(data.api.fixtures);
  } catch (error) {
    document.getElementById("oddsBox").innerHTML = "⚠️ Failed to load odds.";
    console.error("Fetch error:", error);
  }
}

function renderOdds(fixtures) {
  const oddsBox = document.getElementById("oddsBox");
  oddsBox.innerHTML = '<h3>SureKick AI: Bet365 Odds (1X2 & Over/Under 2.5)</h3>';

  fixtures.forEach(fixture => {
    const home = fixture.teams.home;
    const away = fixture.teams.away;
    const league = fixture.league.name;
    const match = `${home} vs ${away}`;

    const bets = fixture.bookmakers[0]?.bets || [];

    // Filter for 1X2 or Over/Under 2.5
    const filteredBets = bets.filter(bet =>
      bet.label === "Match Winner" || bet.label.includes("Over/Under 2.5")
    );

    let oddsContent = '';
    filteredBets.forEach(bet => {
      const highOdds = bet.values.filter(value => parseFloat(value.odd) >= 1.8);
      if (highOdds.length > 0) {
        oddsContent += `<li><strong>${bet.label}</strong>: `;
        oddsContent += highOdds.map(val => `${val.value} @ ${val.odd}`).join(', ');
        oddsContent += `</li>`;
      }
    });

    if (oddsContent) {
      oddsBox.innerHTML += `
        <div class="card">
          <strong>${match}</strong><br/>
          <small>${league}</small><br/>
          <ul>${oddsContent}</ul>
        </div>
      `;
    }
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


