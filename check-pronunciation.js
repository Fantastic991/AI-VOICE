import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { audio, targetSentence } = req.body;

    if (!audio || !targetSentence) {
      return res.status(400).json({ error: "Missing audio or target sentence" });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "gpt-4o-mini-transcribe",
    });

    const userSpeech = transcription.text || "";

    const evaluation = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an English pronunciation evaluator.",
        },
        {
          role: "user",
          content: `Target sentence: "${targetSentence}"\nUser said: "${userSpeech}"\nPlease rate pronunciation accuracy from 0-100 and give short feedback.`,
        },
      ],
    });

    const aiResponse = evaluation.choices[0].message.content;
    res.status(200).json({ result: aiResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
}
