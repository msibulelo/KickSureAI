<!-- SureKick AI Full App with Smart Limited Logic and Fixed API Access -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SureKick AI</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      font-family: 'Orbitron', sans-serif;
      background-color: #0a0f1a;
      color: #e0e0e0;
    }
    header {
      background-color: #121b2d;
      text-align: center;
      padding: 1em;
      font-size: 1.8em;
      font-weight: bold;
      color: #00ffcc;
    }
    nav {
      display: flex;
      justify-content: space-around;
      background: #1d263b;
      padding: 0.5em;
    }
    nav button {
      background: none;
      border: none;
      color: #ffffff;
      font-size: 1em;
      cursor: pointer;
    }
    nav button.active {
      border-bottom: 2px solid #00ffcc;
    }
    .content {
      display: none;
      padding: 1em;
    }
    .content.active {
      display: block;
    }
    .card {
      background-color: #1a2238;
      margin: 1em 0;
      padding: 1em;
      border-radius: 10px;
      box-shadow: 0 0 10px #00ffcc44;
    }
    ul {
      padding-left: 20px;
    }
    .loading {
      text-align: center;
      padding: 2em;
      font-size: 1.2em;
      color: #00ffaa;
    }
  </style>
</head>
<body>
  <header>SureKick AI</header>
  <nav>
    <button onclick="switchTab('live')" class="tab active">Live Scores</button>
    <button onclick="switchTab('daily')" class="tab">Daily Tips</button>
    <button onclick="switchTab('biweekly')" class="tab">Bi-Weekly 25–40 Odds</button>
    <button onclick="switchTab('mega')" class="tab">Weekly 1500 Odds</button>
  </nav>

  <div id="live" class="content active">
    <div id="liveBox" class="loading">Loading live scores...</div>
  </div>

  <div id="daily" class="content">
    <div id="dailyBox" class="loading">Loading daily tips...</div>
  </div>

  <div id="biweekly" class="content">
    <div id="biweeklyBox" class="loading">Loading bi-weekly accumulator...</div>
  </div>

  <div id="mega" class="content">
    <div id="megaBox" class="loading">Loading mega accumulator...</div>
  </div>

  <script src="script.js"></script>
</body>
</html>
