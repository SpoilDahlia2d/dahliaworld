/* CONFIG */
const CONFIG = {
    passcode: "DAHLIA",
    maxItems: 30, // 30 items * 2 seconds = 60 seconds (1 minute)
    spawnInterval: 2000, // Fixed 2 seconds

    // Category Configuration
    folderMap: {
        'ass': {
            code: "ASS123", // CODE TO UNLOCK ASS
            imgCount: 10, imgPrefix: 'img/ass/',
            vidCount: 2, vidPrefix: 'img/ass/v'
        },
        'feet': {
            code: "FEET123", // CODE TO UNLOCK FEET
            imgCount: 10, imgPrefix: 'img/feet/',
            vidCount: 2, vidPrefix: 'img/feet/v'
        },
        'tits': {
            code: "TITS123", // CODE TO UNLOCK TITS
            imgCount: 10, imgPrefix: 'img/tits/',
            vidCount: 2, vidPrefix: 'img/tits/v'
        }
    }
};

/* STATE */
let state = {
    activeCategory: null,
    windowCount: 0,
    spawnTimer: null,
    isLocked: false
};

/* ELEMENTS */
const gateScreen = document.getElementById('gate-screen');
const desktopScreen = document.getElementById('desktop-screen');
const categoryScreen = document.getElementById('category-screen');
const virusLayer = document.getElementById('virus-layer');
const bsodScreen = document.getElementById('bsod-screen');
const codeInput = document.getElementById('access-code');
const unlockInput = document.getElementById('unlock-category-input');
const errorMsg = document.getElementById('error-msg');
const unlockMsg = document.getElementById('unlock-msg');
const audio = document.getElementById('bg-audio');
const errAudio = document.getElementById('error-audio');

/* GATE LOGIC */
document.getElementById('enter-btn').addEventListener('click', checkCode);
codeInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkCode(); });

function checkCode() {
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

/* VIRUS LOGIC */
window.enterCategory = function (category) {
    if (state.activeCategory && !state.isLocked) return;

    state.activeCategory = category;
    state.windowCount = 0;
    state.isLocked = false;

    // Screens
    desktopScreen.classList.add('hidden');
    bsodScreen.classList.add('hidden'); // Ensure paywall is gone on restart
    bsodScreen.classList.remove('active');

    categoryScreen.classList.remove('hidden');
    categoryScreen.classList.add('active');
    virusLayer.innerHTML = ''; // Clear previous windows
    virusLayer.classList.remove('hidden');

    document.getElementById('cat-title').innerText = category.toUpperCase();

    // Audio
    if (audio) {
        audio.pause();
        audio.src = `${category}.mp3`;
        audio.load();
        audio.play().catch(e => { });
    }

    // Start Loop
    setTimeout(spawnLoop, 1000);
}

function spawnLoop() {
    if (state.windowCount >= CONFIG.maxItems) {
        triggerPaywall();
        return;
    }

    // Spawn Window
    spawnWindow();

    // Schedule next
    state.spawnTimer = setTimeout(spawnLoop, CONFIG.spawnInterval);
}

function spawnWindow() {
    state.windowCount++;
    if (errAudio) { errAudio.currentTime = 0; errAudio.play().catch(e => { }); }

    const win = document.createElement('div');
    win.className = 'virus-popup';

    const maxX = window.innerWidth - 320;
    const maxY = window.innerHeight - 300;
    win.style.left = Math.max(0, Math.random() * maxX) + 'px';
    win.style.top = Math.max(0, Math.random() * maxY) + 'px';
    win.style.zIndex = 500 + state.windowCount;

    const catData = CONFIG.folderMap[state.activeCategory];
    const isVideo = Math.random() > 0.7;
    let contentHTML = '';

    if (isVideo && catData.vidCount > 0) {
        const vidIndex = Math.ceil(Math.random() * catData.vidCount);
        contentHTML = `<video src="${catData.vidPrefix}${vidIndex}.mp4" autoplay loop muted playsinline></video>`;
    } else {
        const imgIndex = Math.ceil(Math.random() * catData.imgCount);
        contentHTML = `<img src="${catData.imgPrefix}${imgIndex}.jpg" onerror="this.src='https://via.placeholder.com/300x400/bd00ff/ffffff?text=${state.activeCategory.toUpperCase()}'">`;
    }

    win.innerHTML = `${contentHTML}<div class="virus-label">PAY TO STOP</div>`;
    virusLayer.appendChild(win);
}

function triggerPaywall() {
    clearTimeout(state.spawnTimer);
    state.isLocked = true;

    // Hide virus layer to clean up? User said "reset and restart", so maybe we hide the clutter
    virusLayer.classList.add('hidden');
    categoryScreen.classList.add('hidden');

    bsodScreen.classList.remove('hidden');
    bsodScreen.classList.add('active');
}

/* UNLOCK LOGIC */
window.checkUnlockCode = function () {
    const input = unlockInput.value.trim().toUpperCase();
    const targetCode = CONFIG.folderMap[state.activeCategory].code;

    if (input === targetCode) {
        // Correct! Reset.
        unlockInput.value = "";
        unlockMsg.classList.add('hidden');

        // Re-enter the category (Restarts flow)
        enterCategory(state.activeCategory);
    } else {
        unlockMsg.classList.remove('hidden');
        setTimeout(() => unlockMsg.classList.add('hidden'), 2000);
    }
}
