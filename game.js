// Classic Black & White Pong - Game Engine
(() => {
  const canvas = document.getElementById('pongCanvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const overlayMessage = document.getElementById('overlayMessage');
  const modeSelect = document.getElementById('gameMode');

  // Game Dimensions & Constants
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const PADDLE_WIDTH = 12;
  const PADDLE_HEIGHT = 80;
  const PADDLE_MARGIN = 24;
  const PADDLE_SPEED = 7;
  const BALL_SIZE = 12;
  const INITIAL_BALL_SPEED = 5.5;
  const SPEED_INCREMENT = 0.35;
  const MAX_BALL_SPEED = 14;
  const WINNING_SCORE = 11;

  // Sound Synthesizer (Retro Web Audio API)
  let audioCtx = null;
  let isMuted = false;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, duration, type = 'square') {
    if (isMuted || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {
      // Audio playback fails gracefully if unpermitted
    }
  }

  const sounds = {
    paddleHit: () => playTone(450, 0.08),
    wallHit: () => playTone(220, 0.08),
    score: () => playTone(120, 0.28),
    win: () => {
      playTone(330, 0.1);
      setTimeout(() => playTone(440, 0.1), 120);
      setTimeout(() => playTone(550, 0.25), 240);
    }
  };

  // Game State
  let state = 'START'; // 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
  let gameMode = 'ai'; // 'ai' | 'pvp'
  const keys = {};

  const player1 = {
    x: PADDLE_MARGIN,
    y: (HEIGHT - PADDLE_HEIGHT) / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    score: 0
  };

  const player2 = {
    x: WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
    y: (HEIGHT - PADDLE_HEIGHT) / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    score: 0
  };

  const ball = {
    x: (WIDTH - BALL_SIZE) / 2,
    y: (HEIGHT - BALL_SIZE) / 2,
    size: BALL_SIZE,
    vx: 0,
    vy: 0,
    speed: INITIAL_BALL_SPEED
  };

  function setOverlay(show, message = '') {
    if (show) {
      overlayMessage.textContent = message;
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }

  function resetBall(serveDirection = 1) {
    ball.x = (WIDTH - BALL_SIZE) / 2;
    ball.y = (HEIGHT - BALL_SIZE) / 2;
    ball.speed = INITIAL_BALL_SPEED;

    // Launch with a slight random vertical angle
    const angle = (Math.random() * Math.PI / 4) - (Math.PI / 8);
    ball.vx = serveDirection * ball.speed * Math.cos(angle);
    ball.vy = ball.speed * Math.sin(angle);
  }

  function resetGame() {
    player1.score = 0;
    player2.score = 0;
    player1.y = (HEIGHT - PADDLE_HEIGHT) / 2;
    player2.y = (HEIGHT - PADDLE_HEIGHT) / 2;
    resetBall(Math.random() < 0.5 ? 1 : -1);
    state = 'START';
    setOverlay(true, 'PRESS SPACE TO SERVE');
  }

  // Keyboard Event Listeners
  window.addEventListener('keydown', (e) => {
    initAudio();

    if (e.code === 'Space') {
      e.preventDefault();
      if (state === 'START') {
        state = 'PLAYING';
        setOverlay(false);
      } else if (state === 'PLAYING') {
        state = 'PAUSED';
        setOverlay(true, 'PAUSED - PRESS SPACE');
      } else if (state === 'PAUSED') {
        state = 'PLAYING';
        setOverlay(false);
      } else if (state === 'GAMEOVER') {
        resetGame();
        state = 'PLAYING';
        setOverlay(false);
      }
      return;
    }

    if (e.code === 'KeyR') {
      resetGame();
      return;
    }

    if (e.code === 'KeyM') {
      isMuted = !isMuted;
      return;
    }

    if (['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
      keys[e.code] = true;
    }
  });

  window.addEventListener('keyup', (e) => {
    if (['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
      keys[e.code] = false;
    }
  });

  modeSelect.addEventListener('change', (e) => {
    gameMode = e.target.value;
    resetGame();
  });

  // Update Game Logic
  function update() {
    if (state !== 'PLAYING') return;

    // 1. Move Player 1 (W / S)
    if (keys['KeyW']) {
      player1.y -= PADDLE_SPEED;
    }
    if (keys['KeyS']) {
      player1.y += PADDLE_SPEED;
    }
    player1.y = Math.max(0, Math.min(HEIGHT - player1.height, player1.y));

    // 2. Move Player 2 (Arrows or AI)
    if (gameMode === 'pvp') {
      if (keys['ArrowUp']) {
        player2.y -= PADDLE_SPEED;
      }
      if (keys['ArrowDown']) {
        player2.y += PADDLE_SPEED;
      }
    } else {
      // AI movement: tracks the ball when it travels toward AI's side
      const paddleCenter = player2.y + player2.height / 2;
      const ballCenter = ball.y + ball.size / 2;
      const distance = ballCenter - paddleCenter;

      if (ball.vx > 0) {
        // Active tracking with slight reaction buffer
        const aiSpeed = PADDLE_SPEED * 0.85;
        if (Math.abs(distance) > 8) {
          player2.y += Math.sign(distance) * Math.min(Math.abs(distance), aiSpeed);
        }
      } else {
        // Return toward center smoothly when ball moves away
        const homeCenter = HEIGHT / 2;
        const returnDist = homeCenter - paddleCenter;
        if (Math.abs(returnDist) > 10) {
          player2.y += Math.sign(returnDist) * 1.5;
        }
      }
    }
    player2.y = Math.max(0, Math.min(HEIGHT - player2.height, player2.y));

    // 3. Move Ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // 4. Wall Collisions (Top / Bottom)
    if (ball.y <= 0) {
      ball.y = 0;
      ball.vy = -ball.vy;
      sounds.wallHit();
    } else if (ball.y + ball.size >= HEIGHT) {
      ball.y = HEIGHT - ball.size;
      ball.vy = -ball.vy;
      sounds.wallHit();
    }

    // 5. Paddle Collisions
    // Left Paddle (Player 1)
    if (
      ball.vx < 0 &&
      ball.x <= player1.x + player1.width &&
      ball.x + ball.size >= player1.x &&
      ball.y + ball.size >= player1.y &&
      ball.y <= player1.y + player1.height
    ) {
      ball.x = player1.x + player1.width;
      bounce(player1, 1);
    }

    // Right Paddle (Player 2 / AI)
    if (
      ball.vx > 0 &&
      ball.x + ball.size >= player2.x &&
      ball.x <= player2.x + player2.width &&
      ball.y + ball.size >= player2.y &&
      ball.y <= player2.y + player2.height
    ) {
      ball.x = player2.x - ball.size;
      bounce(player2, -1);
    }

    // 6. Score Conditions
    if (ball.x + ball.size < 0) {
      // Player 2 Scores
      player2.score++;
      sounds.score();
      checkWinCondition('PLAYER 2');
      if (state !== 'GAMEOVER') {
        resetBall(1);
      }
    } else if (ball.x > WIDTH) {
      // Player 1 Scores
      player1.score++;
      sounds.score();
      checkWinCondition('PLAYER 1');
      if (state !== 'GAMEOVER') {
        resetBall(-1);
      }
    }
  }

  function bounce(paddle, direction) {
    sounds.paddleHit();

    // Increase speed slightly with each paddle strike
    ball.speed = Math.min(ball.speed + SPEED_INCREMENT, MAX_BALL_SPEED);

    // Calculate bounce angle based on point of contact on paddle
    const paddleCenter = paddle.y + paddle.height / 2;
    const ballCenter = ball.y + ball.size / 2;
    const relativeIntersectY = (ballCenter - paddleCenter) / (paddle.height / 2);

    // Max bounce angle = 50 degrees (50 * PI / 180)
    const bounceAngle = relativeIntersectY * (50 * Math.PI / 180);

    ball.vx = direction * ball.speed * Math.cos(bounceAngle);
    ball.vy = ball.speed * Math.sin(bounceAngle);
  }

  function checkWinCondition(scorerName) {
    if (player1.score >= WINNING_SCORE || player2.score >= WINNING_SCORE) {
      state = 'GAMEOVER';
      sounds.win();
      const winner = player1.score >= WINNING_SCORE ? 'PLAYER 1' : (gameMode === 'ai' ? 'COMPUTER' : 'PLAYER 2');
      setOverlay(true, `${winner} WINS! PRESS SPACE TO RESTART`);
    }
  }

  // Render Game Scene
  function render() {
    // 1. Clear Screen
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 2. Center Dashed Line (Net)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 16]);
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // 3. Scores
    ctx.fillStyle = '#ffffff';
    ctx.font = '54px "Courier New", Courier, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(player1.score.toString(), WIDTH / 2 - 90, 24);
    ctx.fillText(player2.score.toString(), WIDTH / 2 + 90, 24);

    // 4. Paddles
    ctx.fillRect(player1.x, player1.y, player1.width, player1.height);
    ctx.fillRect(player2.x, player2.y, player2.width, player2.height);

    // 5. Ball
    ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
  }

  // Main Loop
  function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
  }

  // Initial Setup
  resetGame();
  requestAnimationFrame(gameLoop);
})();
