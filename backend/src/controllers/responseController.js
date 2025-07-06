import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";
import {GoogleGenAI} from '@google/genai';

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

const getGeminiResponse = async (req, res) => {
  try {
    const { interviewId, question } = req.body;

    if (!interviewId || !question) {
      return res.status(400).json({ message: "Interview ID and question are required" });
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an AI interviewer. The user is a candidate. Here's the interview context so far: ${interview.interviewHistory.map(entry => `${entry.role}: ${entry.text}`).join('\n')}\nCandidate: ${question}\nInterviewer:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    interview.interviewHistory.push({ role: 'candidate', text: question });
    interview.interviewHistory.push({ role: 'interviewer', text: text });
    await interview.save();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error("Error getting Gemini response:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const startInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json({ message: "Interview ID is required" });
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const initialPrompt = `You are an AI interviewer. The user is a candidate. Start the interview by asking the first question.`;

    const result = await model.generateContent(initialPrompt);
    const response = await result.response;
    const text = response.text();

    interview.interviewHistory.push({ role: 'interviewer', text: text });
    await interview.save();

    res.status(200).json({ initialQuestion: text });
  } catch (error) {
    console.error("Error starting interview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {getGeminiResponse, startInterview};