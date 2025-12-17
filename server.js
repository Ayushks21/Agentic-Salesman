// backend/server.js

const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express(); // <-- This is important, define app

// Allow React frontend to connect
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// /generate route
app.post("/generate", (req, res) => {
  const userInput = req.body.input || "No input provided";

  const prompt = `
You are an internal sustainability decision-support tool.
Provide structured recommendations.

User Input:
${userInput}
`;

  exec(`ollama run llama3 "${prompt}"`, (error, stdout) => {
    if (error) {
      console.error("Ollama error:", error);
      return res.status(500).json({ error: "Ollama error occurred" });
    }
    res.json({ response: stdout });
  });
});

// Start server on port 4000
app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});