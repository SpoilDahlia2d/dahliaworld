/* CONFIG */
const CONFIG = {
    passcode: "DAHLIA", // Code to enter the Lobby
    maxItems: 99999, // Infinite
    spawnInterval: 2000,

    // Words to spam
    textSpams: ["OBEY", "LICK", "RELAPSE", "ADDICTION", "WORSHIP", "MINE"],

    // Category Configuration
    folderMap: {
        'ass': {
            code: "ASS123",
            imgCount: 10, imgPrefix: 'img/ass/',
            vidCount: 3, vidPrefix: 'img/ass/v'
        },
        'feet': {
            code: "FEET123",
            imgCount: 10, imgPrefix: 'img/feet/',
            vidCount: 4, vidPrefix: 'img/feet/v'
        },
        'tits': {
            code: "TITS123",
            imgCount: 10, imgPrefix: 'img/tits/',
            vidCount: 4, vidPrefix: 'img/tits/v'
        }
    }
};

/* STATE */
let state = {
    activeCategory: null,
    windowCount: 0,
    spawnTimer: null,
    pendingCategory: null // Used during unlock process
};

/* ELEMENTS */
const gateScreen = document.getElementById('gate-screen');
const desktopScreen = document.getElementById('desktop-screen');
const lockScreen = document.getElementById('lock-screen');
const categoryScreen = document.getElementById('category-screen');
const virusLayer = document.getElementById('virus-layer');

const codeInput = document.getElementById('access-code');
const catCodeInput = document.getElementById('cat-code-input');
const errorMsg = document.getElementById('error-msg');
const lockError = document.getElementById('lock-error');

const audio = document.getElementById('bg-audio');
const errAudio = document.getElementById('error-audio');

/* 1. MAIN GATE LOGIC */
document.getElementById('enter-btn').addEventListener('click', checkMainCode);
codeInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkMainCode(); });

function checkMainCode() {
    if (codeInput.value.toUpperCase() === CONFIG.passcode) {
        gateScreen.classList.remove('active');
        gateScreen.classList.add('hidden');
        desktopScreen.classList.remove('hidden');

        if (audio) {
            audio.src = 'audio.mp3';
            audio.play().catch(e => { });
        }
    } else {
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 2000);
        codeInput.value = "";
    }
}

/* 2. CATEGORY LOCK LOGIC */
window.openCategoryLock = function (category) {
    state.pendingCategory = category;

    // Show Lock Screen
    desktopScreen.classList.add('hidden');
    lockScreen.classList.remove('hidden');
    lockScreen.classList.add('active');

    document.getElementById('lock-title').innerText = category.toUpperCase() + " LOCKED";
    catCodeInput.value = "";
    catCodeInput.focus();
}

window.closeLockScreen = function () {
    // Return to Desktop
    lockScreen.classList.add('hidden');
    lockScreen.classList.remove('active');
    desktopScreen.classList.remove('hidden');
    state.pendingCategory = null;
}

document.getElementById('unlock-cat-btn').addEventListener('click', checkCategoryCode);
catCodeInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkCategoryCode(); });

function checkCategoryCode() {
    const targetCode = CONFIG.folderMap[state.pendingCategory].code;

    if (catCodeInput.value.toUpperCase() === targetCode) {
        // SUCCESS -> Start Virus
        startVirus(state.pendingCategory);
    } else {
        lockError.classList.remove('hidden');
        setTimeout(() => lockError.classList.add('hidden'), 2000);
    }
}

/* 3. INFINITE VIRUS LOGIC */
function startVirus(category) {
    state.activeCategory = category;

    // Hide Lock/Desktop
    lockScreen.classList.add('hidden');
    lockScreen.classList.remove('active');
    desktopScreen.classList.add('hidden');

    // Show Virus Stage
    categoryScreen.classList.remove('hidden');
    categoryScreen.classList.add('active');
    virusLayer.classList.remove('hidden');

    document.getElementById('cat-live-title').innerText = category.toUpperCase();

    // Switch Audio
    if (audio) {
        audio.pause();
        audio.src = `${category}.mp3`;
        audio.load();
        audio.play().catch(e => { });
    }

    // Start Infinite Loop
    setTimeout(spawnLoop, 1000);
}

function spawnLoop() {
    // Infinite: No check for maxItems

    try {
        spawnWindow();
    } catch (e) {
        console.error(e);
    }

    state.spawnTimer = setTimeout(spawnLoop, CONFIG.spawnInterval);
}

function spawnWindow() {
    state.windowCount++;
    if (errAudio) { errAudio.currentTime = 0; errAudio.play().catch(e => { }); }

    const win = document.createElement('div');
    win.className = 'virus-popup';

    const maxX = window.innerWidth - 300;
    const maxY = window.innerHeight - 300;
    win.style.left = Math.max(0, Math.random() * maxX) + 'px';
    win.style.top = Math.max(0, Math.random() * maxY) + 'px';
    win.style.zIndex = 500 + state.windowCount;

    // DECIDE CONTENT TYPE: Image, Video, or TEXT?
    const rand = Math.random();
    const catData = CONFIG.folderMap[state.activeCategory];

    if (rand > 0.8) {
        // 20% Chance: TEXT SPAM
        const word = CONFIG.textSpams[Math.floor(Math.random() * CONFIG.textSpams.length)];
        win.classList.add('text-popup');
        win.innerHTML = `<span>${word}</span>`;
        // Text popups might need different styling (handled in CSS via .text-popup)
    }
    else if (rand > 0.6 && catData.vidCount > 0) {
        // 20% Chance: VIDEO
        const vidIndex = Math.ceil(Math.random() * catData.vidCount);
        win.innerHTML = `<video src="${catData.vidPrefix}${vidIndex}.mp4" autoplay loop muted playsinline></video>
                         <div class="virus-label">FOREVER</div>`;
    }
    else {
        // 60% Chance: IMAGE
        const imgIndex = Math.ceil(Math.random() * catData.imgCount);
        win.innerHTML = `<img src="${catData.imgPrefix}${imgIndex}.jpg" onerror="this.src='https://via.placeholder.com/300x400/bd00ff/ffffff?text=${state.activeCategory}'">
                         <div class="virus-label">FOREVER</div>`;
    }

    virusLayer.appendChild(win);
}
