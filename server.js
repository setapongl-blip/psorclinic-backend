import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN;

// Health Check
app.get("/", (req, res) => {
  res.json({ status: "PsorClinic Backend running 🚀" });
});

// Analyze Route
app.post("/analyze", async (req, res) => {
  try {
    if (!HF_TOKEN) {
      return res.status(500).json({ error: "HF_TOKEN not set in environment" });
    }

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

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
            {
              role: "system",
              content: "You are a medical AI assistant specialized in psoriasis analysis."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 400,
          temperature: 0.7
        }),
      }
    );

    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: "HuggingFace API Error",
        details: errorText
      });
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({
        error: "No response from AI",
        raw: data
      });
    }

    const aiText = data.choices[0].message.content;

    res.json({
      success: true,
      result: aiText
    });

  } catch (err) {
    res.status(500).json({
      error: "Server Error",
      details: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});