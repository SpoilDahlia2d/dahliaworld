/* CONFIG */
const CONFIG = {
    passcode: "DAHLIA",
    bsodLimit: 30, // How many windows before crash
    spawnSpeedConfig: {
        start: 1000,
        min: 100,
        decay: 50 // ms reduced per spawn
    },
    folderMap: {
        'ass': {
            imgCount: 10, imgPrefix: 'img/ass/',
            vidCount: 2, vidPrefix: 'img/ass/v' // v1.mp4, v2.mp4
        },
        'feet': {
            imgCount: 10, imgPrefix: 'img/feet/',
            vidCount: 2, vidPrefix: 'img/feet/v'
        },
        'tits': {
            imgCount: 10, imgPrefix: 'img/tits/',
            vidCount: 2, vidPrefix: 'img/tits/v'
        }
    }
};

/* STATE */
let state = {
    activeCategory: null,
    windowCount: 0,
    spawnInterval: null,
    currentSpeed: CONFIG.spawnSpeedConfig.start
};

/* ELEMENTS */
const gateScreen = document.getElementById('gate-screen');
const desktopScreen = document.getElementById('desktop-screen');
const virusLayer = document.getElementById('virus-layer');
const bsodScreen = document.getElementById('bsod-screen');
const codeInput = document.getElementById('access-code');
const errorMsg = document.getElementById('error-msg');
const audio = document.getElementById('bg-audio');
const errAudio = document.getElementById('error-audio');

/* GATE LOGIC */
document.getElementById('enter-btn').addEventListener('click', checkCode);
codeInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkCode(); });

function checkCode() {
    if (codeInput.value.toUpperCase() === CONFIG.passcode) {
        // Unlock
        gateScreen.classList.remove('active');
        gateScreen.classList.add('hidden');
        desktopScreen.classList.remove('hidden');

        // Start Audio Looped
        if (audio) audio.play().catch(e => { });

        startClock();
    } else {
        // Fail
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 2000);
        codeInput.value = "";
    }
}

function startClock() {
    const clock = document.getElementById('clock');
    setInterval(() => {
        const d = new Date();
        clock.innerText = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, 1000);
}

/* VIRUS LOGIC */
window.startVirus = function (category) {
    if (state.activeCategory) return; // Already running
    state.activeCategory = category;

    // Switch Audio to Category Specific
    if (audio) {
        audio.pause();
        audio.src = `${category}.mp3`; // ass.mp3, feet.mp3, tits.mp3
        audio.load();
        audio.play().catch(e => console.log("Audio play failed", e));
    }

    // Initial Spawn
    spawnWindow();

    // Start Loop
    spawnLoop();
};

function spawnLoop() {
    if (state.windowCount >= CONFIG.bsodLimit) {
        triggerBSOD();
        return;
    }

    state.spawnInterval = setTimeout(() => {
        spawnWindow();

        // Ecponential Speedup
        state.currentSpeed = Math.max(CONFIG.spawnSpeedConfig.min, state.currentSpeed - CONFIG.spawnSpeedConfig.decay);

        spawnLoop();
    }, state.currentSpeed);
}

function spawnWindow() {
    state.windowCount++;

    // Play Error Sound
    if (errAudio) {
        errAudio.currentTime = 0;
        errAudio.play().catch(e => { });
    }

    // Create Element
    const win = document.createElement('div');
    win.className = 'win-window';

    // Random Position
    const x = Math.random() * (window.innerWidth - 200);
    const y = Math.random() * (window.innerHeight - 200);
    win.style.left = x + 'px';
    win.style.top = y + 'px';
    win.style.zIndex = 500 + state.windowCount;

    // Content Selection (Image vs Video)
    const catData = CONFIG.folderMap[state.activeCategory];
    const isVideo = Math.random() > 0.7; // 30% chance of video

    let contentHTML = '';

    if (isVideo && catData.vidCount > 0) {
        const vidIndex = Math.ceil(Math.random() * catData.vidCount);
        const vidSrc = `${catData.vidPrefix}${vidIndex}.mp4`;
        contentHTML = `<video src="${vidSrc}" autoplay loop muted playsinline style="width:100%; height:auto; display:block;"></video>`;
    } else {
        const imgIndex = Math.ceil(Math.random() * catData.imgCount);
        const imgSrc = `${catData.imgPrefix}${imgIndex}.jpg`;
        // Fallback or Placeholder handled by onerror mainly
        contentHTML = `<img src="${imgSrc}" onerror="this.src='https://via.placeholder.com/200x200/ff00ff/000000?text=DAHLIA_VIRUS'">`;
    }

    // Inner HTML
    win.innerHTML = `
        <div class="win-titlebar">
            <span>Critical_Error_${state.windowCount}.dll</span>
            <span>X</span>
        </div>
        <div class="win-content">
            ${contentHTML}
            <div style="color:red; font-weight:bold; text-align:center; margin-top:5px;">PAY OR DIE</div>
        </div>
    `;

    virusLayer.appendChild(win);
}

function triggerBSOD() {
    clearTimeout(state.spawnInterval);
    bsodScreen.classList.remove('hidden');
    bsodScreen.classList.add('active');
    // Stop ambient music? Or make it scarier?
    // audio.playbackRate = 0.5;
}
