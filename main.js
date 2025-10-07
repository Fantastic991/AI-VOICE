let mediaRecorder;
let audioChunks = [];
const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const resultDiv = document.getElementById("result");
const sentenceInput = document.getElementById("sentence");
const sentenceList = document.getElementById("sentenceList");
const addSentenceBtn = document.getElementById("addSentence");

// บันทึกประโยคใน localStorage
const savedSentences = JSON.parse(localStorage.getItem("sentences")) || [];
updateSentenceList();

addSentenceBtn.addEventListener("click", () => {
  const text = sentenceInput.value.trim();
  if (text) {
    savedSentences.push(text);
    localStorage.setItem("sentences", JSON.stringify(savedSentences));
    updateSentenceList();
  }
});

function updateSentenceList() {
  sentenceList.innerHTML = "";
  savedSentences.forEach((s, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${s}`;
    li.addEventListener("click", () => {
      sentenceInput.value = s;
    });
    sentenceList.appendChild(li);
  });
}

// เริ่มอัดเสียง
recordBtn.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];
  mediaRecorder.start();

  recordBtn.disabled = true;
  stopBtn.disabled = false;
  resultDiv.textContent = "🎧 กำลังอัดเสียง...";

  mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
});

// หยุดอัดเสียง
stopBtn.addEventListener("click", async () => {
  mediaRecorder.stop();
  recordBtn.disabled = false;
  stopBtn.disabled = true;
  resultDiv.textContent = "⏳ กำลังวิเคราะห์เสียง...";

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("file", audioBlob);
    formData.append("targetSentence", sentenceInput.value);

    const res = await fetch("/api/evaluate", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    resultDiv.innerHTML = `
      <p>✅ คะแนนออกเสียงของคุณ: <strong>${data.score}%</strong></p>
      <p>💬 คำแนะนำ: ${data.feedback}</p>
    `;
  };
});
