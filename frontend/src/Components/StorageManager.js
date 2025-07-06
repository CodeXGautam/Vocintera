import React, { useState, useEffect } from 'react';
import { FaDatabase, FaTrash, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StorageManager = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStorageStats();
    }, []);

    const fetchStorageStats = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_BACKEND_URI + '/interview/stats', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setStats(data);
            } else {
                console.error('Failed to fetch storage stats:', data.message);
            }
        } catch (error) {
            console.error('Error fetching storage stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStorageColor = (sizeMB) => {
        const size = parseFloat(sizeMB);
        if (size < 1) return 'text-green-400';
        if (size < 5) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getStorageIcon = (sizeMB) => {
        const size = parseFloat(sizeMB);
        if (size < 1) return '🟢';
        if (size < 5) return '🟡';
        return '🔴';
    };

    if (loading) {
        return (
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
                    <div className="h-8 bg-slate-700 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                        <div className="h-3 bg-slate-700 rounded"></div>
                        <div className="h-3 bg-slate-700 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="text-center text-gray-400">
                    <FaDatabase className="text-4xl mx-auto mb-2" />
                    <p>Storage information unavailable</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
                <FaDatabase className="text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Storage Management</h3>
            </div>

            {/* Storage Usage */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Storage Used</span>
                    <span className={`text-sm font-semibold ${getStorageColor(stats.storageSizeMB)}`}>
                        {stats.storageSizeMB} MB
                    </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                            parseFloat(stats.storageSizeMB) < 1 ? 'bg-green-500' :
                            parseFloat(stats.storageSizeMB) < 5 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ 
                            width: `${Math.min((parseFloat(stats.storageSizeMB) / 10) * 100, 100)}%` 
                        }}
                    ></div>
                </div>
                <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-gray-500">{getStorageIcon(stats.storageSizeMB)}</span>
                    <span className="text-xs text-gray-500">
                        {parseFloat(stats.storageSizeMB) < 1 ? 'Low usage' :
                         parseFloat(stats.storageSizeMB) < 5 ? 'Moderate usage' : 'High usage'}
                    </span>
                </div>
            </div>

            {/* Interview Statistics */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats.totalInterviews}</div>
                    <div className="text-xs text-gray-400">Total</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{stats.completedInterviews}</div>
                    <div className="text-xs text-gray-400">Completed</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats.pendingInterviews}</div>
                    <div className="text-xs text-gray-400">Pending</div>
                </div>
            </div>

            {/* Storage Policy Info */}
            <div className="bg-slate-700/50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-300">
                        <p className="font-semibold mb-1">Storage Policy:</p>
                        <ul className="space-y-1">
                            <li>• Only the 5 most recent interviews are kept</li>
                            <li>• Older interviews are automatically deleted</li>
                            <li>• This helps manage storage and improve performance</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Storage Breakdown */}
            <div className="mt-4">
                <h4 className="text-sm font-semibold text-white mb-2">Storage Breakdown</h4>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Interview History</span>
                        <span className="text-gray-300">
                            {((stats.estimatedStorageSize * 0.7) / (1024 * 1024)).toFixed(2)} MB
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Resume Files</span>
                        <span className="text-gray-300">
                            {((stats.estimatedStorageSize * 0.3) / (1024 * 1024)).toFixed(2)} MB
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StorageManager; 