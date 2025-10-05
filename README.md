<!DOCTYPE html>
<html>
<head>
<title>AI Pronunciation Test</title>
</head>
<body>
<h1>🎙️ Pronunciation Practice</h1>
<p>Say this sentence: <b>My favorite country is South Korea</b></p>
<button id="recordButton">🎧 Start Recording</button>
<p id="status"></p>
<p id="result"></p>

<!-- เสียงแจ้งเตือนเริ่มและหยุด -->
<audio id="startBeep" src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg"></audio>
<audio id="stopBeep" src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg"></audio>

<script>
const recordButton = document.getElementById('recordButton');
const status = document.getElementById('status');
const result = document.getElementById('result');
const startBeep = document.getElementById('startBeep');
const stopBeep = document.getElementById('stopBeep');

let recorder;
let chunks = [];

recordButton.addEventListener('click', async () => {
if (!recorder || recorder.state === 'inactive') {
// 🔊 เสียงเริ่มอัด
startBeep.play();
status.textContent = "🎙️ Recording... please speak now.";
result.textContent = "";

const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
recorder = new MediaRecorder(stream);
chunks = [];

recorder.ondataavailable = e => chunks.push(e.data);
recorder.onstop = async () => {
// 🔊 เสียงหยุดอัด
stopBeep.play();
status.textContent = "⏳ Analyzing your voice...";

const audioBlob = new Blob(chunks, { type: 'audio/webm' });
const formData = new FormData();
formData.append('file', audioBlob);

// ส่งไฟล์เสียงไปยัง API
const response = await fetch('/api/check-pronunciation', {
method: 'POST',
body: formData
});

const data = await response.json();
result.textContent = `Your pronunciation score: ${data.score}/100 🎯`;
status.textContent = "";
};

recorder.start();
recordButton.textContent = "🛑 Stop Recording";
} else {
recorder.stop();
recordButton.textContent = "🎧 Start Recording";
status.textContent = "Processing your voice...";
}
});
</script>
</body>
</html>
