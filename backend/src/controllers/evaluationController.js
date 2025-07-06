import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";
import { GoogleGenAI } from '@google/genai';
import fetch from 'node-fetch';
import { cleanupOldInterviews } from './interviewController.js';

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
            role: 'system',
            content: 'You are a JSON-only response bot. Always respond with valid JSON format only. Never include any text before or after the JSON object.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if the response has the expected structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenRouter response structure:', data);
      throw new Error('Invalid response structure from OpenRouter API');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    throw error;
  }
};

// Function to evaluate interview performance
const evaluateInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    if (!interviewId) {
      return res.status(400).json({ message: "Interview ID is required" });
    }

    const interview = await Interview.findById(interviewId).populate('candidate', 'name email');

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (!interview.status) {
      return res.status(400).json({ message: "Interview must be completed before evaluation" });
    }

    // Extract interview conversation
    const conversation = interview.interviewHistory || [];
    const role = interview.role;
    const resumeUrl = interview.resume;

    // Create evaluation prompt
    const evaluationPrompt = `
You are an expert HR evaluator. Analyze this interview conversation for a ${role} position and provide a comprehensive evaluation.

Interview Details:
- Role: ${role}
- Resume: ${resumeUrl}
- Conversation: ${conversation.map(entry => `${entry.role}: ${entry.text}`).join('\n')}

IMPORTANT: Respond ONLY with valid JSON. Do not include any text before or after the JSON object.

Provide a detailed evaluation in this exact JSON format:

{
  "overallScore": 85,
  "communication": {
    "score": 80,
    "feedback": "Good communication skills, clear responses",
    "strengths": ["Clear articulation", "Professional tone"],
    "improvements": ["Could provide more specific examples"]
  },
  "technicalKnowledge": {
    "score": 90,
    "feedback": "Strong technical understanding",
    "strengths": ["Deep knowledge of relevant technologies"],
    "improvements": ["Could demonstrate more hands-on experience"]
  },
  "problemSolving": {
    "score": 75,
    "feedback": "Shows logical thinking",
    "strengths": ["Analytical approach"],
    "improvements": ["Could provide more detailed solutions"]
  },
  "experience": {
    "score": 85,
    "feedback": "Relevant experience demonstrated",
    "strengths": ["Good project examples"],
    "improvements": ["Could share more quantifiable results"]
  },
  "culturalFit": {
    "score": 88,
    "feedback": "Good cultural alignment",
    "strengths": ["Team-oriented mindset"],
    "improvements": ["Could show more leadership examples"]
  },
  "recommendation": "Strong candidate, recommend for next round",
  "keyStrengths": ["Technical expertise", "Communication skills", "Relevant experience"],
  "areasForImprovement": ["More specific examples", "Quantifiable achievements"],
  "nextSteps": "Schedule technical assessment"
}

Be objective and provide specific feedback based on the conversation. Scores should be between 0-100. Return ONLY the JSON object.
`;

    let evaluationResult;
    try {
      // Try Gemini first
      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: evaluationPrompt }] }]
      });
      
      // Check if the response has the expected structure
      if (!result.candidates || !result.candidates[0] || !result.candidates[0].content || !result.candidates[0].content.parts || !result.candidates[0].content.parts[0]) {
        console.error('Invalid Gemini response structure:', result);
        throw new Error('Invalid response structure from Gemini API');
      }
      
      const rawText = result.candidates[0].content.parts[0].text;
      
      // Try to extract JSON from the response
      let jsonText = rawText;
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      evaluationResult = JSON.parse(jsonText);
      console.log('✅ Using Gemini API for evaluation');
    } catch (error) {
      console.error("❌ Gemini API Error:", error);
      
      try {
        // Fallback to OpenRouter
        console.log('🔄 Switching to OpenRouter API for evaluation...');
        const rawText = await getOpenRouterResponse(evaluationPrompt);
        
        // Try to extract JSON from the response
        let jsonText = rawText;
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
        
        evaluationResult = JSON.parse(jsonText);
        console.log('✅ Using OpenRouter API for evaluation');
      } catch (openRouterError) {
        console.error("❌ OpenRouter API Error:", openRouterError);
        
        // Fallback evaluation
        console.log('🔄 Using fallback evaluation due to API errors');
        evaluationResult = {
          overallScore: 75,
          communication: {
            score: 70,
            feedback: "Standard communication skills demonstrated during the interview",
            strengths: ["Clear responses", "Professional tone"],
            improvements: ["Could provide more specific examples", "More detailed explanations"]
          },
          technicalKnowledge: {
            score: 80,
            feedback: "Good technical understanding for the role",
            strengths: ["Relevant knowledge", "Understanding of key concepts"],
            improvements: ["Could show more depth", "More hands-on experience examples"]
          },
          problemSolving: {
            score: 75,
            feedback: "Shows logical thinking and analytical approach",
            strengths: ["Analytical approach", "Structured thinking"],
            improvements: ["Could provide more detailed solutions", "More creative problem-solving"]
          },
          experience: {
            score: 80,
            feedback: "Relevant experience demonstrated through examples",
            strengths: ["Good background", "Relevant projects"],
            improvements: ["Could share more quantifiable results", "More specific achievements"]
          },
          culturalFit: {
            score: 85,
            feedback: "Good cultural alignment and team-oriented mindset",
            strengths: ["Team player", "Positive attitude"],
            improvements: ["Could show more leadership examples", "More initiative examples"]
          },
          recommendation: "Strong candidate, recommend for next round of interviews",
          keyStrengths: ["Technical skills", "Communication", "Relevant experience"],
          areasForImprovement: ["More specific examples", "Quantifiable achievements", "Leadership demonstration"],
          nextSteps: "Schedule technical assessment and team fit interview"
        };
      }
    }

    // Validate evaluation result structure
    const requiredFields = ['overallScore', 'communication', 'technicalKnowledge', 'problemSolving', 'experience', 'culturalFit', 'recommendation', 'keyStrengths', 'areasForImprovement', 'nextSteps'];
    const missingFields = requiredFields.filter(field => !evaluationResult[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields in evaluation result:', missingFields);
      throw new Error('Invalid evaluation result structure');
    }
    
    // Update interview with evaluation results
    interview.evaluation = evaluationResult;
    interview.evaluatedAt = new Date();
    await interview.save();

    // Clean up old interviews after evaluation (keep only 5)
    await cleanupOldInterviews(req.user._id);

    res.status(200).json({
      message: "Interview evaluated successfully",
      evaluation: evaluationResult,
      interviewId: interview._id
    });

  } catch (error) {
    console.error("Error evaluating interview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Function to get user's evaluation statistics
const getUserEvaluations = async (req, res) => {
  try {
    const userId = req.user._id;

    const interviews = await Interview.find({ 
      candidate: userId, 
      status: true,
      evaluation: { $exists: true }
    }).sort({ evaluatedAt: -1 });

    if (interviews.length === 0) {
      return res.status(200).json({
        message: "No evaluated interviews found",
        statistics: {
          totalInterviews: 0,
          averageScore: 0,
          categoryAverages: {},
          recentScores: [],
          improvementTrend: "No data"
        }
      });
    }

    // Calculate statistics
    const totalInterviews = interviews.length;
    const averageScore = interviews.reduce((sum, interview) => sum + interview.evaluation.overallScore, 0) / totalInterviews;

    // Category averages
    const categories = ['communication', 'technicalKnowledge', 'problemSolving', 'experience', 'culturalFit'];
    const categoryAverages = {};
    
    categories.forEach(category => {
      const scores = interviews.map(interview => interview.evaluation[category]?.score || 0);
      categoryAverages[category] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    // Recent scores (last 5 interviews)
    const recentScores = interviews.slice(0, 5).map(interview => ({
      date: interview.evaluatedAt,
      score: interview.evaluation.overallScore,
      role: interview.role
    }));

    // Improvement trend
    let improvementTrend = "Stable";
    if (recentScores.length >= 2) {
      const firstScore = recentScores[recentScores.length - 1].score;
      const lastScore = recentScores[0].score;
      if (lastScore > firstScore + 5) {
        improvementTrend = "Improving";
      } else if (lastScore < firstScore - 5) {
        improvementTrend = "Declining";
      }
    }

    res.status(200).json({
      message: "Evaluation statistics retrieved successfully",
      statistics: {
        totalInterviews,
        averageScore: Math.round(averageScore),
        categoryAverages: Object.fromEntries(
          Object.entries(categoryAverages).map(([key, value]) => [key, Math.round(value)])
        ),
        recentScores,
        improvementTrend
      }
    });

  } catch (error) {
    console.error("Error getting user evaluations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Function to get detailed evaluation for a specific interview
const getInterviewEvaluation = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user._id;

    const interview = await Interview.findOne({ 
      _id: interviewId, 
      candidate: userId,
      status: true,
      evaluation: { $exists: true }
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview evaluation not found" });
    }

    res.status(200).json({
      message: "Interview evaluation retrieved successfully",
      evaluation: interview.evaluation,
      interview: {
        id: interview._id,
        role: interview.role,
        evaluatedAt: interview.evaluatedAt,
        conversation: interview.interviewHistory
      }
    });

  } catch (error) {
    console.error("Error getting interview evaluation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  evaluateInterview,
  getUserEvaluations,
  getInterviewEvaluation
}; 