import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";

export const config = { api: { bodyParser: false } };

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload failed" });

    const audioFile = fs.createReadStream(files.audio[0].filepath);
    const text = fields.text[0];

    try {
      // 🔹 แปลงเสียงพูดเป็นข้อความ
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "gpt-4o-mini-transcribe",
      });

      const spokenText = transcription.text;

      // 🔹 ให้คะแนนเสียงพูดเทียบกับประโยคต้นฉบับ
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a pronunciation scoring assistant.",
          },
          {
            role: "user",
            content: `Target sentence: "${text}". User said: "${spokenText}". Give a score (0-100).`,
          },
        ],
      });

      const score = completion.choices[0].message.content.match(/\d+/)?.[0] || "0";
      res.status(200).json({ score });
    } catch (error) {
      console.error("Evaluation error:", error);
      res.status(500).json({ error: error.message });
    }
  });
}
