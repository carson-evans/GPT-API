// src/index.js
import OpenAI from "openai";
import { process } from "../env.js";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure OpenAI API key authorization: OPENAI_API_KEY from env.js
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Create Express app
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); // Serves static files from the 'public' directory

// Serve index.html for GET requests to '/'
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle POST requests to '/'
app.post("/", async (req, res) => {
    try {
        const { messages } = req.body;

        console.log("Received messages:", messages);

        // Validate messages array
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Invalid messages format." });
        }

        // Create chat completion with the provided messages
        const completion = await openai.chat.completions.create({
            model: "gpt-4", // Use "gpt-3.5-turbo" if you don't have access to "gpt-4"
            messages: messages,
        });

        const responseText = completion.choices[0].message.content;
        console.log("Assistant response:", responseText);

        res.json({ response: responseText });
    } catch (error) {
        console.error("Error:", error);

        // Check if OpenAI API returned an error
        if (error.response && error.response.data) {
            return res.status(500).json({ error: error.response.data });
        }

        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
