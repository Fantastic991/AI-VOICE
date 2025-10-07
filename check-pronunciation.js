export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { audioUrl, text } = req.body;

    if (!audioUrl || !text) {
      return res.status(400).json({ error: "Missing audio or text" });
    }

    // เรียก API จาก OpenAI หรือ API วิเคราะห์เสียงอื่น ๆ
    const response = await fetch("https://api.openai.com/v1/audio/speech-to-text", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        audio_url: audioUrl,
        reference_text: text
      }),
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
