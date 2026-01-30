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
const categoryScreen = document.getElementById('category-screen'); // NEW
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

        // Start Ambient Audio
        if (audio) {
            audio.src = 'audio.mp3';
            audio.play().catch(e => { });
        }
    } else {
        // Fail
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 2000);
        codeInput.value = "";
    }
}

/* VIRUS LOGIC */

// Step 1: User Selects Category -> Enter the "Room"
window.enterCategory = function (category) {
    if (state.activeCategory) return;
    state.activeCategory = category;

    // UI Transition
    desktopScreen.classList.add('hidden');
    categoryScreen.classList.remove('hidden');
    categoryScreen.classList.add('active');

    // Update Title
    document.getElementById('cat-title').innerText = category.toUpperCase() + " EXTRACTION";

    // Switch Audio
    if (audio) {
        audio.pause();
        audio.src = `${category}.mp3`; // ass.mp3, feet.mp3 etc
        audio.load();
        audio.play().catch(e => console.log("Audio switch failed", e));
    }

    // Delay slight for dramatic effect before virus starts
    setTimeout(() => {
        spawnWindow(); // First one
        spawnLoop();   // Start avalanche
    }, 1000);
}

function spawnLoop() {
    if (state.windowCount >= CONFIG.bsodLimit) {
        triggerBSOD();
        return;
    }

    state.spawnInterval = setTimeout(() => {
        try {
            spawnWindow();
        } catch (err) {
            console.error("Spawn error:", err);
        }

        // Ecponential Speedup
        state.currentSpeed = Math.max(CONFIG.spawnSpeedConfig.min, state.currentSpeed - CONFIG.spawnSpeedConfig.decay);

        spawnLoop(); // Recursive call ensures loop continues even if visual fails
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
    win.className = 'virus-popup';

    // Random Position
    const maxX = window.innerWidth - 320;
    const maxY = window.innerHeight - 300;
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    win.style.left = Math.max(0, x) + 'px';
    win.style.top = Math.max(0, y) + 'px';
    win.style.zIndex = 500 + state.windowCount;

    // Content Selection
    const catData = CONFIG.folderMap[state.activeCategory];
    // Safety check
    if (!catData) {
        console.error("Missing config for category:", state.activeCategory);
        win.innerText = "DATA MISSING";
        virusLayer.appendChild(win);
        return;
    }

    const isVideo = Math.random() > 0.7; // 30% chance of video
    let contentHTML = '';

    if (isVideo && catData.vidCount > 0) {
        const vidIndex = Math.ceil(Math.random() * catData.vidCount);
        const vidSrc = `${catData.vidPrefix}${vidIndex}.mp4`;
        contentHTML = `<video src="${vidSrc}" autoplay loop muted playsinline></video>`;
    } else {
        const imgIndex = Math.ceil(Math.random() * catData.imgCount);
        const imgSrc = `${catData.imgPrefix}${imgIndex}.jpg`;
        // Fallback or Placeholder handled by onerror
        contentHTML = `<img src="${imgSrc}" onerror="this.src='https://via.placeholder.com/300x400/bd00ff/ffffff?text=UPLOADING...'">`;
    }

    // Inner HTML
    win.innerHTML = `
        ${contentHTML}
        <div class="virus-label">PAY TO STOP</div>
    `;

    virusLayer.appendChild(win);
}

function triggerBSOD() {
    clearTimeout(state.spawnInterval);

    // Hide everything else
    categoryScreen.classList.add('hidden');
    virusLayer.classList.add('hidden'); // Optional: hide the chaos to focus on BSOD

    bsodScreen.classList.remove('hidden');
    bsodScreen.classList.add('active');
}
