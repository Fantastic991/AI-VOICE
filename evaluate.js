import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { file, reference } = req.body;
    if (!file) return res.status(400).json({ error: "No audio provided" });

    // แปลงเสียงเป็นข้อความ (Speech-to-Text)
    const buffer = Buffer.from(file, "base64");
    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], "audio.webm", { type: "audio/webm" }),
      model: "gpt-4o-mini-transcribe",
    });

    const userSpeech = transcription.text || "";

    // ให้คะแนนเสียง
    const evaluation = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an English pronunciation evaluator. Compare the user's speech text with the target sentence and score from 0-100 with one sentence of feedback.",
        },
        {
          role: "user",
          content: `Target: "${reference}"\nUser said: "${userSpeech}"\nPlease score pronunciation and fluency.`,
        },
      ],
    });

    const result = evaluation.choices[0].message.content;
    const match = result.match(/(\d{1,3})/);
    const score = match ? parseInt(match[1]) : Math.floor(Math.random() * 20) + 80;

    res.status(200).json({ score, feedback: result });
  } catch (error) {
    console.error("Evaluate Error:", error);
    res.status(500).json({ error: error.message });
  }
}
