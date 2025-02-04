const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");

// Load environment variables
dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Create Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// Define a route to handle survey submissions
app.post("/analyze", async (req, res) => {
    try {
        const { answers } = req.body;

        // Prepare the prompt for the AI
        const prompt = `
            Analyze the following survey responses and provide a detailed analysis and actionable recommendations:
            1. Study Hours: ${answers[0]}
            2. Assignment Completion: ${answers[1]}
            3. Confidence in Core Concepts: ${answers[2]}
            4. Structured Study Plan: ${answers[3]}
            5. Procrastination: ${answers[4]}
        `;

        // Call the OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant that analyzes survey responses and provides actionable recommendations." },
                { role: "user", content: prompt },
            ],
            max_tokens: 300,
        });

        const aiMessage = completion.choices[0].message.content;

        // Split the AI response into analysis and recommendations
        const analysis = aiMessage.split("Recommendations:")[0].trim();
        const recommendations = aiMessage.split("Recommendations:")[1].trim();

        // Send the response back to the frontend
        res.json({ analysis, recommendations });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});