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

function calculateConfidence(oddsList) {
  const avgOdd = oddsList.reduce((sum, val) => sum + parseFloat(val.odd), 0) / oddsList.length;
  if (avgOdd <= 1.8) return 'High';
  if (avgOdd <= 2.2) return 'Medium';
  return 'Low';
}

function renderOdds(fixtures) {
  const oddsBox = document.getElementById("oddsBox");
  oddsBox.innerHTML = '<h3>SureKick AI: Bet365 Odds with Confidence & Accumulators</h3>';

  const accumulator = [];

  fixtures.forEach(fixture => {
    const home = fixture.teams.home;
    const away = fixture.teams.away;
    const league = fixture.league.name;
    const match = `${home} vs ${away}`;

    const bets = fixture.bookmakers[0]?.bets || [];

    const filteredBets = bets.filter(bet =>
      bet.label === "Match Winner" || bet.label.includes("Over/Under 2.5")
    );

    let oddsContent = '';
    let selectionConfidence = [];

    filteredBets.forEach(bet => {
      const highOdds = bet.values.filter(value => parseFloat(value.odd) >= 1.8);
      if (highOdds.length > 0) {
        const conf = calculateConfidence(highOdds);
        selectionConfidence.push(conf);
        oddsContent += `<li><strong>${bet.label}</strong>: `;
        oddsContent += highOdds.map(val => `${val.value} @ ${val.odd}`).join(', ');
        oddsContent += `</li>`;
      }
    });

    if (oddsContent) {
      const avgConf = selectionConfidence.includes('Low') ? 'Low' : (selectionConfidence.includes('Medium') ? 'Medium' : 'High');
      if (avgConf === 'High') {
        accumulator.push(match);
      }

      oddsBox.innerHTML += `
        <div class="card">
          <strong>${match}</strong><br/>
          <small>${league}</small><br/>
          <ul>${oddsContent}</ul>
          <p>Confidence: <span class="${avgConf.toLowerCase()}">${avgConf}</span></p>
        </div>
      `;
    }
  });

  if (accumulator.length > 0) {
    oddsBox.innerHTML += `
      <div class="accumulator">
        <h4>🔥 Daily Accumulator (High Confidence)</h4>
        <ul>${accumulator.map(match => `<li>${match}</li>`).join('')}</ul>
      </div>
    `;
  }
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


