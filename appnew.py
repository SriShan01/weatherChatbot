import google.generativeai as genai
import requests

# 🔹 Replace with your actual API Keys
GOOGLE_API_KEY = "AIzaSyB1z1a5erYQS80vfLf9nn2NX-OCJyFT4eU"
WEATHER_API_KEY = "b749225708ca268bb5f9991ab9c1fec7"

# Configure Google AI
genai.configure(api_key=GOOGLE_API_KEY)

# Load Gemini AI model
model = genai.GenerativeModel("gemini-1.5-pro-latest")

def fetch_weather(city):
    """ Fetch weather data from OpenWeather API """
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        weather_desc = data["weather"][0]["description"]
        temperature = data["main"]["temp"]
        return f"The weather in {city} is currently {weather_desc} with a temperature of {temperature}°C."
    else:
        return "Sorry, I couldn't find the weather for that city. Please try again."

def chat_with_bot(user_input):
    """ Determines if user wants weather data or a general response """
    if "weather" in user_input.lower():
        city = user_input.split("weather in")[-1].strip()
        return fetch_weather(city)
    else:
        try:
            response = model.generate_content(user_input)
            return response.text
        except Exception as e:
            return f"Error: {str(e)}"

# Chat loop
while True:
    user_message = input("You: ")
    if user_message.lower() in ["exit", "quit", "bye"]:
        print("Bot: Goodbye! 👋")
        break
    bot_reply = chat_with_bot(user_message)
    print("Bot:", bot_reply)
