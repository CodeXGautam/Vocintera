import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";
import {GoogleGenAI} from '@google/genai';
import fetch from 'node-fetch';

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);



// Function to get response from OpenRouter
const getOpenRouterResponse = async (prompt) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Vocintera Interview App'
      },
              body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || 'mistralai/mistral-small-3.2-24b-instruct:free',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenRouter API Response:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('OpenRouter API returned invalid response structure:', data);
      throw new Error('Invalid response structure from OpenRouter API');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    throw error;
  }
};

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
  
  // Remove reasoning and explanations - keep only the question
  formatted = formatted.replace(/^(Got it!|I see|That's great!|Interesting!|Based on what you've shared,|Since you mentioned,|Given your experience,|Looking at your background,|Since the candidate just started sharing about their experience with|though the response was cut off,|here's a simple follow-up question to keep the conversation flowing naturally:)\s*/gi, '');
  
  // Remove any text that looks like internal reasoning
  formatted = formatted.replace(/\*\*[^*]+\*\*/g, ''); // Remove bold text (often used for emphasis)
  formatted = formatted.replace(/\[[^\]]+\]/g, ''); // Remove bracketed text
  
  // Remove unnecessary phrases
  formatted = formatted.replace(/\b(Now,|So,|Well,|Let me ask,|I'd like to know,)\s*/gi, '');
  
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
        prompt = `You are an AI interviewer. ${resumeContext} ${contextText}\nCandidate: ${question}\nInterviewer: 

Ask your first question about their background and the ${interview.role} position. 

IMPORTANT: 
- Respond with ONLY the question, no explanations or reasoning
- Use simple, everyday language
- Keep it conversational and friendly
- Your response must be a question

Examples of good responses:
- "What do you like most about your current job?"
- "Can you tell me about a project you worked on?"
- "What skills do you think are most important for this role?"
- "How do you handle difficult situations at work?"`;
    } else {
        prompt = `You are an AI interviewer. ${resumeContext} ${contextText}\nCandidate: ${question}\nInterviewer: 

Ask a follow-up question based on what they just told you.

IMPORTANT: 
- Respond with ONLY the question, no explanations or reasoning
- Use simple, everyday language
- Keep it conversational and friendly
- Your response must be a question

Examples of good responses:
- "That's great! Can you tell me about a project you worked on recently?"
- "Interesting! What challenges did you face in that role?"
- "Can you give me an example of how you handled a difficult situation?"
- "What do you think makes you a good fit for this position?"`;
    }

    let formattedText;
    let isUsingFallback = false;
    
    try {
        // Primary: Try Gemini first
        const result = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });
        const rawText = result.candidates[0].content.parts[0].text;
        formattedText = formatResponse(rawText);
        console.log('✅ Using Gemini API (Primary)');
    } catch (error) {
        console.error("❌ Gemini API Error:", error);
        
        // Secondary: Switch to OpenRouter when Gemini fails
        if (error.status === 429 || error.status >= 500 || error.message.includes('rate limit')) {
            try {
                console.log('🔄 Switching to OpenRouter API...');
                const rawText = await getOpenRouterResponse(prompt);
                console.log('OpenRouter raw response:', rawText);
                formattedText = formatResponse(rawText);
                console.log('OpenRouter formatted response:', formattedText);
                console.log('✅ Using OpenRouter API (Fallback)');
                isUsingFallback = true; // Notify frontend that we're using fallback
            } catch (openRouterError) {
                console.error("❌ OpenRouter API Error:", openRouterError);
                
                // Final fallback: Use predefined questions
                const fallbackQuestions = [
                    "Can you tell me about your work experience?",
                    "What skills do you think are most important for this role?",
                    "How do you handle difficult situations at work?",
                    "What do you like most about your current job?",
                    "Can you describe a project you worked on recently?",
                    "What are your strengths in this field?",
                    "How do you stay updated with industry trends?",
                    "What challenges have you faced in your career?",
                    "How do you work in a team environment?",
                    "What are your career goals?"
                ];
                
                const randomIndex = Math.floor(Math.random() * fallbackQuestions.length);
                formattedText = fallbackQuestions[randomIndex];
                isUsingFallback = true;
                console.log('⚠️ Using fallback questions (all APIs failed)');
            }
        } else {
            // For other Gemini errors, try OpenRouter
            try {
                console.log('🔄 Gemini error, trying OpenRouter...');
                const rawText = await getOpenRouterResponse(prompt);
                console.log('OpenRouter raw response:', rawText);
                formattedText = formatResponse(rawText);
                console.log('OpenRouter formatted response:', formattedText);
                console.log('✅ Using OpenRouter API (Fallback)');
                isUsingFallback = true;
            } catch (openRouterError) {
                console.error("❌ OpenRouter also failed:", openRouterError);
                formattedText = `Can you tell me more about your experience with ${interview.role}?`;
                isUsingFallback = true;
            }
        }
    }

    // Ensure the response contains a question
    if (!formattedText.includes('?')) {
        console.log('No question mark found, adding one...');
        if (formattedText.length < 100) {
            formattedText += '?';
        } else {
            formattedText = `What experience do you have with ${interview.role}?`;
        }
    }

    interview.interviewHistory.push({ role: 'candidate', text: question });
    interview.interviewHistory.push({ role: 'interviewer', text: formattedText });
    await interview.save();

    res.status(200).json({ 
        aiResponse: formattedText,
        isUsingFallback: isUsingFallback 
    });
  } catch (error) {
    console.error("Error getting Gemini response:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Function to end interview and update status
const endInterview = async (req, res) => {
  try {
    const { interviewId, status, isManual } = req.body;

    if (!interviewId) {
      return res.status(400).json({ message: "Interview ID is required" });
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Update interview status
    interview.status = status || true;
    interview.completedAt = new Date();
    interview.isManualEnd = isManual || false;
    
    await interview.save();

    console.log(`Interview ${interviewId} ended. Status: ${status}, Manual: ${isManual}`);

    res.status(200).json({ 
      message: "Interview ended successfully",
      interviewId: interview._id,
      status: interview.status
    });
  } catch (error) {
    console.error("Error ending interview:", error);
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

    let formattedText;
    let isUsingFallback = false;
    
    try {
        const result = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ role: "user", parts: [{ text: initialPrompt }] }]
        });
        
        const rawText = result.candidates[0].content.parts[0].text;
        formattedText = formatResponse(rawText);
    } catch (error) {
        console.error("Gemini API Error in startInterview:", error);
        
        // Handle rate limit error
        if (error.status === 429) {
            formattedText = `Hello! I'm your AI interviewer. Can you tell me about yourself and your experience with ${interview.role}?`;
            isUsingFallback = true;
        } else {
            // For other errors, use a generic introduction
            formattedText = `Hello! I'm your AI interviewer. Please introduce yourself and tell me about your background.`;
            isUsingFallback = true;
        }
    }

    // Ensure interviewHistory exists before pushing
    if (!interview.interviewHistory) {
        interview.interviewHistory = [];
    }
    interview.interviewHistory.push({ role: 'interviewer', text: formattedText });
    await interview.save();

    res.status(200).json({ 
        initialQuestion: formattedText,
        usingFallback: isUsingFallback 
    });
  } catch (error) {
    console.error("Error starting interview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {getGeminiResponse, startInterview  , endInterview};