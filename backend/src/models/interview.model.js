import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        trim: true,
        required: true
    },
    resume: {
        type: String,//url from cloudinary
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    isManualEnd: {
        type: Boolean,
        default: false
    },
    evaluation: {
        overallScore: Number,
        communication: {
            score: Number,
            feedback: String,
            strengths: [String],
            improvements: [String]
        },
        technicalKnowledge: {
            score: Number,
            feedback: String,
            strengths: [String],
            improvements: [String]
        },
        problemSolving: {
            score: Number,
            feedback: String,
            strengths: [String],
            improvements: [String]
        },
        experience: {
            score: Number,
            feedback: String,
            strengths: [String],
            improvements: [String]
        },
        culturalFit: {
            score: Number,
            feedback: String,
            strengths: [String],
            improvements: [String]
        },
        recommendation: String,
        keyStrengths: [String],
        areasForImprovement: [String],
        nextSteps: String
    },
    evaluatedAt: {
        type: Date,
        default: null
    },
    qa: [
        {
            question: String,
            answer: String,
            score: Number,
            category: String,
            feedback: String
        }
    ],
    summary: {
        overallScore: Number,
        suggestions: [String],
        strengths: [String],
        areasToImprove: [String]
    },
    interviewHistory: [
        {
            role: {
                type: String,
                enum: ['interviewer', 'candidate'],
                required: true
            },
            text: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true })

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;

