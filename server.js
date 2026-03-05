import express from "express";
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

// Analyze
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
      "https://api-inference.huggingface.co/models/google/flan-t5-large",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 300
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: "HuggingFace API Error",
        details: errorText
      });
    }

    const data = await response.json();

    let resultText = "No response";

    if (Array.isArray(data) && data.length > 0) {
      resultText = data[0].generated_text;
    } else if (data.generated_text) {
      resultText = data.generated_text;
    }

    res.json({
      success: true,
      result: resultText
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