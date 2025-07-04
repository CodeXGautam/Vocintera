import Interview from "../models/interview.model.js";

const createInterview = async (req, res) =>{
    try{
        const {candidate} = req.user;
        if(!candidate){
            return res.status(400)
            .json({
                message: "User not found"
            })
        }
        const {role, time , resume} = req.body;

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