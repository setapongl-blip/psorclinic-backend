import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN;

app.get("/", (req, res) => {
  res.send("PsorClinic Backend is running 🚀");
});

app.post("/analyze", async (req, res) => {
  try {
    if (!HF_TOKEN) {
      return res.status(500).json({ error: "HF_TOKEN not set" });
    }

    const prompt = req.body.prompt;

    const response = await fetch(
  "https://router.huggingface.co/v1/chat/completions",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [
        { role: "user", content: prompt }
      ],
      max_tokens: 300
    }),
  }
);

const data = await response.json();

let aiText = "ไม่สามารถวิเคราะห์ได้";

if (data.choices && data.choices.length > 0) {
  aiText = data.choices[0].message.content;
} else if (data.error) {
  aiText = "HF Error: " + data.error.message;
}

res.json({ result: aiText });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});