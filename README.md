
Fantastic Center <fantasticcenter@gmail.com>
20:36 (0 นาทีที่ผ่านมา)
ถึง ฉัน

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

<script>
const recordButton = document.getElementById('recordButton');
const status = document.getElementById('status');
const result = document.getElementById('result');

let recorder;
let chunks = [];

recordButton.addEventListener('click', async () => {
if (!recorder || recorder.state === 'inactive') {
// เริ่มบันทึกเสียง
status.textContent = "🎙️ Recording... please speak now.";
result.textContent = "";
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
recorder = new MediaRecorder(stream);
chunks = [];

recorder.ondataavailable = e => chunks.push(e.data);
recorder.onstop = async () => {
status.textContent = "⏳ Analyzing your voice...";
const audioBlob = new Blob(chunks, { type: 'audio/webm' });
const formData = new FormData();
formData.append('file', audioBlob);

// ส่งไฟล์ไปยัง API
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
// หยุดบันทึกเสียง
recorder.stop();
recordButton.textContent = "🎧 Start Recording";
status.textContent = "Processing your voice...";
}
});
</script>
</body>
</html>
