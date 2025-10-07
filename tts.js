// api/tts.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ดึงคีย์จาก Environment Variable
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text input" });
    }

    // สร้างเสียงพูดจากข้อความ
    const response = await client.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy", // เสียงพูด (เปลี่ยนได้ เช่น verse, nova, coral)
      input: text,
    });

    // แปลงเสียงเป็น Buffer แล้วส่งกลับ
    const audioBuffer = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(audioBuffer);

  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: "Failed to generate speech" });
  }
}
