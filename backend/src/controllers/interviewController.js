import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";

// Function to create a new interview
const createInterview = async (req, res) => {
    try {
        const { role, time } = req.body;
        const resumeUrl = req.resumeUrl; // Get the resume URL from the uploadResume middleware
        const userId = req.user._id;

        if (!role || !time || !resumeUrl) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Create the new interview
        const interview = new Interview({
            candidate: userId,
            role,
            time,
            resume: resumeUrl // Use the Cloudinary URL
        });

        await interview.save();

        // Clean up old interviews after creating new one
        await cleanupOldInterviews(userId);

        res.status(201).json({ message: "Interview created successfully", interview });
    } catch (error) {
        console.error("Error creating interview:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Function to clean up old interviews and keep only the past 5
const cleanupOldInterviews = async (userId) => {
    try {
        // Get all interviews for the user, sorted by creation date (newest first)
        const allInterviews = await Interview.find({ candidate: userId })
            .sort({ createdAt: -1 });

        // If user has more than 5 interviews, delete the oldest ones
        if (allInterviews.length > 5) {
            const interviewsToDelete = allInterviews.slice(5); // Get interviews beyond the first 5
            const interviewIdsToDelete = interviewsToDelete.map(interview => interview._id);

            // Delete the old interviews
            const deleteResult = await Interview.deleteMany({
                _id: { $in: interviewIdsToDelete }
            });

            console.log(`🧹 Cleaned up ${deleteResult.deletedCount} old interviews for user ${userId}`);
        }
    } catch (error) {
        console.error("Error cleaning up old interviews:", error);
    }
};

// Function to get interview information
const getInterviewInfo = async (req, res) => {
    try {
        const userId = req.user._id;

        const interviews = await Interview.find({ candidate: userId })
            .sort({ createdAt: -1 }) // Sort by newest first
            .limit(5); // Limit to 5 interviews

        res.status(200).json({ interviews });
    } catch (error) {
        console.error("Error getting interview info:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Function to manually trigger cleanup for all users
const cleanupAllUsersInterviews = async (req, res) => {
    try {
        const users = await User.find({});
        let totalDeleted = 0;

        for (const user of users) {
            const allInterviews = await Interview.find({ candidate: user._id })
                .sort({ createdAt: -1 });

            if (allInterviews.length > 5) {
                const interviewsToDelete = allInterviews.slice(5);
                const interviewIdsToDelete = interviewsToDelete.map(interview => interview._id);

                const deleteResult = await Interview.deleteMany({
                    _id: { $in: interviewIdsToDelete }
                });

                totalDeleted += deleteResult.deletedCount;
                console.log(`🧹 Cleaned up ${deleteResult.deletedCount} old interviews for user ${user._id}`);
            }
        }

        res.status(200).json({ 
            message: "Cleanup completed successfully", 
            totalDeleted,
            usersProcessed: users.length 
        });
    } catch (error) {
        console.error("Error in bulk cleanup:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Function to get interview statistics for storage management
const getInterviewStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const totalInterviews = await Interview.countDocuments({ candidate: userId });
        const completedInterviews = await Interview.countDocuments({ 
            candidate: userId, 
            status: true 
        });
        const pendingInterviews = await Interview.countDocuments({ 
            candidate: userId, 
            status: false 
        });

        // Get storage info
        const interviews = await Interview.find({ candidate: userId })
            .select('interviewHistory resume createdAt')
            .sort({ createdAt: -1 });

        let totalStorageSize = 0;
        interviews.forEach(interview => {
            // Estimate storage size (rough calculation)
            const historySize = JSON.stringify(interview.interviewHistory || []).length;
            const resumeSize = interview.resume ? interview.resume.length : 0;
            totalStorageSize += historySize + resumeSize;
        });

        res.status(200).json({
            totalInterviews,
            completedInterviews,
            pendingInterviews,
            estimatedStorageSize: totalStorageSize, // in bytes
            storageSizeMB: (totalStorageSize / (1024 * 1024)).toFixed(2)
        });
    } catch (error) {
        console.error("Error getting interview stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export {
    createInterview,
    getInterviewInfo,
    cleanupOldInterviews,
    cleanupAllUsersInterviews,
    getInterviewStats
};