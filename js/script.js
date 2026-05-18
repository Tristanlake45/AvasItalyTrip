const startDate = "2026-05-20";
const totalDays = 37;
const testDayIndex = null;
const returnDateRome = "2026-06-26T00:00:00+02:00";

const noteElement = document.getElementById("note");
const dayElement = document.getElementById("dayLabel");
const countdownElement = document.getElementById("countdownTimer");
const revealCard = document.getElementById("revealCard");
const scratchCanvas = document.getElementById("scratchCanvas");
const scratchContext = scratchCanvas.getContext("2d");

let isScratching = false;
let revealed = false;

function getRomeDateString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function getDayIndex() {
  if (testDayIndex !== null) return testDayIndex;

  const todayRome = new Date(getRomeDateString());
  const start = new Date(startDate);
  const diff = todayRome - start;

  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function displayTodaysNote() {
  if (typeof notes === "undefined") {
    dayElement.textContent = "Note loading error";
    noteElement.textContent = "notes.js did not load.";
    return;
  }

  const index = getDayIndex();

  if (index < 0) {
    dayElement.textContent = "Coming soon";

    noteElement.textContent =
      "Your first note unlocks when your Italy adventure begins ❤️";

    revealCard.style.background =
      "linear-gradient(135deg, #7d281f, #5e1d16)";

    scratchCanvas.style.display = "none";

    return;
  }

  if (index >= totalDays) {
    dayElement.textContent = "All notes opened";

    noteElement.textContent =
      "All 37 notes have been opened. I love you ❤️";

    scratchCanvas.style.display = "none";

    return;
  }

  dayElement.textContent = `Day ${index + 1} of ${totalDays}`;

  if (notes[index] && notes[index].message) {
    noteElement.textContent = notes[index].message;
  } else {
    noteElement.textContent = "Today's note has not been added yet.";
  }
}

function setupScratchCard() {
  const rect = revealCard.getBoundingClientRect();

  scratchCanvas.width = rect.width;
  scratchCanvas.height = rect.height;

  scratchContext.globalCompositeOperation = "source-over";
  scratchContext.fillStyle = "#b44b32";
  scratchContext.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

  scratchContext.fillStyle = "rgba(255, 255, 255, 0.2)";
  scratchContext.font = "20px Georgia";
  scratchContext.textAlign = "center";
  scratchContext.fillText(
    "Scratch to reveal",
    scratchCanvas.width / 2,
    scratchCanvas.height / 2
  );

  scratchContext.globalCompositeOperation = "destination-out";
}

function getPointerPosition(event) {
  const rect = scratchCanvas.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function scratch(event) {
  if (!isScratching || revealed) return;

  event.preventDefault();

  const position = getPointerPosition(event);

  scratchContext.beginPath();
  scratchContext.arc(position.x, position.y, 58, 0, Math.PI * 2);
  scratchContext.fill();

  checkScratchProgress();
}

function checkScratchProgress() {
  const imageData = scratchContext.getImageData(
    0,
    0,
    scratchCanvas.width,
    scratchCanvas.height
  );

  const pixels = imageData.data;
  let clearedPixels = 0;

  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] === 0) clearedPixels++;
  }

  const clearedPercent = clearedPixels / (pixels.length / 4);

  if (clearedPercent > 0.1) {
    revealNote();
  }
}

function revealNote() {
  revealed = true;

  revealCard.classList.add("revealed");

  scratchCanvas.style.opacity = "0";
  scratchCanvas.style.pointerEvents = "none";

  setTimeout(() => {
    scratchCanvas.style.display = "none";
  }, 300);
}

function updateCountdown() {
  const now = new Date();
  const target = new Date(returnDateRome);
  const difference = target - now;

  if (difference <= 0) {
    countdownElement.innerHTML = "<p>You're home.</p>";
    return;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  countdownElement.innerHTML = `
    <div class="time-box"><strong>${days}</strong><span>Days</span></div>
    <div class="time-box"><strong>${hours}</strong><span>Hours</span></div>
    <div class="time-box"><strong>${minutes}</strong><span>Minutes</span></div>
    <div class="time-box"><strong>${seconds}</strong><span>Seconds</span></div>
  `;
}

scratchCanvas.addEventListener("pointerdown", (event) => {
  isScratching = true;
  scratch(event);
});

scratchCanvas.addEventListener("pointermove", scratch);

window.addEventListener("pointerup", () => {
  isScratching = false;
});

window.addEventListener("resize", () => {
  if (!revealed) setupScratchCard();
});

displayTodaysNote();

if (getDayIndex() >= 0 && getDayIndex() < totalDays) {
  setupScratchCard();
}

updateCountdown();
setInterval(updateCountdown, 1000);