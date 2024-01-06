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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("OpenAI Chat API is running. Use POST request to interact.");
});

app.post("/", async (req, res) => {
  try {
    const { message } = req.body;
//    const userMessage = req.body.message;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {"role": "user", "content": `${message}`},
      ]
    });
    console.log(completion.choices[0]);

    console.log("OpenAI API Response:", completion);

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
