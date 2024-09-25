import mongoose from 'mongoose';
import { process } from '../env.js';
import OpenAI from 'openai';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';

// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB successfully!");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

// Define Mongoose schemas and models
const userSchema = new mongoose.Schema({
    username: String,
    password: String, // Note: Passwords are hashed
});

const riskAnalysisSchema = new mongoose.Schema({
    userID: mongoose.Schema.Types.ObjectId,
    text: String,
    analysisResult: Object,
    timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const RiskAnalysis = mongoose.model('RiskAnalysis', riskAnalysisSchema);

// Configure OpenAI API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Configure SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); // Serves static files from the 'public' directory

// Serve index.html for GET requests to '/'
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware to authenticate users
function authenticateUser(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
}

// Handle POST requests to '/'
app.post("/", authenticateUser, async (req, res) => {
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

        // Run risk analysis in the background (silent to user)
        const userMessage = messages.find(msg => msg.role === 'user')?.content || '';
        await performRiskAnalysis(userMessage, req.user);

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

// Function to perform risk analysis
async function performRiskAnalysis(text, user) {
    if (!text) return;

    try {
        const moderationResponse = await openai.moderations.create({
            input: text,
        });

        const results = moderationResponse.results[0];
        const flaggedForSelfHarm = results.categories['self-harm'];
        const selfHarmScore = results.category_scores['self-harm'];

        console.log("Moderation results:", results);

        if (flaggedForSelfHarm) {
            console.log("Potential self-harm content detected:", text);
            // Send alert email or take appropriate action
            await sendAlertEmail(user, text, selfHarmScore);

            // Optionally, send a supportive message to the user
            // You can implement this based on your application's design
        }

        // Save the analysis result to the database
        await saveRiskAnalysis(user.userId, text, results);

    } catch (error) {
        console.error("Error performing risk analysis:", error);
    }
}

// Function to save risk analysis to MongoDB
async function saveRiskAnalysis(userID, text, analysisResult) {
    const riskRecord = new RiskAnalysis({
        userID,
        text,
        analysisResult,
    });
    await riskRecord.save();
    console.log("Risk analysis saved to MongoDB:", riskRecord);
}

// User Registration API
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
        username,
        password: hashedPassword,
    });

    await newUser.save();

    res.json({ message: "Registration successful" });
});

// User Login API
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: "Login successful", token });
});

// Function to send email notification using SendGrid
async function sendAlertEmail(user, text, selfHarmScore) {
    // If you're using a SendGrid dynamic template
    const msg = {
        to: process.env.ALERT_EMAIL_RECIPIENT, // recipient email
        from: 'no-reply@yourdomain.com', // verified sender email
        subject: `Urgent: Self-Harm Risk Detected for User ID ${user.userId}`,
        // If using a template
        // templateId: 'your-sendgrid-template-id',
        // dynamicTemplateData: {
        //     userId: user.userId,
        //     message: text,
        //     selfHarmScore: selfHarmScore,
        //     // Add other dynamic data fields as needed
        // },
        // If not using a template
        text: `A self-harm risk has been detected in a message from user ID: ${user.userId}.\n\nMessage: "${text}"\nSelf-Harm Score: ${selfHarmScore}\n\nPlease take appropriate action.`,
        // html: '<strong>Include HTML version if needed</strong>',
    };

    try {
        await sgMail.send(msg);
        console.log('Alert email sent successfully.');
    } catch (error) {
        console.error('Error sending alert email:', error);

        if (error.response) {
            console.error(error.response.body);
        }
    }
}

// Start the server
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
