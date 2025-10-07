import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { audio, targetSentence } = req.body;

    if (!audio || !targetSentence) {
      return res.status(400).json({ error: "Missing audio or sentence" });
    }

    // ถอดเสียง
    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "gpt-4o-mini-transcribe",
    });

    const userSpeech = transcription.text || "";

    // ให้คะแนน
    const evaluation = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an English pronunciation evaluator. Compare user's speech with the target sentence and score 0-100 with one-sentence feedback.",
        },
        {
          role: "user",
          content: `Target: "${targetSentence}"\nUser said: "${userSpeech}"`,
        },
      ],
    });

    const result = evaluation.choices[0].message.content;
    const match = result.match(/(\d{1,3})/);
    const score = match ? parseInt(match[1]) : 75;

    res.status(200).json({ score, feedback: result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
}
