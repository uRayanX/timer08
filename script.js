let totalSeconds = 0;
let totalDuration = 0;
let interval = null;
let isRunning = false;

const display = document.getElementById('display');
const minutesInput = document.getElementById('minutes');
const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');
const progressRing = document.querySelector('.progress-ring__indicator');
const progressGradient = document.getElementById('progressGradient');
const gradientStops = progressGradient ? progressGradient.querySelectorAll('stop') : null;
const circumference = 2 * Math.PI * 108;
const START_GRADIENT_COLORS = ['#24d8ff', '#36f9f6'];
const END_GRADIENT_COLORS = ['#ff6b6b', '#fdd54f'];

if (progressRing) {
    progressRing.style.strokeDasharray = `${circumference}`;
    progressRing.style.strokeDashoffset = `${circumference}`;
}

function updateDisplay() {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    updateProgress();
}

function updateProgress() {
    if (!progressRing) return;
    if (totalDuration === 0) {
        progressRing.style.strokeDashoffset = `${circumference}`;
        setGradientColors(0);
        return;
    }
    const fraction = totalSeconds / totalDuration;
    const offset = circumference * (1 - Math.max(0, Math.min(1, fraction)));
    progressRing.style.strokeDashoffset = `${offset}`;
    const elapsed = 1 - Math.max(0, Math.min(1, fraction));
    setGradientColors(elapsed);
}

function start() {
    if (!isRunning) {
        if (totalSeconds === 0) {
            const minutes = parseInt(minutesInput.value) || 0;
            if (minutes === 0) return;
            totalSeconds = minutes * 60;
            totalDuration = totalSeconds;
            updateDisplay();
        }
        isRunning = true;
        startBtn.textContent = 'Pause';
        minutesInput.disabled = true;
        interval = setInterval(() => {
            totalSeconds = Math.max(0, totalSeconds - 1);
            updateDisplay();
            if (totalSeconds === 0) {
                clearInterval(interval);
                isRunning = false;
                startBtn.textContent = 'Start';
                minutesInput.disabled = false;
            }
        }, 1000);
    } else {
        isRunning = false;
        startBtn.textContent = 'Start';
        clearInterval(interval);
    }
}

function reset() {
    clearInterval(interval);
    isRunning = false;
    totalSeconds = 0;
    totalDuration = 0;
    startBtn.textContent = 'Start';
    minutesInput.disabled = false;
    minutesInput.value = '';
    updateDisplay();
}

function setGradientColors(progress) {
    if (!gradientStops || gradientStops.length < 2) return;
    const clamped = Math.max(0, Math.min(1, progress));
    const startColor = interpolateHex(START_GRADIENT_COLORS[0], END_GRADIENT_COLORS[0], clamped);
    const endColor = interpolateHex(START_GRADIENT_COLORS[1], END_GRADIENT_COLORS[1], clamped);
    gradientStops[0].setAttribute('stop-color', startColor);
    gradientStops[1].setAttribute('stop-color', endColor);
    if (progressRing) {
        const glow = interpolateRgb(hexToRgb(START_GRADIENT_COLORS[1]), hexToRgb(END_GRADIENT_COLORS[1]), clamped);
        progressRing.style.filter = `drop-shadow(0 0 22px rgba(${glow.r}, ${glow.g}, ${glow.b}, 0.65))`;
    }
}

function hexToRgb(hex) {
    const value = hex.replace('#', '');
    const bigint = parseInt(value, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
}

function interpolateRgb(start, end, t) {
    return {
        r: Math.round(start.r + (end.r - start.r) * t),
        g: Math.round(start.g + (end.g - start.g) * t),
        b: Math.round(start.b + (end.b - start.b) * t),
    };
}

function rgbToHex({ r, g, b }) {
    return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function interpolateHex(startHex, endHex, t) {
    const start = hexToRgb(startHex);
    const end = hexToRgb(endHex);
    return rgbToHex(interpolateRgb(start, end, t));
}

startBtn.addEventListener('click', start);
resetBtn.addEventListener('click', reset);

updateProgress();
