import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: { bodyParser: false },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Error parsing form" });

    const filePath = files.file[0].filepath;
    const targetSentence = fields.targetSentence[0];

    // 1️⃣ แปลงเสียงเป็นข้อความ
    const transcript = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "gpt-4o-mini-transcribe",
    });

    // 2️⃣ ให้ AI ให้คะแนน
    const evaluation = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an English pronunciation coach.",
        },
        {
          role: "user",
          content: `Compare this spoken sentence: "${transcript.text}" with the target sentence: "${targetSentence}". 
          Give a pronunciation score (0-100) and short feedback in English.`,
        },
      ],
    });

    const feedback = evaluation.choices[0].message.content;
    const scoreMatch = feedback.match(/\b\d{1,3}\b/);
    const score = scoreMatch ? parseInt(scoreMatch[0]) : "N/A";

    res.status(200).json({ transcript: transcript.text, score, feedback });
  });
}
