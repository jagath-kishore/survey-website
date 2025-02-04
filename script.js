const questions = [
    { text: "How many hours do you study per week outside of class?", options: ["Less than 5 hours", "5-10 hours", "More than 10 hours"] },
    { text: "How often do you complete assignments on time?", options: ["Always", "Sometimes", "Rarely"] },
    { text: "How confident are you in understanding the core concepts of the subject?", options: ["Very confident", "Somewhat confident", "Not confident at all"] },
    { text: "Do you follow a structured study plan?", options: ["Yes, regularly", "Sometimes", "No, I study randomly"] },
    { text: "How often do you procrastinate on academic tasks?", options: ["Never", "Occasionally", "Frequently"] }
];

let currentQuestionIndex = 0;
let responses = [];

function displayQuestion() {
    const question = questions[currentQuestionIndex];

    // Generate HTML for the question and options using template literals
    const questionHTML = `
        <h2>${question.text}</h2>
        <div class="options-container">
            ${question.options.map(option => `
                <button class="option-btn ${responses[currentQuestionIndex] === option ? 'selected' : ''}" 
                        onclick="selectOption('${option}')">
                    ${option}
                </button>
            `).join('')}
        </div>
    `;

    // Inject the generated HTML into the questionnaire div
    document.getElementById("questionnaire").innerHTML = questionHTML;

    // Control button visibility
    document.getElementById("prev-btn").style.display = currentQuestionIndex > 0 ? "inline-block" : "none";
    document.getElementById("next-btn").style.display = currentQuestionIndex < questions.length - 1 ? "inline-block" : "none";
    document.getElementById("submit-btn").style.display = currentQuestionIndex === questions.length - 1 ? "inline-block" : "none";
}

function selectOption(option) {
    responses[currentQuestionIndex] = option;
    displayQuestion(); // Re-render to update the selected state
}

function nextQuestion() {
    if (responses[currentQuestionIndex] !== undefined) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        alert("Please select an option before moving to the next question.");
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

async function submitResponses() {
    document.getElementById("loading").style.display = "block";

    try {
        // Prepare the prompt for the AI
        const prompt = `
            Analyze the following survey responses and provide a detailed analysis and actionable recommendations:
            1. Study Hours: ${responses[0]}
            2. Assignment Completion: ${responses[1]}
            3. Confidence in Core Concepts: ${responses[2]}
            4. Structured Study Plan: ${responses[3]}
            5. Procrastination: ${responses[4]}
        `;

        // Call the AI API (e.g., OpenAI GPT)
        const aiResponse = await callAIApi(prompt);

        // Display the AI-generated analysis
        document.getElementById("loading").style.display = "none";
        document.getElementById("result-section").style.display = "block";
        document.getElementById("root-cause").textContent = "Analysis: " + aiResponse.analysis;
        document.getElementById("action-plan").textContent = "Recommendations: " + aiResponse.recommendations;
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("loading").style.display = "none";
        alert("There was an error processing your request. Please try again.");
    }
}

async function callAIApi(prompt) {
    const apiKey = "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"; // Replace with your OpenAI API key
    const url = "https://api.openai.com/v1/chat/completions";

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo", // Use the appropriate model
            messages: [
                { role: "system", content: "You are a helpful assistant that analyzes survey responses and provides actionable recommendations." },
                { role: "user", content: prompt }
            ],
            max_tokens: 300 // Adjust as needed
        })
    });

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    // Split the AI response into analysis and recommendations
    return {
        analysis: aiMessage.split("Recommendations:")[0].trim(),
        recommendations: aiMessage.split("Recommendations:")[1].trim()
    };
}


async function submitResponses() {
    document.getElementById("loading").style.display = "block";

    try {
        // Send responses to the backend
        const response = await fetch("http://localhost:5000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers: responses }),
        });

        const data = await response.json();

        // Display the AI-generated analysis
        document.getElementById("loading").style.display = "none";
        document.getElementById("result-section").style.display = "block";
        document.getElementById("root-cause").textContent = "Analysis: " + data.analysis;
        document.getElementById("action-plan").textContent = "Recommendations: " + data.recommendations;
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("loading").style.display = "none";
        alert("There was an error processing your request. Please try again.");
    }
}

// Initialize the first question
displayQuestion();

// Attach event listeners to buttons
document.getElementById("prev-btn").addEventListener("click", prevQuestion);
document.getElementById("next-btn").addEventListener("click", nextQuestion);
document.getElementById("submit-btn").addEventListener("click", submitResponses);


