import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    candidate : {
        type : mongoose.Schema.Types.ObjectId,
        ref:"User",
        required : true
    },
    role : {
        type : String,
        required : true
    },
    time : {
        type : Date,
        trim:true,
        required : true
    },
    resume : {
        type : String,//url from cloudinary
        required : true
    },
    status : {
        type : Boolean,
        default: "false"
    },
    performance : [

    ]
}, {timestamps:true})

const Interview = mongoose.model("Interview",interviewSchema);
export default Interview;

