import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    // ✅ รองรับทั้ง JSON และ FormData
    const { file, reference } = req.body;

    if (!file || !reference) {
      return res.status(400).json({ error: "Missing file or reference text." });
    }

    const audioBuffer = Buffer.from(file, "base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // ✅ เอา modalities ออกก่อน
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
              text: `Please rate how closely this audio matches the sentence: "${reference}". Give a score (0–100) and short feedback.`,
            },
            {
              type: "input_audio",
              audio: audioBuffer.toString("base64"),
            },
          ],
        },
      ],
    });

    res.status(200).json({
      result: response.choices[0].message?.content || "No response from model.",
    });
  } catch (error) {
    console.error("❌ Error in pronunciation API:", error);
    res.status(500).json({ error: error.message });
  }
}
