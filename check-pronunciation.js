import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { file, reference } = req.body;
    const audioBuffer = Buffer.from(file, "base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an English pronunciation evaluation assistant."
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Please rate how closely this audio matches the sentence: "${reference}". Give score 0–100 and a short feedback.` },
            { type: "input_audio", audio: audioBuffer.toString("base64") }
          ]
        }
      ]
    });

    res.status(200).json({ result: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
