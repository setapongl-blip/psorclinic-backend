import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// IMPORTANT: Render ต้องใช้ PORT จาก environment
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ดึง HF Token จาก Environment
const HF_TOKEN = process.env.HF_TOKEN;

// หน้า Home (แก้ Cannot GET /)
app.get("/", (req, res) => {
  res.send("PsorClinic Backend is running 🚀");
});

// API วิเคราะห์
app.post("/analyze", async (req, res) => {
  try {
    if (!HF_TOKEN) {
      return res.status(500).json({ error: "HF_TOKEN not set" });
    }

    const prompt = req.body.prompt;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    const data = await response.json();

    res.json({
      result:
        data?.[0]?.generated_text ||
        data?.generated_text ||
        "ไม่สามารถวิเคราะห์ได้",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
