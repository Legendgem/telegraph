const MORSE_MAP = { ".-":"A","-...":"B","-.-.":"C","-..":"D",".":"E","..-.":"F","--.":"G","....":"H","..":"I",".---":"J","-.-":"K",".-..":"L","--":"M","-.":"N","---":"O",".--.":"P","--.-":"Q",".-.":"R","...":"S","-":"T","..-":"U","...-":"V",".--":"W","-..-":"X","-.--":"Y","--..":"Z","-----":"0",".----":"1","..---":"2","...--":"3","....-":"4",".....":"5","-....":"6","--...":"7","---..":"8","----.":"9" };
let isSender = true, startTime, currentMorse = "", currentWord = "", startX = 0;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone() {
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = 700; gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    osc.start();
    return { stop: () => { gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05); setTimeout(() => osc.stop(), 100); }};
}
let activeTone = null;
const pad = document.getElementById('pad'), morseDisplay = document.getElementById('morse-buffer'), textDisplay = document.getElementById('text-output'), currentTypingSpan = document.getElementById('current-typing');
function handleStart(e) { if(!isSender) return; e.preventDefault(); startTime = Date.now(); startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX; activeTone = playTone(); }
function handleEnd(e) {
    if(!isSender || !startTime) return; e.preventDefault(); if(activeTone) activeTone.stop();
    const endX = e.type.includes('touch') ? e.changedTouches[0].clientX : e.clientX;
    const duration = Date.now() - startTime;
    if(endX - startX > 60) { packageWord(); } else {
        currentMorse += (duration < 300) ? "." : "-"; morseDisplay.innerText = currentMorse;
        clearTimeout(window.decodeTimer);
        window.decodeTimer = setTimeout(() => { if(MORSE_MAP[currentMorse]) { currentWord += MORSE_MAP[currentMorse]; currentTypingSpan.innerText = currentWord; } currentMorse = ""; morseDisplay.innerText = ""; }, 1000);
    }
    startTime = null;
}
function packageWord() { if(currentWord === "") return; const span = document.createElement('span'); span.className = 'word-box'; span.innerText = currentWord; textDisplay.insertBefore(span, currentTypingSpan); currentWord = ""; currentTypingSpan.innerText = ""; }
pad.addEventListener('touchstart', handleStart); pad.addEventListener('touchend', handleEnd); pad.onmousedown = handleStart; pad.onmouseup = handleEnd;
document.getElementById('backspace-btn').onclick = () => { if(currentWord.length > 0) { currentWord = currentWord.slice(0, -1); currentTypingSpan.innerText = currentWord; } else { const boxes = textDisplay.getElementsByClassName('word-box'); if(boxes.length > 0) textDisplay.removeChild(boxes[boxes.length - 1]); }};
document.getElementById('clear-btn').onclick = () => { currentWord = ""; currentTypingSpan.innerText = ""; const boxes = Array.from(textDisplay.getElementsByClassName('word-box')); boxes.forEach(b => b.remove()); };
document.getElementById('guide-toggle').onclick = () => document.getElementById('morse-guide').classList.remove('hidden');
document.getElementById('guide-close').onclick = () => document.getElementById('morse-guide').classList.add('hidden');
