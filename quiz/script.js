/* ===================================================
   ATTACK ON TITAN – ULTIMATE QUIZ  ·  script.js
   =================================================== */

// ─── Questions Database ───────────────────────────
const questionsDB = [
  // ── Easy ──
  {
    q: "Who is revealed to be the Armored Titan?",
    options: ["Bertholdt Hoover", "Reiner Braun", "Zeke Yeager", "Porco Galliard"],
    answer: 1,
    difficulty: "easy"
  },
  {
    q: "What is the name of the outermost wall protecting humanity?",
    options: ["Wall Rose", "Wall Sina", "Wall Maria", "Wall Fritz"],
    answer: 2,
    difficulty: "easy"
  },
  {
    q: "Which wall fell first during the initial Titan attack?",
    options: ["Wall Sina", "Wall Rose", "Wall Maria", "None of them"],
    answer: 2,
    difficulty: "easy"
  },
  {
    q: "What military branch does Eren initially join?",
    options: ["Military Police", "Garrison Regiment", "Survey Corps", "Trainee Corps"],
    answer: 2,
    difficulty: "easy"
  },
  {
    q: "Who is known as 'Humanity's Strongest Soldier'?",
    options: ["Erwin Smith", "Mikasa Ackerman", "Levi Ackerman", "Kenny Ackerman"],
    answer: 2,
    difficulty: "easy"
  },
  // ── Medium ──
  {
    q: "Who killed Sasha Blouse?",
    options: ["Floch Forster", "Gabi Braun", "Zeke Yeager", "Reiner Braun"],
    answer: 1,
    difficulty: "medium"
  },
  {
    q: "What is the name of Erwin Smith's signature strategy?",
    options: ["Thunder Spear Formation", "Long-Range Scouting Formation", "Suicide Charge Protocol", "Wall Defense Protocol"],
    answer: 1,
    difficulty: "medium"
  },
  {
    q: "What is Levi's squad officially known as?",
    options: ["The Ackerman Squad", "Special Operations Squad", "Elite Guard", "Survey Vanguard"],
    answer: 1,
    difficulty: "medium"
  },
  {
    q: "What power does the Founding Titan possess?",
    options: ["Hardening ability", "Control over all Titans", "Regeneration boost", "Infinite stamina"],
    answer: 1,
    difficulty: "medium"
  },
  {
    q: "Who is the Colossal Titan during the Battle of Trost?",
    options: ["Armin Arlert", "Bertholdt Hoover", "Reiner Braun", "Annie Leonhart"],
    answer: 1,
    difficulty: "medium"
  },
  {
    q: "Which clan was persecuted for preserving true history?",
    options: ["Ackerman", "Reiss", "Tybur", "Arlert"],
    answer: 0,
    difficulty: "medium"
  },
  // ── Hard ──
  {
    q: "What is the true name of the world outside the walls?",
    options: ["Eldia", "Marley", "The Outside World", "Paradis"],
    answer: 1,
    difficulty: "hard"
  },
  {
    q: "What is Eren's ultimate goal in the final season?",
    options: ["Destroy all Titans", "Activate the Rumbling to destroy the world", "Become King of Eldia", "Unite Marley and Eldia"],
    answer: 1,
    difficulty: "hard"
  },
  {
    q: "How many years does a Titan shifter have to live after inheriting their power?",
    options: ["10 years", "13 years", "15 years", "20 years"],
    answer: 1,
    difficulty: "hard"
  },
  {
    q: "What is the 'Coordinate' in the context of Attack on Titan?",
    options: ["A location inside Wall Sina", "The power of the Founding Titan", "A military formation", "Eren's Titan form"],
    answer: 1,
    difficulty: "hard"
  },
  {
    q: "Who inherits the Beast Titan after Zeke?",
    options: ["Colt Grice", "Falco Grice", "No one — Zeke retains it", "Eren Yeager"],
    answer: 2,
    difficulty: "hard"
  },
  {
    q: "What is the name of the ideology that the Fritz King imposed using the Founding Titan?",
    options: ["The Vow Renouncing War", "The Peace Doctrine", "The Walls Accord", "The Eldian Oath"],
    answer: 0,
    difficulty: "hard"
  },
  {
    q: "Which character says 'Give up on your dreams and die'?",
    options: ["Erwin Smith", "Levi Ackerman", "Kenny Ackerman", "Hange Zoë"],
    answer: 1,
    difficulty: "hard"
  }
];

// ─── DOM References ───────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const landingScreen  = $("#landingScreen");
const quizScreen     = $("#quizScreen");
const resultScreen   = $("#resultScreen");

const startBtn       = $("#startBtn");
const nextBtn        = $("#nextBtn");
const restartBtn     = $("#restartBtn");
const shareBtn       = $("#shareBtn");
const musicToggle    = $("#musicToggle");

const questionCounter = $("#questionCounter");
const timerRing       = $("#timerRing");
const timerText       = $("#timerText");
const progressBar     = $("#progressBar");
const questionText    = $("#questionText");
const optionsGrid     = $("#optionsGrid");

const resultScore   = $("#resultScore");
const resultPercent = $("#resultPercent");
const resultRank    = $("#resultRank");
const resultMessage = $("#resultMessage");
const badgeEmblem   = $("#badgeEmblem");
const highScoreDisp = $("#highScoreDisplay");
const confettiBox   = $("#confettiContainer");

const slashCanvas = $("#slashCanvas");
const slashCtx    = slashCanvas.getContext("2d");

// ─── State ────────────────────────────────────────
let questions       = [];
let currentIndex    = 0;
let score           = 0;
let selectedDiff    = "easy";
let timerInterval   = null;
let timeLeft        = 30;
let answered        = false;

// Timer durations per difficulty
const TIMER_MAP = { easy: 30, medium: 20, hard: 12 };
const CIRC = 2 * Math.PI * 45; // ≈ 282.74

// ─── Audio (Web Audio API generated tones) ────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
}

function playTone(freq, duration, type = "square", vol = 0.12) {
  ensureAudio();
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function sfxCorrect() {
  playTone(660, 0.15, "sine", 0.15);
  setTimeout(() => playTone(880, 0.2, "sine", 0.12), 100);
}

function sfxWrong() {
  playTone(220, 0.25, "sawtooth", 0.1);
  setTimeout(() => playTone(180, 0.3, "sawtooth", 0.08), 120);
}

function sfxSlash() {
  ensureAudio();
  const bufferSize = audioCtx.sampleRate * 0.08;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  src.buffer = buffer;
  gain.gain.value = 0.08;
  const filter = audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 3000;
  src.connect(filter).connect(gain).connect(audioCtx.destination);
  src.start();
}

// ─── Background Music (simple oscillator drone) ──
let musicPlaying = false;
let musicOsc = null;
let musicGain = null;

function toggleMusic() {
  ensureAudio();
  if (musicPlaying) {
    musicGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    setTimeout(() => { musicOsc.stop(); musicOsc = null; }, 600);
    musicPlaying = false;
    musicToggle.classList.remove("playing");
  } else {
    musicOsc  = audioCtx.createOscillator();
    musicGain = audioCtx.createGain();
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    musicOsc.type = "sine";
    musicOsc.frequency.value = 55; // deep rumble
    lfo.type = "sine";
    lfo.frequency.value = 0.3;
    lfoGain.gain.value = 15;
    lfo.connect(lfoGain).connect(musicOsc.frequency);
    musicGain.gain.value = 0.06;
    musicOsc.connect(musicGain).connect(audioCtx.destination);
    musicOsc.start();
    lfo.start();
    musicPlaying = true;
    musicToggle.classList.add("playing");
  }
}

// ─── Slash / Spark Animation ──────────────────────
function resizeCanvas() {
  slashCanvas.width  = window.innerWidth;
  slashCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function drawSlash(x, y) {
  sfxSlash();
  const sparks = [];
  for (let i = 0; i < 12; i++) {
    sparks.push({
      x, y,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.5) * 14,
      life: 1,
      size: Math.random() * 3 + 1
    });
  }

  // slash line
  const angle = Math.random() * Math.PI;
  const len   = 60 + Math.random() * 40;
  const sx = x - Math.cos(angle) * len / 2;
  const sy = y - Math.sin(angle) * len / 2;
  const ex = x + Math.cos(angle) * len / 2;
  const ey = y + Math.sin(angle) * len / 2;

  let frame = 0;
  const maxFrames = 20;

  function animate() {
    frame++;
    if (frame > maxFrames) return;

    // slash line fade
    const alpha = 1 - frame / maxFrames;
    slashCtx.save();
    slashCtx.globalAlpha = alpha;
    slashCtx.strokeStyle = "#fff";
    slashCtx.lineWidth = 2;
    slashCtx.shadowColor = "#c41e3a";
    slashCtx.shadowBlur = 15;
    slashCtx.beginPath();
    slashCtx.moveTo(sx, sy);
    slashCtx.lineTo(ex, ey);
    slashCtx.stroke();
    slashCtx.restore();

    // sparks
    sparks.forEach((s) => {
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.05;
      if (s.life <= 0) return;
      slashCtx.save();
      slashCtx.globalAlpha = s.life;
      slashCtx.fillStyle = Math.random() > 0.5 ? "#ff4500" : "#ffd700";
      slashCtx.shadowColor = "#ff4500";
      slashCtx.shadowBlur = 8;
      slashCtx.fillRect(s.x, s.y, s.size, s.size);
      slashCtx.restore();
    });

    requestAnimationFrame(animate);
  }

  // clear previous
  slashCtx.clearRect(0, 0, slashCanvas.width, slashCanvas.height);
  animate();
}

// ─── Confetti ─────────────────────────────────────
function launchConfetti() {
  confettiBox.innerHTML = "";
  const colors = ["#c41e3a", "#ff4500", "#c9a84c", "#fff", "#8b0000", "#2e7d32"];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement("div");
    el.classList.add("confetti-piece");
    el.style.left = Math.random() * 100 + "%";
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.width  = Math.random() * 8 + 5 + "px";
    el.style.height = Math.random() * 8 + 5 + "px";
    el.style.animationDuration = (Math.random() * 2 + 2) + "s";
    el.style.animationDelay    = Math.random() * 1.5 + "s";
    el.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
    confettiBox.appendChild(el);
  }
  setTimeout(() => { confettiBox.innerHTML = ""; }, 5000);
}

// ─── Utility ──────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function switchScreen(hide, show) {
  hide.classList.remove("active");
  setTimeout(() => show.classList.add("active"), 50);
}

// ─── Local Storage ────────────────────────────────
function getHighScore() {
  return parseInt(localStorage.getItem("aot_quiz_high") || "0", 10);
}

function setHighScore(val) {
  const prev = getHighScore();
  if (val > prev) localStorage.setItem("aot_quiz_high", val);
}

function showHighScore() {
  const hs = getHighScore();
  highScoreDisp.textContent = hs > 0 ? `High Score: ${hs} / 15` : "";
}

// ─── Quiz Logic ───────────────────────────────────
function buildQuestions() {
  let pool;
  if (selectedDiff === "easy") {
    pool = questionsDB.filter((q) => q.difficulty === "easy" || q.difficulty === "medium");
  } else if (selectedDiff === "medium") {
    pool = questionsDB.filter((q) => q.difficulty === "medium" || q.difficulty === "hard");
  } else {
    pool = [...questionsDB];
  }
  questions = shuffle(pool).slice(0, 15);
  // If pool < 15, fill remaining from the rest
  if (questions.length < 15) {
    const remaining = questionsDB.filter((q) => !questions.includes(q));
    questions = questions.concat(shuffle(remaining).slice(0, 15 - questions.length));
  }
}

function startQuiz() {
  buildQuestions();
  currentIndex = 0;
  score = 0;
  switchScreen(landingScreen, quizScreen);
  loadQuestion();
}

function loadQuestion() {
  answered = false;
  nextBtn.classList.add("hidden");
  const q = questions[currentIndex];

  questionCounter.textContent = `Question ${currentIndex + 1} / ${questions.length}`;
  questionText.textContent = q.q;

  // Progress bar
  const pct = ((currentIndex) / questions.length) * 100;
  progressBar.style.width = pct + "%";
  progressBar.setAttribute("aria-valuenow", Math.round(pct));

  // Options
  const letters = ["A", "B", "C", "D"];
  optionsGrid.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-card";
    btn.setAttribute("role", "listitem");
    btn.setAttribute("aria-label", `Option ${letters[i]}: ${opt}`);
    btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span>${opt}</span>`;
    btn.addEventListener("click", (e) => selectAnswer(i, btn, e));
    optionsGrid.appendChild(btn);
  });

  // Timer
  startTimer();
}

function selectAnswer(index, btn, event) {
  if (answered) return;
  answered = true;
  clearInterval(timerInterval);

  const q = questions[currentIndex];
  const cards = $$(".option-card");

  // Slash effect at click position
  const rect = btn.getBoundingClientRect();
  drawSlash(rect.left + rect.width / 2, rect.top + rect.height / 2);

  if (index === q.answer) {
    btn.classList.add("correct");
    score++;
    sfxCorrect();
  } else {
    btn.classList.add("wrong");
    // Reveal correct
    cards[q.answer].classList.add("reveal-correct");
    sfxWrong();
  }

  // Disable all
  cards.forEach((c) => c.classList.add("disabled"));

  nextBtn.classList.remove("hidden");
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex >= questions.length) {
    showResult();
  } else {
    loadQuestion();
  }
}

// ─── Timer ────────────────────────────────────────
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = TIMER_MAP[selectedDiff];
  const total = timeLeft;
  updateTimerDisplay(total);

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay(total);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function updateTimerDisplay(total) {
  timerText.textContent = timeLeft;
  const offset = CIRC * (1 - timeLeft / total);
  timerRing.style.strokeDashoffset = offset;

  timerRing.classList.remove("warning", "danger");
  if (timeLeft <= 5) {
    timerRing.classList.add("danger");
  } else if (timeLeft <= 10) {
    timerRing.classList.add("warning");
  }
}

function handleTimeout() {
  if (answered) return;
  answered = true;
  const q = questions[currentIndex];
  const cards = $$(".option-card");
  cards.forEach((c) => c.classList.add("disabled"));
  cards[q.answer].classList.add("reveal-correct");
  sfxWrong();
  nextBtn.classList.remove("hidden");
}

// ─── Result ───────────────────────────────────────
function showResult() {
  clearInterval(timerInterval);

  // Final progress bar fill
  progressBar.style.width = "100%";

  switchScreen(quizScreen, resultScreen);

  const total   = questions.length;
  const percent = Math.round((score / total) * 100);

  resultScore.textContent   = `${score} / ${total}`;
  resultPercent.textContent = `${percent}%`;

  // Rank
  let rank, emblem, message;
  if (score <= 5) {
    rank    = "Cadet Level";
    emblem  = "⚔️";
    message = "You still have much to learn, recruit. Get back to training — the Titans won't wait for you to be ready.";
  } else if (score <= 10) {
    rank    = "Scout Regiment";
    emblem  = "🛡️";
    message = "Not bad, soldier. As Commander Erwin would say — advance! The hope of humanity rests on those who keep moving forward.";
  } else if (score <= 13) {
    rank    = "Captain Level";
    emblem  = "🎖️";
    message = "Impressive resolve. You lead with the conviction that makes the difference between victory and defeat.";
  } else {
    rank    = "Ackerman Elite";
    emblem  = "👑";
    message = "Tch. Not bad. You might actually be worth keeping around. — Levi";
  }

  resultRank.textContent    = rank;
  badgeEmblem.textContent   = emblem;
  resultMessage.textContent = message;

  // Save high score
  setHighScore(score);

  // Confetti for 90%+
  if (percent >= 90) {
    setTimeout(launchConfetti, 600);
  }
}

// ─── Restart ──────────────────────────────────────
function restartQuiz() {
  confettiBox.innerHTML = "";
  switchScreen(resultScreen, landingScreen);
  showHighScore();
}

// ─── Share ────────────────────────────────────────
function shareResult() {
  const total   = questions.length;
  const percent = Math.round((score / total) * 100);
  const text    = `⚔️ Attack on Titan Quiz — I scored ${score}/${total} (${percent}%)! Think you can beat me? #AOTQuiz`;

  if (navigator.share) {
    navigator.share({ title: "Attack on Titan Quiz", text }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      shareBtn.querySelector("span").textContent = "Copied!";
      setTimeout(() => { shareBtn.querySelector("span").textContent = "Share Result"; }, 2000);
    });
  }
}

// ─── Event Listeners ──────────────────────────────
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);
shareBtn.addEventListener("click", shareResult);
musicToggle.addEventListener("click", toggleMusic);

// Difficulty buttons
$$(".diff-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".diff-btn").forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
    selectedDiff = btn.dataset.difficulty;
  });
});

// Keyboard support for option cards (delegation)
optionsGrid.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    e.target.closest(".option-card")?.click();
  }
});

// ─── Init ─────────────────────────────────────────
showHighScore();
