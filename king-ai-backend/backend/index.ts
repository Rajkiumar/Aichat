import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Request type
interface ChatRequest {
  message: string;
}

app.post("/api/chat", async (req: Request<{}, {}, ChatRequest>, res: Response) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a powerful medieval king. Speak to the user, a humble commoner, with authority and a regal tone."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7
    });

    // Safe access with optional chaining
    const reply =
      completion.choices?.[0]?.message?.content ?? "I have nothing to say, commoner.";

    res.json({ reply });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.stack || err.message);
    } else {
      console.error(err);
    }
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
