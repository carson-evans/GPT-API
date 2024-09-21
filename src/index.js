// src/index.js
import { MongoClient } from "mongodb";
import OpenAI from "openai";
import { process } from "../env.js";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB successfully!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

// Configure OpenAI API key
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

// Connect to database on server start
connectToDatabase();

// Database reference
const db = client.db("sentimentMonintoringDB"); // Can be changed
const usersCollection = db.collection("users");
const sentimentCollection = db.collection("sentimentAnalysis");

// Function to save sentiment analysis to MongoDB
async function saveSentimentAnalysis(userID, text, sentimentResult) {
    const sentimentRecord = {
        userID,
        text,
        sentiment: sentimentResult,
        timestamp: new Date(),
    };
    await sentimentCollection.insertOne(sentimentRecord);
    console.log("Sentiment analysis saved to MongoDB:", sentimentRecord);
}

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
            model: "gpt-4",
            messages: messages,
        });

        const responseText = completion.choices[0].message.content;
        console.log("Assistant response:", responseText);

        // Run sentiment analysis in the background (silent to user)
        const userMessage = messages.find(msg => msg.role === 'user')?.content || '';
        await performSentimentAnalysis(userMessage);

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

// Function to perform sentiment analysis (runs silently)
async function performSentimentAnalysis(text) {
    if (!text) return;

    try {
        // Use OpenAI's completion to perform sentiment analysis
        const sentimentAnalysis = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a sentiment analysis tool." },
                { role: "user", content: `Analyze the sentiment of this text: "${text}"` },
            ],
        });

        const sentimentResult = sentimentAnalysis.choices[0].message.content;
        console.log("Sentiment analysis result:", sentimentResult);

        // Optionally, send alerts or log sentiment
        if (sentimentResult.includes("negative") || sentimentResult.includes("risk")) {
            // Send alert or log potential risk (e.g., send an email or log to a database)
            console.log("Potential negative sentiment detected:", sentimentResult);
        }
    } catch (error) {
        console.error("Error performing sentiment analysis:", error);
    }
}

// User Login API (Basic - No encryption)
app.post("/login", async (req, res) => {
    const { username, password } = req.body; // This should be handled securely in a real app
    const user = await usersCollection.findOne({ username, password });

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a simple session token (In production, use JWT)
    const sessionToken = `session_${user._id}`;

    res.json({ message: "Login successful", sessionToken });
});

// Middleware to authenticate users
async function authenticateUser(req, res, next) {
    const { sessionToken } = req.headers;
    if (!sessionToken) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await usersCollection.findOne({ _id: sessionToken.replace('session_', '') });
    if (!user) {
        return res.status(401).json({ error: "Invalid session token" });
    }

    req.user = user;
    next();
}

// API endpoint to analyze sentiment
app.post("/analyze-sentiment", authenticateUser, async (req, res) => {
    try {
        const { text } = req.body;

        console.log("Received text for sentiment analysis:", text);

        // Use OpenAI's completion to perform sentiment analysis
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a sentiment analysis tool." },
                { role: "user", content: `Analyze the sentiment of this text: "${text}"` },
            ],
        });

        const sentimentResult = completion.choices[0].message.content;
        console.log("Sentiment analysis result:", sentimentResult);

        // Save the analysis result to the database with the user's ID
        await saveSentimentAnalysis(req.user._id, text, sentimentResult);

        res.json({ message: "Sentiment analysis saved", sentimentResult });
    } catch (error) {
        console.error("Error performing sentiment analysis:", error);
        res.status(500).json({ error: error.message });
    }
});

// Configure Nodemailer transport (using Gmail here, but can be any SMTP service)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: process.env.EMAIL_SERVICE_API_KEY // Use email service API key or password from env.js
    }
});

// Function to send email notification
async function sendAlertEmail(user, sentimentResult) {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: 'counselor@domain.com', // Set to a counselor or alert recipient
        subject: `Alert: Negative Sentiment Detected for ${user.username}`,
        text: `A negative sentiment was detected in a message sent by ${user.username}. Sentiment: ${sentimentResult}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
}

// Start the server
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
