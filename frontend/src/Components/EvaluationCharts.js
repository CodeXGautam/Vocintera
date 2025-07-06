import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const EvaluationCharts = ({ statistics }) => {
  if (!statistics || statistics.totalInterviews === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold mb-2">No Evaluation Data</h3>
        <p className="text-center">Complete some interviews to see your performance analytics</p>
      </div>
    );
  }

  // Category scores data for bar chart
  const categoryData = {
    labels: [
      'Communication',
      'Technical Knowledge',
      'Problem Solving',
      'Experience',
      'Cultural Fit'
    ],
    datasets: [
      {
        label: 'Your Score',
        data: [
          statistics.categoryAverages.communication || 0,
          statistics.categoryAverages.technicalKnowledge || 0,
          statistics.categoryAverages.problemSolving || 0,
          statistics.categoryAverages.experience || 0,
          statistics.categoryAverages.culturalFit || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  // Overall score data for doughnut chart
  const overallScoreData = {
    labels: ['Your Score', 'Remaining'],
    datasets: [
      {
        data: [statistics.averageScore, 100 - statistics.averageScore],
        backgroundColor: [
          statistics.averageScore >= 80 ? 'rgba(16, 185, 129, 0.8)' :
          statistics.averageScore >= 60 ? 'rgba(245, 158, 11, 0.8)' : 'rgba(239, 68, 68, 0.8)',
          'rgba(75, 85, 99, 0.2)'
        ],
        borderColor: [
          statistics.averageScore >= 80 ? 'rgba(16, 185, 129, 1)' :
          statistics.averageScore >= 60 ? 'rgba(245, 158, 11, 1)' : 'rgba(239, 68, 68, 1)',
          'rgba(75, 85, 99, 0.5)'
        ],
        borderWidth: 2,
        cutout: '70%',
      }
    ]
  };

  // Recent scores data for line chart
  const recentScoresData = {
    labels: statistics.recentScores.map((score, index) => 
      `Interview ${statistics.recentScores.length - index}`
    ).reverse(),
    datasets: [
      {
        label: 'Overall Score',
        data: statistics.recentScores.map(score => score.score).reverse(),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Performance by Category',
        color: '#e2e8f0',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: '#e2e8f0',
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: '#e2e8f0',
          font: {
            size: 12
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Overall Performance',
        color: '#e2e8f0',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Recent Performance Trend',
        color: '#e2e8f0',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: '#e2e8f0',
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: '#e2e8f0',
          font: {
            size: 12
          }
        }
      }
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'Improving':
        return '📈';
      case 'Declining':
        return '📉';
      default:
        return '➡️';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Interviews</p>
              <p className="text-2xl font-bold text-white">{statistics.totalInterviews}</p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Average Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(statistics.averageScore)}`}>
                {statistics.averageScore}%
              </p>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Trend</p>
              <p className="text-2xl font-bold text-white">{statistics.improvementTrend}</p>
            </div>
            <div className="text-3xl">{getTrendIcon(statistics.improvementTrend)}</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance Bar Chart */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="h-80">
            <Bar data={categoryData} options={barOptions} />
          </div>
        </div>

        {/* Overall Score Doughnut Chart */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="h-80 relative">
            <Doughnut data={overallScoreData} options={doughnutOptions} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(statistics.averageScore)}`}>
                  {statistics.averageScore}%
                </div>
                <div className="text-gray-400 text-sm">Average</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Performance Line Chart */}
      {statistics.recentScores.length > 1 && (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="h-80">
            <Line data={recentScoresData} options={lineOptions} />
          </div>
        </div>
      )}

      {/* Performance Insights */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-green-400 font-semibold mb-2">Top Performing Areas</h4>
            <ul className="space-y-1">
              {Object.entries(statistics.categoryAverages)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .map(([category, score]) => (
                  <li key={category} className="text-gray-300 text-sm">
                    {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {score}%
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <h4 className="text-yellow-400 font-semibold mb-2">Areas for Improvement</h4>
            <ul className="space-y-1">
              {Object.entries(statistics.categoryAverages)
                .sort(([,a], [,b]) => a - b)
                .slice(0, 3)
                .map(([category, score]) => (
                  <li key={category} className="text-gray-300 text-sm">
                    {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {score}%
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationCharts; 