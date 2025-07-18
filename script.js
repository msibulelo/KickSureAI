// SureKick AI - script.js

const API_KEY = "9f0af8032a630bf720551c3c38b78057";
const BASE_URL = "https://v3.football.api-sports.io";

const headers = {
  "x-apisports-key": API_KEY,
};

const tabs = ["live", "daily", "biweekly", "weekly"];

function switchTab(tabId) {
  tabs.forEach((tab) => {
    document.getElementById(tab).classList.remove("active");
    document.querySelector(`button.tab[onclick*='${tab}']`).classList.remove("active");
  });
  document.getElementById(tabId).classList.add("active");
  document.querySelector(`button.tab[onclick*='${tabId}']`).classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  fetchLiveScores();
  fetchDailyTips();
  fetchBiWeeklyAccumulator();
  fetchWeeklyAccumulator();
});

// Fetch live scores
function fetchLiveScores() {
  const url = `${BASE_URL}/fixtures?live=all`;
  fetch(url, { headers })
    .then((res) => res.json())
    .then((data) => {
      const box = document.getElementById("liveBox");
      if (!data.response || data.response.length === 0) {
        box.innerHTML = "No live games currently.";
        return;
      }
      box.innerHTML = data.response
        .map((match) => {
          const teams = match.teams;
          return `<div class="match">
            <strong>${teams.home.name}</strong> ${match.goals.home} - ${match.goals.away} <strong>${teams.away.name}</strong>
            <br/><small>Status: ${match.fixture.status.long}</small>
          </div>`;
        })
        .join("");
    })
    .catch(() => {
      document.getElementById("liveBox").innerText = "Failed to load live scores.";
    });
}

// Get fixtures for today + next 3 days
function getUpcomingFixtures(callback) {
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + 3);

  const from = today.toISOString().split("T")[0];
  const to = endDate.toISOString().split("T")[0];

  const url = `${BASE_URL}/fixtures?date=${from}&to=${to}`;

  fetch(url, { headers })
    .then((res) => res.json())
    .then((data) => {
      if (data.response && data.response.length > 0) {
        callback(data.response);
      } else {
        callback([]);
      }
    })
    .catch(() => callback([]));
}

// Generate prediction logic (dummy scoring)
function smartPredict(fixtures, oddsTarget = 3) {
  let confidentGames = fixtures.filter((f) => {
    const form = f.teams.home?.form || "WWDLW";
    const wins = (form.match(/W/g) || []).length;
    return wins >= 3 && f.teams.away?.form?.includes("L");
  });
  return confidentGames.slice(0, 5).map((match) => {
    return {
      text: `${match.teams.home.name} to win vs ${match.teams.away.name}`,
      fixture: match,
    };
  });
}

function fetchDailyTips() {
  getUpcomingFixtures((fixtures) => {
    const dailyTips = smartPredict(fixtures);
    const box = document.getElementById("dailyBox");
    if (dailyTips.length === 0) {
      box.innerHTML = "No strong daily tips available.";
      return;
    }
    box.innerHTML = dailyTips.map((tip) => `<div class='tip'>✅ ${tip.text}</div>`).join("");
  });
}

function fetchBiWeeklyAccumulator() {
  getUpcomingFixtures((fixtures) => {
    const filtered = fixtures.filter((f) => {
      const date = new Date(f.fixture.date);
      const day = date.getUTCDay();
      return [2, 3, 4, 5, 6, 0].includes(day); // Tue - Sun
    });
    const accTips = smartPredict(filtered, 40);
    const box = document.getElementById("biweeklyBox");
    if (accTips.length === 0) {
      box.innerHTML = "No bi-weekly accumulator found.";
      return;
    }
    box.innerHTML = accTips.map((tip) => `<div class='tip'>🔥 ${tip.text}</div>`).join("");
  });
}

function fetchWeeklyAccumulator() {
  getUpcomingFixtures((fixtures) => {
    const megaTips = smartPredict(fixtures, 1500);
    const box = document.getElementById("weeklyBox");
    if (megaTips.length === 0) {
      box.innerHTML = "No weekly mega tips found.";
      return;
    }
    box.innerHTML = megaTips.map((tip) => `<div class='tip'>💥 ${tip.text}</div>`).join("");
  });
}
