import mongoose from 'mongoose';
import User from '../models/user.model.js';


const generateAccessRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return {
            accessToken,
            refreshToken
        };
    }
    catch (error) {
        console.error("Error generating tokens:", error.message);
        throw new Error("Token generation failed");
    };

};

const registerUser = async (req, res) => {
    //registering user

    try {
        const { firstname, lastname, username, email, password } = req.body;

        if (!firstname || !lastname || !username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        };

        if (password.lenghth < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        };

        //checking for existing user 
        const existingUser = await User.findOne({
            $or: [{ email }, { username}]
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        };

        //creating new user 

        const newUser = await User.create({
            firstname,
            lastname,
            username: username,
            email: email,
            password
        });

        if (!newUser) {
            return res.status(500).json({ message: "User registration failed" });
        };

        const { accessToken, refreshToken } = await generateAccessRefreshToken(newUser._id);
        const user = await User.findById(newUser._id).select("-password -refreshToken");

        console.log('AccessToken',accessToken,'refreshToken',refreshToken);

        const options = {
            httpOnly: true,
            secure: false,
        };

        res.status(201)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({ user, message: "User registered successfully" });

    } catch (error) {
        console.error("Error registering user:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }

}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        };

        const user = await User.findById({ email: email});
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        };

        const isPasswordCorrect = await user.isPasswordCorrect(password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const { accessToken, refreshToken } = await generateAccessRefreshToken(user._id);
        console.log(accessToken, refreshToken)

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: false,
        };

        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                accessToken,
                refreshToken,
                user: loggedInUser,
                message: "Login successful"
            });
    } catch (error) {
        console.error("Error logging in user:", error.message);
        res.status(500).json({ message: "Internal server error" });
    };
};

// Get current user
const getcurrentUser = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User fetched successfully",
            user,
        });

    } catch (error) {
        console.error("Error fetching current user:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

const logoutUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.refreshToken = undefined;
        await user.save({ validateBeforeSave: false });

        const options = {
            httpOnly: true,
            secure: false,
        };

        return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({ message: "Logged out successfully" });

    } catch (error) {
        console.error("Error logging out user:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Refresh access token
const refreshAccessToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ message: "Token not found" });
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken._id);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        if (incomingRefreshToken !== user.refreshToken) {
            return res.status(401).json({ message: "Token expired or already used" });
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessandRefreshToken(user._id);

        const options = {
            httpOnly: true,
            secure: false,
        };

        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json({
                message: "Access token refreshed",
                accessToken,
                refreshToken: newRefreshToken
            });

    } catch (error) {
        console.error("Refresh token error:", error.message);
        res.status(403).json({ message: "Invalid or expired refresh token" });
    }
};


export {
    registerUser,
    loginUser,
    getcurrentUser,
    logoutUser,
    refreshAccessToken
};