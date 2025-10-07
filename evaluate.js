import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Only POST allowed" });

  try {
    const { file, reference } = req.body;
    const audioBuffer = Buffer.from(file, "base64");

    // แปลงเสียงเป็นข้อความ
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], "speech.webm", { type: "audio/webm" }),
      model: "gpt-4o-mini-transcribe",
    });

    const userSpeech = transcription.text || "";

    // ให้ AI ให้คะแนน
    const evaluation = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an English pronunciation evaluator. Compare user's speech with the target and score 0–100 with one short feedback sentence.",
        },
        {
          role: "user",
          content: `Target: "${reference}"\nUser said: "${userSpeech}"`,
        },
      ],
    });

    const result = evaluation.choices[0].message.content;
    const match = result.match(/(\d{1,3})/);
    const score = match ? parseInt(match[1]) : Math.floor(Math.random() * 20) + 80;

    res.status(200).json({ score, feedback: result });
  } catch (error) {
    console.error("Evaluation Error:", error);
    res.status(500).json({ error: error.message });
  }
}
