// ✅ ฟังก์ชันแปลง blob → base64
function toBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

let mediaRecorder;
let audioChunks = [];

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const playback = document.getElementById("playback");
const scoreDiv = document.getElementById("score");

startBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;

    scoreDiv.textContent = "🎙️ Recording...";

    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
  } catch (err) {
    alert("กรุณาอนุญาตให้ใช้ไมโครโฟน");
    console.error(err);
  }
};

stopBtn.onclick = async () => {
  mediaRecorder.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;

  mediaRecorder.onstop = async () => {
    const blob = new Blob(audioChunks, { type: "audio/webm" });
    playback.src = URL.createObjectURL(blob);

    const base64 = await toBase64(blob);
    const base64Data = base64.split(",")[1];

    try {
      const resp = await fetch("/api/check-pronunciation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: base64Data,
          reference: "Hello world"
        })
      });
      const j = await resp.json();
      if (resp.ok) {
        scoreDiv.innerHTML = `✅ ${j.result}`;
      } else {
        scoreDiv.innerHTML = `❌ Error: ${j.error}`;
      }
    } catch (err) {
      console.error("Fetch API error:", err);
      scoreDiv.innerHTML = `❌ Fetch failed: ${err.message}`;
    }
  };
};
