import Interview from "../models/interview.model.js";
import User from "../models/user.model.js";

const createInterview = async (req, res) =>{
    try{
        const candidate = req.user._id;
        if(!candidate){
            return res.status(400)
            .json({
                message: "User not found"
            })
        }
        const {role, time} = req.body;
        const resume = req.resumeUrl;
        if(!role || !time || !resume ) {
            return res.status(400)
            .json({
                message: "All fields are required"
            })
        };
        const newInterview = await Interview.create({
            candidate,
            role,
            time,
            resume
        })
        if(!newInterview){
            return res.status(500)
            .json({
                message: "Interview not created"
            })
        }
        await User.findByIdAndUpdate(
            req.user._id,
            { $push: { interviews: newInterview._id } },
            { new: true }
        );

        const interview = await Interview.findOne({candidate}).select("-candidate");
        return res.status(201).json({
            message: "Interview created successfully",
            interview: interview
        })
    }
    catch(err){
        console.log("Error: ", err );
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

export {createInterview};