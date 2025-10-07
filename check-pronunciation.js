// ✅ บังคับใช้ Node.js runtime สำหรับ API route
export const config = {
  runtime: "nodejs",
};

import OpenAI from "openai";

// ✅ สร้าง client สำหรับเรียก API ของ OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ต้องตั้งค่าใน Environment Variables ของ Vercel
});

export default async function handler(req, res) {
  // ✅ ตรวจสอบว่าเป็น POST หรือไม่
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { file, reference } = req.body;

    if (!file || !reference) {
      return res.status(400).json({ error: "Missing audio or reference text" });
    }

    // ✅ แปลงไฟล์เสียงจาก Base64 เป็น Buffer
    const audioBuffer = Buffer.from(file, "base64");

    // ✅ เรียกใช้งาน GPT-4o-mini เพื่อประเมินเสียง
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      modalities: ["text", "audio"], // ต้องใส่ เพื่อให้ model เข้าใจเสียง
      messages: [
        {
          role: "system",
          content: "You are an English pronunciation evaluation assistant.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please listen to the following audio and rate how closely it matches the sentence: "${reference}". 
Give a pronunciation score from 0–100 and a short feedback (1–2 sentences).`,
            },
            {
              type: "input_audio",
              audio: audioBuffer.toString("base64"),
            },
          ],
        },
      ],
    });

    // ✅ ส่งผลลัพธ์กลับไปยัง frontend
    const result = response.choices[0]?.message?.content || "No result received.";
    res.status(200).json({ result });
  } catch (error) {
    console.error("❌ Error in pronunciation API:", error);
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}
