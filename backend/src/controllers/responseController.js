import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";
import {GoogleGenAI} from '@google/genai';

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

// Function to get resume information for the prompt
const getResumeContext = (resumeUrl, role) => {
  return `The candidate has applied for a ${role} position. Their resume is available at: ${resumeUrl}. Ask simple questions about their work experience, skills, and background that relate to this job.`;
};

// Function to format and clean AI responses
const formatResponse = (text) => {
  // Remove extra whitespace and normalize line breaks
  let formatted = text.trim().replace(/\s+/g, ' ');
  
  // Remove common AI prefixes/suffixes
  formatted = formatted.replace(/^(AI|Interviewer|Assistant):\s*/i, '');
  
  // Remove unnecessary phrases but be more careful
  formatted = formatted.replace(/\b(Now,|So,|Well,)\s*/gi, '');
  
  // Keep the response focused - if it's too long, try to extract the main question
  if (formatted.length > 200) {
    // Look for question marks to find the main question
    const questionParts = formatted.split('?');
    if (questionParts.length > 1) {
      // Take the first complete question
      formatted = questionParts[0] + '?';
    } else {
      // If no question mark, take the first sentence
      const sentences = formatted.split(/[.!?]/);
      formatted = sentences[0];
      if (!formatted.endsWith('?') && !formatted.endsWith('.')) {
        formatted += '.';
      }
    }
  }
  
  // Ensure proper capitalization
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  
  // Clean up any remaining issues
  formatted = formatted.trim();
  
  return formatted;
};

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

    // Ensure interviewHistory exists
    if (!interview.interviewHistory) {
        interview.interviewHistory = [];
    }
    
    const resumeContext = getResumeContext(interview.resume, interview.role);
    const contextText = interview.interviewHistory.length > 0 
        ? `Here's the interview context so far: ${interview.interviewHistory.map(entry => `${entry.role}: ${entry.text}`).join('\n')}`
        : "This is the beginning of the interview.";
    
    // Determine if this is the candidate's introduction or a regular question
    const isIntroduction = interview.interviewHistory.length <= 2; // After AI intro and candidate intro
    
    let prompt;
    if (isIntroduction) {
        prompt = `You are an AI interviewer conducting a friendly, conversational interview. ${resumeContext} ${contextText}\nCandidate: ${question}\nInterviewer: 

After the candidate introduces themselves, ask your first question about their background and the ${interview.role} position. 

IMPORTANT: Use simple, everyday language. Ask a clear, straightforward question that anyone can understand. Keep it conversational and friendly. Your response must be a question.

Examples of simple questions:\n- "What do you like most about your current job?"\n- "Can you tell me about a project you worked on?"\n- "What skills do you think are most important for this role?"\n- "How do you handle difficult situations at work?"`;
    } else {
        prompt = `You are an AI interviewer conducting a friendly, conversational interview. ${resumeContext} ${contextText}\nCandidate: ${question}\nInterviewer: 

Continue the interview with a follow-up question based on what they just told you.

IMPORTANT: Use simple, everyday language. Ask a clear, straightforward question that anyone can understand. Keep it conversational and friendly. Your response must be a question.

Examples of simple questions:\n- "What do you like most about your current job?"\n- "Can you tell me about a project you worked on?"\n- "What skills do you think are most important for this role?"\n- "How do you handle difficult situations at work?"`;
    }

    const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const rawText = result.candidates[0].content.parts[0].text;
    let formattedText = formatResponse(rawText);

    console.log('Raw AI response:', rawText);
    console.log('Formatted response:', formattedText);

    // Ensure the response contains a question
    if (!formattedText.includes('?')) {
        console.log('No question mark found, adding one...');
        // If no question mark, try to add one or regenerate
        if (formattedText.length < 100) {
            formattedText += '?';
        } else {
            // If response is too long and has no question, ask for a simple follow-up
            formattedText = `What experience do you have with ${interview.role}?`;
        }
    }

    interview.interviewHistory.push({ role: 'candidate', text: question });
    interview.interviewHistory.push({ role: 'interviewer', text: formattedText });
    await interview.save();

    res.status(200).json({ response: formattedText });
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

    const resumeContext = getResumeContext(interview.resume, interview.role);
    const initialPrompt = `You are an AI interviewer conducting a friendly, conversational interview. ${resumeContext} 

Start the interview by:
1. Introducing yourself in a friendly way
2. Asking the candidate to tell you about themselves
3. Mention that you'll be asking some questions about their background and the ${interview.role} position

IMPORTANT: Use simple, everyday language. Be friendly and welcoming. Keep it brief and conversational.`;

    const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: initialPrompt }] }]
    });
    
    const rawText = result.candidates[0].content.parts[0].text;
    const formattedText = formatResponse(rawText);

    // Ensure interviewHistory exists before pushing
    if (!interview.interviewHistory) {
        interview.interviewHistory = [];
    }
    interview.interviewHistory.push({ role: 'interviewer', text: formattedText });
    await interview.save();

    res.status(200).json({ initialQuestion: formattedText });
  } catch (error) {
    console.error("Error starting interview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {getGeminiResponse, startInterview};