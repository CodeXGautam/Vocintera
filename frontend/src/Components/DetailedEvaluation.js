import React from 'react';
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const DetailedEvaluation = ({ evaluation, interview, onBack }) => {
  if (!evaluation) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold mb-2">No Evaluation Data</h3>
        <p className="text-center">This interview hasn't been evaluated yet</p>
        <button 
          onClick={onBack}
          className="mt-4 flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FaArrowLeft />
          Back
        </button>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-900/20 border-green-700';
    if (score >= 60) return 'bg-yellow-900/20 border-yellow-700';
    return 'bg-red-900/20 border-red-700';
  };

  const categories = [
    { key: 'communication', label: 'Communication', icon: '💬' },
    { key: 'technicalKnowledge', label: 'Technical Knowledge', icon: '⚙️' },
    { key: 'problemSolving', label: 'Problem Solving', icon: '🧩' },
    { key: 'experience', label: 'Experience', icon: '💼' },
    { key: 'culturalFit', label: 'Cultural Fit', icon: '🤝' }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Interview Evaluation</h2>
          <p className="text-gray-400">
            {interview?.role} • {new Date(interview?.evaluatedAt).toLocaleDateString()}
          </p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
        >
          <FaArrowLeft />
          Back
        </button>
      </div>

      {/* Overall Score */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Overall Performance</h3>
          <div className={`text-3xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
            {evaluation.overallScore}%
          </div>
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              evaluation.overallScore >= 80 ? 'bg-green-500' :
              evaluation.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${evaluation.overallScore}%` }}
          ></div>
        </div>

        <div className="text-gray-300">
          <p className="font-semibold mb-2">Recommendation:</p>
          <p className="text-blue-400">{evaluation.recommendation}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const categoryData = evaluation[category.key];
          if (!categoryData) return null;

          return (
            <div key={category.key} className={`bg-slate-800 p-4 rounded-lg border ${getScoreBgColor(categoryData.score)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  <h4 className="font-semibold text-white">{category.label}</h4>
                </div>
                <div className={`text-xl font-bold ${getScoreColor(categoryData.score)}`}>
                  {categoryData.score}%
                </div>
              </div>

              <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    categoryData.score >= 80 ? 'bg-green-500' :
                    categoryData.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${categoryData.score}%` }}
                ></div>
              </div>

              <p className="text-gray-300 text-sm mb-3">{categoryData.feedback}</p>

              {/* Strengths */}
              {categoryData.strengths && categoryData.strengths.length > 0 && (
                <div className="mb-3">
                  <p className="text-green-400 text-sm font-semibold mb-1">Strengths:</p>
                  <ul className="space-y-1">
                    {categoryData.strengths.map((strength, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-center gap-2">
                        <FaCheckCircle className="text-green-400 text-xs" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {categoryData.improvements && categoryData.improvements.length > 0 && (
                <div>
                  <p className="text-yellow-400 text-sm font-semibold mb-1">Areas for Improvement:</p>
                  <ul className="space-y-1">
                    {categoryData.improvements.map((improvement, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-center gap-2">
                        <FaExclamationTriangle className="text-yellow-400 text-xs" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Strengths */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
            <FaCheckCircle />
            Key Strengths
          </h4>
          <ul className="space-y-2">
            {evaluation.keyStrengths?.map((strength, idx) => (
              <li key={idx} className="text-gray-300 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h4 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
            <FaExclamationTriangle />
            Areas for Improvement
          </h4>
          <ul className="space-y-2">
            {evaluation.areasForImprovement?.map((area, idx) => (
              <li key={idx} className="text-gray-300 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-slate-800 p-4 rounded-lg border border-blue-700">
        <h4 className="text-blue-400 font-semibold mb-3">Next Steps</h4>
        <p className="text-gray-300">{evaluation.nextSteps}</p>
      </div>

      {/* Interview Conversation Preview */}
      {interview?.conversation && interview.conversation.length > 0 && (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h4 className="text-white font-semibold mb-3">Interview Conversation</h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {interview.conversation.slice(0, 10).map((entry, idx) => (
              <div key={idx} className="text-sm">
                <span className={`font-semibold ${
                  entry.role === 'assistant' ? 'text-blue-400' : 'text-green-400'
                }`}>
                  {entry.role === 'assistant' ? 'AI Interviewer' : 'You'}:
                </span>
                <span className="text-gray-300 ml-2">
                  {entry.text.length > 100 ? `${entry.text.substring(0, 100)}...` : entry.text}
                </span>
              </div>
            ))}
            {interview.conversation.length > 10 && (
              <p className="text-gray-500 text-sm italic">
                ... and {interview.conversation.length - 10} more exchanges
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedEvaluation; 