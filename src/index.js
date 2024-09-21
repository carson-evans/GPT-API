// index.js
import OpenAI from "openai";
import { process } from "../env.js";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

// Configure OpenAI API key authorization: OPENAI_API_KEY from env.js
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Create Express app
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); // Serves static files from the 'public' directory

// Removed the GET '/' route so it doesn't display any message

app.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    console.log(messages);
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: messages, // Use messages from the client
    });
    console.log(completion.data.choices[0].message.content);

    res.json({ response: completion.data.choices[0].message.content });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("An error occurred: " + error.message);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
