// Janny's Sound API — script.js 
const audio = document.getElementById("audio");
const btnPlay = document.getElementById("btn-play");
const iconPlay = document.getElementById("icon-play");
const iconPause = document.getElementById("icon-pause");
const btnMute = document.getElementById("btn-mute");
const btnLoop = document.getElementById("btn-loop");
const btnSkipBack = document.getElementById("btn-skip-back");
const btnSkipFwd = document.getElementById("btn-skip-fwd");
const volSlider = document.getElementById("vol-slider");
const volLabel = document.getElementById("vol-label");
const progressFill = document.getElementById("progress-fill");
const progressThumb = document.getElementById("progress-thumb");
const progressTrack = document.getElementById("progress-track");
const timeCurrent = document.getElementById("time-current");
const timeTotal = document.getElementById("time-total");
const vinyl = document.getElementById("vinyl");
const waveLg = document.getElementById("wave-lg");
const waveSm = document.getElementById("wave-sm");
const speedChips = document.querySelectorAll(".speed-chip");

// State
let isMuted = false;
let isDragging = false;

// Helpers
function fmt(t) {
  if (isNaN(t) || t == null) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function setProgress(pct) {
  pct = Math.max(0, Math.min(100, pct));
  progressFill.style.width = pct + "%";
  progressThumb.style.left = pct + "%";
}

// On metadata load
audio.addEventListener("loadedmetadata", function () {
  timeTotal.textContent = fmt(audio.duration);
  audio.volume = volSlider.value / 100;
});

// Time update
audio.addEventListener("timeupdate", function () {
  if (!audio.duration || isDragging) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  setProgress(pct);
  timeCurrent.textContent = fmt(audio.currentTime);
});

// Play/Pause audio 
function playAudio() {
  audio.play();
}

function pauseAudio() {
  audio.pause();
}

function togglePlay() {
  audio.paused ? audio.play() : audio.pause();
}

audio.addEventListener("play", function () {
  iconPlay.style.display = "none";
  iconPause.style.display = "block";
  btnPlay.classList.add("playing");
  vinyl.classList.add("playing");
});

audio.addEventListener("pause", function () {
  iconPlay.style.display = "block";
  iconPause.style.display = "none";
  btnPlay.classList.remove("playing");
  vinyl.classList.remove("playing");
});

audio.addEventListener("ended", function () {
  if (!audio.loop) {
    setProgress(0);
    timeCurrent.textContent = "0:00";
  }
});

btnPlay.addEventListener("click", togglePlay);

// Seek: click on progress bar
progressTrack.addEventListener("click", function (e) {
  if (!audio.duration) return;
  const rect = progressTrack.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audio.currentTime = pct * audio.duration;
  setProgress(pct * 100);
});

// Seek: drag on progress bar
progressTrack.addEventListener("mousedown", function (e) {
  isDragging = true;
  seekTo(e);
});

document.addEventListener("mousemove", function (e) {
  if (!isDragging) return;
  seekTo(e);
});

document.addEventListener("mouseup", function () {
  isDragging = false;
});

function seekTo(e) {
  if (!audio.duration) return;
  const rect = progressTrack.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audio.currentTime = pct * audio.duration;
  setProgress(pct * 100);
  timeCurrent.textContent = fmt(audio.currentTime);
}

// Skip
function skip(secs) {
  audio.currentTime = Math.max(
    0,
    Math.min(audio.duration || 0, audio.currentTime + secs),
  );
}

btnSkipBack.addEventListener("click", function () {
  skip(-10);
  flashBtn(this);
});
btnSkipFwd.addEventListener("click", function () {
  skip(10);
  flashBtn(this);
});

// Volume
audio.volume = volSlider.value / 100;

volSlider.addEventListener("input", function () {
  const val = parseInt(this.value);
  audio.volume = val / 100;
  volLabel.textContent = val + "%";

  if (isMuted && val > 0) {
    isMuted = false;
    audio.muted = false;
    btnMute.classList.remove("on");
    btnMute.innerHTML = btnMute.innerHTML.replace("Unmute", "Mute");
    waveLg.style.opacity = "";
    waveSm.style.opacity = "";
  }
});

// Mute
function toggleMute() {
  isMuted = !isMuted;
  audio.muted = isMuted;

  if (isMuted) {
    btnMute.classList.add("on");
    btnMute.lastChild.textContent = " Unmute";
    waveLg.style.opacity = "0.2";
    waveSm.style.opacity = "0.2";
  } else {
    btnMute.classList.remove("on");
    btnMute.lastChild.textContent = " Mute";
    waveLg.style.opacity = "";
    waveSm.style.opacity = "";
  }
}

btnMute.addEventListener("click", toggleMute);

// Loop
function toggleLoop() {
  audio.loop = !audio.loop;
  if (audio.loop) {
    btnLoop.classList.add("on");
    btnLoop.lastChild.textContent = " Loop: on";
  } else {
    btnLoop.classList.remove("on");
    btnLoop.lastChild.textContent = " Loop";
  }
}

btnLoop.addEventListener("click", toggleLoop);

// Speed
speedChips.forEach(function (chip) {
  chip.addEventListener("click", function () {
    speedChips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    audio.playbackRate = parseFloat(chip.dataset.speed);
  });
});

// Button flash helper (for skip buttons)
function flashBtn(btn) {
  btn.classList.add("pressed");
  setTimeout(() => btn.classList.remove("pressed"), 200);
}

// Keyboard controls
document.addEventListener("keydown", function (e) {
  if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;

  switch (e.key) {
    case " ":
      e.preventDefault();
      togglePlay();
      break;
    case "ArrowLeft":
      e.preventDefault();
      skip(-10);
      flashBtn(btnSkipBack);
      break;
    case "ArrowRight":
      e.preventDefault();
      skip(10);
      flashBtn(btnSkipFwd);
      break;
    case "ArrowUp":
      e.preventDefault();
      volSlider.value = Math.min(100, parseInt(volSlider.value) + 5);
      volSlider.dispatchEvent(new Event("input"));
      break;
    case "ArrowDown":
      e.preventDefault();
      volSlider.value = Math.max(0, parseInt(volSlider.value) - 5);
      volSlider.dispatchEvent(new Event("input"));
      break;
    case "m":
    case "M":
      toggleMute();
      break;
    case "l":
    case "L":
      toggleLoop();
      break;
  }
});

// Expose baseline functions so onclick="" attributes also work
function setVolume(value) {
  audio.volume = value;
}
function setSpeed(value) {
  audio.playbackRate = value;
}
