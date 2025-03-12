require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");

const app = express();
const PORT = 4000;

// Retrieve API keys from .env file
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Configure Google AI
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

app.use(cors({ 
  origin: "http://localhost:5173", // Allow requests from the frontend
  methods: ["GET", "POST"], 
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(cors({ origin: "*" }));

app.use(express.json());

const fetchWeather = async (city) => {
  try {
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await axios.get(url);

    if (response.status === 200) {
      const data = response.data;
      const weatherDesc = data.weather[0].description;
      const temperature = data.main.temp;
      return `The weather in ${city} is currently ${weatherDesc} with a temperature of ${temperature}°C.`;
    }
  } catch (error) {
    return "Sorry, I couldn't find the weather for that city. Please try again.";
  }
};

const chatWithBot = async (userInput) => {
  if (userInput.toLowerCase().includes("weather in")) {
    const city = userInput.split("weather in").pop().trim();
    return await fetchWeather(city);
  }
  try {
    const response = await model.generateContent(userInput);
    return response.response.text();
  } catch (error) {
    return `Error: ${error.message}`;
  }
};

app.get("/", (req, res) => {
  res.send("Welcome to the AI Chatbot API!");
});

app.post("/chat", async (req, res) => {
  const userInput = req.body.message;
  if (!userInput) {
    return res.status(400).json({ error: "No message provided" });
  }

  const response = await chatWithBot(userInput);
  res.json({ response });
});

app.listen(PORT, () => {
  console.log(`Server running on http://0.0.0.0:4000`);
});
