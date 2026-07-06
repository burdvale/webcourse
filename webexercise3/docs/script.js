const animals = [
  {
    name: "lion",
    key: "a",
    audioPath: "assets/audio/lion.mp3",
    label: "Lion",
  },
  {
    name: "elephant",
    key: "s",
    audioPath: "assets/audio/elephant.mp3",
    label: "Elephant",
  },
  {
    name: "monkey",
    key: "d",
    audioPath: "assets/audio/monkey.mp3",
    label: "Monkey",
  },
  {
    name: "bird",
    key: "f",
    audioPath: "assets/audio/bird.mp3",
    label: "Bird",
  },
  {
    name: "frog",
    key: "g",
    audioPath: "assets/audio/frog.mp3",
    label: "Frog",
  },
  {
    name: "wolf",
    key: "h",
    audioPath: "assets/audio/wolf.mp3",
    label: "Wolf",
  },
  {
    name: "dolphin",
    key: "j",
    audioPath: "assets/audio/dolphin.mp3",
    label: "Dolphin",
  },
  {
    name: "tiger",
    key: "k",
    audioPath: "assets/audio/tiger.mp3",
    label: "Tiger",
  },
];

const cards = Array.from(document.querySelectorAll(".animal-card"));
const overlay = document.getElementById("music-overlay");
const unlockButton = document.getElementById("unlock-music");
const musicToggle = document.getElementById("music-toggle");
const muteBtn = document.getElementById("mute-btn");
const shuffleButton = document.getElementById("shuffle-btn");
const audioElement = document.getElementById("bg-audio");

let audioContext;
let masterGain;
let musicLoopId;
let musicActive = false;
let currentAnimalAudio = null;
let animalAudioTimeout = null;

function ensureAudioContext() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.04;
    masterGain.connect(audioContext.destination);
  }

  if (audioContext.state === "suspended") {
    return audioContext.resume();
  }

  return Promise.resolve();
}

function flashCard(animalName) {
  const target = cards.find((card) => card.dataset.animal === animalName);
  if (!target) return;

  target.classList.remove("active");
  void target.offsetWidth;
  target.classList.add("active");
  window.setTimeout(() => target.classList.remove("active"), 350);
}

function playAnimalSound(animal) {
  // Stop any currently playing animal sound
  if (currentAnimalAudio) {
    currentAnimalAudio.pause();
    currentAnimalAudio = null;
  }

  // Clear any pending timeout
  if (animalAudioTimeout) {
    window.clearTimeout(animalAudioTimeout);
    animalAudioTimeout = null;
  }

  // Create and play new animal sound
  const audio = new Audio(animal.audioPath);
  currentAnimalAudio = audio;

  audio.play().catch((error) => {
    console.warn(`Could not play sound for ${animal.name}:`, error);
  });

  // Stop the sound after 5 seconds
  animalAudioTimeout = window.setTimeout(() => {
    if (currentAnimalAudio === audio) {
      audio.pause();
      currentAnimalAudio = null;
    }
    animalAudioTimeout = null;
  }, 5000);

  flashCard(animal.name);
}

// זהו המאפיין המתקדם: Web Audio API מנצל אודיו בזמן אמת, מאפשר לנגן צלילים דינמיים עם panning ו-gain בלי להסתמך על קבצי שמע חיצוניים.
function startBackgroundMusic() {
  if (musicActive) return;

  musicActive = true;
  audioElement.src = "assets/audio/jungle.mp3";
  audioElement.muted = false;
  audioElement.play().catch((error) => {
    console.warn(
      "Autoplay blocked, music will start on user interaction:",
      error,
    );
  });
  overlay.classList.add("is-hidden");
}

function stopBackgroundMusic() {
  musicActive = false;
  if (musicLoopId) {
    window.clearTimeout(musicLoopId);
    musicLoopId = undefined;
  }
  audioElement.muted = true;
  audioElement.pause();
  overlay.classList.remove("is-hidden");
}

cards.forEach((card) => {
  const animal = animals.find((entry) => entry.name === card.dataset.animal);
  if (!animal) return;

  card.addEventListener("click", () => playAnimalSound(animal));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      playAnimalSound(animal);
    }
  });
});

document.addEventListener("keydown", (event) => {
  const matchedAnimal = animals.find(
    (animal) => animal.key === event.key.toLowerCase(),
  );
  if (!matchedAnimal) return;

  event.preventDefault();
  playAnimalSound(matchedAnimal);
});

unlockButton.addEventListener("click", startBackgroundMusic);
musicToggle.addEventListener("click", () => {
  if (musicActive) {
    stopBackgroundMusic();
    musicToggle.textContent = "Start Jungle Music";
  } else {
    startBackgroundMusic();
    musicToggle.textContent = "Pause Jungle Music";
  }
});

shuffleButton.addEventListener("click", () => {
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  playAnimalSound(randomAnimal);
});

muteBtn.addEventListener("click", () => {
  if (audioElement.muted) {
    audioElement.muted = false;
    muteBtn.textContent = "Mute Jungle";
  } else {
    audioElement.muted = true;
    muteBtn.textContent = "Unmute Jungle";
  }
});

window.addEventListener("load", () => {
  // Overlay will show, waiting for user interaction
  overlay.classList.remove("is-hidden");
});
