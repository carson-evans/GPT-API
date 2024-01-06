/*
import OpenAI from "openai";
import { process } from "./env.js";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "You are a helpful assistant." }],
      model: "gpt-3.5-turbo",
    });
    console.log(completion.choices[0]);
  } catch (error) {
    console.log("Error: " + error.message);
  }

}

main();
*/
import OpenAI from "openai";
import { process } from "./env.js";
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
app.use(express.static('public'));


app.get("/", (req, res) => {
  res.send("OpenAI Chat API is running. Use POST request to interact.");
});

app.post("/", async (req, res) => {
  try {

    const { messages } = req.body;

    console.log(messages);
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {"role": "system", "content": "You are a DesignGPT helpful assistant graphics design chatbot."},
        ...messages
      //  {role: "user", content: `${message}`},
      ]
    });

    res.json({
      completion: completion.choices[0].message,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).send("An error occurred: " + error.message);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
