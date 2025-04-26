<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      width: 600px;
      height: 500px;
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background: #1a1a1a;
      color: #ffffff;
    }
    .container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    #gradientDisplay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }
    #countdownDisplay {
      position: relative;
      z-index: 2;
      text-align: center;
      padding: 20px;
    }
    #periodName {
      font-size: 32px;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }
    #timeRemaining {
      font-size: 96px;
      font-weight: bold;
      text-shadow: 3px 3px 6px rgba(0,0,0,0.5);
    }
  </style>
</head>
<body>
  <div class="container">
    <div id="gradientDisplay"></div>
    <div id="countdownDisplay">
      <div id="periodName">Loading...</div>
      <div id="timeRemaining">--:--</div>
    </div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
