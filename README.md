# WhatsApp Product Review Collector

A full-stack application that allows users to submit product reviews **via WhatsApp**, which are stored in **PostgreSQL** and displayed in a **React web dashboard**. The chatbot intelligently handles the conversation and ensures a smooth user experience.

[Loom Video](https://www.loom.com/share/1c0d33670eb84ce5a8be6e9ec34ffff5)
## 🚀 Live Deployment

| Component | URL |
|-----------|-----|
| **Frontend (React)** | https://hyperint-whatsapp-review-collector.vercel.app/|
| **Backend API (Node/Express)** | https://hyperint-whatsapp-review-collector.onrender.com/ |
| **WhatsApp Sandbox** | Send “Hi” to: `whatsapp:+14155238886` |


## 🧠 Features

✔ Submit product reviews via WhatsApp  
✔ Human-like intelligent conversation  
✔ Handles errors, reset, and status commands  
✔ Stores reviews in PostgreSQL database  
✔ Clean React frontend displaying reviews  
✔ Fully deployed using cloud services  



## 🏗️ Architecture Overview
<img width="873" height="361" alt="Gemini_Generated_Image_sqi1tsqi1tsqi1ts" src="https://github.com/user-attachments/assets/da986ac5-a01d-49fa-943f-5117f3d610d9" />


## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| Backend | Node.js, Express.js |
| Frontend | React (Vite), Tailwind CSS |
| Database | PostgreSQL (Railway) |
| Messaging | Twilio WhatsApp Sandbox |
| Deployment | Render (Backend), Vercel (Frontend) |


## 📂 Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── db.js           # PostgreSQL connection
│   ├── controllers/
│   │   └── whatsappController.js  # Handles webhook from Twilio
│   ├── services/
│   │   ├── conversationService.js # Chat logic & state handling
│   │   └── reviewService.js       # Handles DB operations
│   ├── routes/
│   │   └── reviews.js      # GET /api/reviews endpoint
│   ├── middleware/
│   │   └── errorHandler.js # error handling
│   ├── server.js           # Express server and route setup
│   └── app.js              # Main app configuration
├── .env                    # Environment variables
└── package.json
---

frontend/
├── src/
│   ├── components/
│   │   └── ReviewTable.jsx   # Displays reviews
│   ├── api/
│   │   └── apiClient.js      # Fetches data from backend API
│   ├── App.jsx               # Main application component
│   ├── main.jsx              # React entry point
│   └── index.css             # Tailwind base styles
├── public/
│   └── favicon.svg
├── .env                     # VITE_API_URL
├── vite.config.js
└── package.json
```
---

## 🚀 Next Steps to Run the Project

You can run the application **locally for development** or **use the deployed version**.

###  Run Locally 
#### Start Backend
```
cd backend
npm install
npm start
```
Backend will be available at:
```
http://localhost:4000
```
Expose it to the internet using ngrok:
```
ngrok http 4000
```
Copy the generated HTTPS forwarding URL from ngrok and update it in Twilio Sandbox Webhook under:
```
https://<ngrok-url>/webhook
```
### Start Frontend
```
cd ../frontend
npm install
npm run dev
```
Frontend will be available at:
```
http://localhost:5173
```
Make sure your frontend/.env file contains:
```
VITE_API_URL=http://localhost:4000/api
```

