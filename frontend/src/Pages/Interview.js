import { useEffect, useState } from "react";
import Footer from "../Components/Footer";
import Sidebar from "../Components/Sidebar";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaChartLine } from "react-icons/fa";



const Interview = (props) => {

    const loggedIn = props.loggedIn;
    const setLoggedIn = props.setLoggedIn;
    const navigate = useNavigate();

    const joinInterviewHandler = (interviewId) => {
        navigate(`/interviewroom/${interviewId}`);
    }

    const [formData, setFormData] = useState({
        role: "",
        time: "",
        resume: null
    })

    const changeHandler = (e) => {
        if (e.target.name === "resume") {
            setFormData({
                ...formData,
                resume: e.target.files[0]
            })
        } else {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value
            })
        }
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        console.log(formData);
        try {
            if (!formData.role || !formData.time || !formData.resume) {
                toast.error("All fields are required");
                return;
            }
            const dataToSend = new FormData();
            dataToSend.append("role", formData.role);
            dataToSend.append("time", formData.time);
            dataToSend.append("resume", formData.resume);
            const response = await fetch(process.env.REACT_APP_BACKEND_URI + '/createInterview', {
                method: "POST",
                credentials: "include",
                body: dataToSend
            })
            const data = await response.json();
            if (data.message === "Interview not created") {
                toast.error("Interview not Scheduled");
                return;
            }
            if (data.message === "All fields are required") {
                toast.error("All fields are required");
                return;
            }
            if (data.message === "Internal server error") {
                toast.error("Interview not scheduled try again");
                return;
            }
            if (data.message === "Interview created successfully") {
                toast.success("Interview Scheduled");
                setFormData({
                    role: "",
                    time: "",
                    resume: null
                });
                getInterviewInfo();
            }
        } catch (error) {
            console.log("Error: ", error);
        }
    }

    const [interviews, setInterviews] = useState([]);
    const [completedInterviews, setCompletedInterviews] = useState([]);

    const getInterviewInfo = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_BACKEND_URI + '/getInterviewInfo', {
                method: "GET",
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            const data = await response.json();
            
            if (Array.isArray(data.interviews)) {
                // Filter pending interviews (status false)
                const pendingInterviews = data.interviews.filter(interview => !interview.status);
                setInterviews(pendingInterviews);
                
                // Filter completed interviews (status true)
                const completedInterviews = data.interviews.filter(interview => interview.status);
                setCompletedInterviews(completedInterviews);
            } else {
                setInterviews([]);
                setCompletedInterviews([]);
            }
        } catch (error) {
            console.log("Error : ", error);
        }
    }

    const evaluateInterview = async (interviewId) => {
        try {
            const response = await fetch(process.env.REACT_APP_BACKEND_URI + `/evaluation/${interviewId}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                toast.success('Interview evaluated successfully!');
                getInterviewInfo(); // Refresh the list
            } else {
                toast.error(data.message || 'Failed to evaluate interview');
            }
        } catch (error) {
            console.error('Error evaluating interview:', error);
            toast.error('Failed to evaluate interview');
        }
    };

    useEffect(()=>{
        getInterviewInfo();
    },[])

    return (
        <div className="flex flex-col lg:flex-row w-full relative gap-2 sm:gap-3 md:gap-4 overflow-hidden">
            <Sidebar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />

            <div className="w-full lg:w-[calc(100%-250px)] max-h-screen bg-slate-900 flex flex-col gap-4 sm:gap-5 md:gap-6 lg:gap-8 transition-all
            duration-300 ease-in-out rounded-md shadow-md shadow-blue-500 p-2 sm:p-3 md:p-4 lg:p-5 overflow-y-scroll">

                <div className="flex flex-col gap-6 sm:gap-8 md:gap-10">
                    <div className="flex flex-col min-h-screen rounded-xl p-2 sm:p-3 md:p-4
                      border border-blue-950 gap-3 sm:gap-4 md:gap-5">
                
                        <h2 className="flex justify-center items-center font-semibold text-blue-800 
                    text-xl sm:text-2xl md:text-3xl">
                            Your Interviews
                        </h2>        

                        {
                            interviews && interviews.length > 0 ? (
                                <div className="w-full flex flex-col gap-3 sm:gap-4 md:gap-5">
                                    {
                                        interviews.map((interview,idx) => {
                                            return (
                                                <div className="flex flex-col md:flex-row justify-between w-full border-2 border-blue-900 p-2 sm:p-3 md:p-4 rounded-xl" key={idx}>
                                                    <div className="flex flex-col gap-1 sm:gap-2 items-start">

                                                        {/* interview details will be fetched from backend  */}

                                                        <h2 className="flex text-gray-400 text-lg sm:text-xl">Interview with Vocintera</h2>
                                                        <h2 className="flex text-blue-700 text-sm sm:text-md">{interview.role}</h2>
                                                        <h2 className="flex justify-center text-gray-400 text-xs sm:text-sm gap-2">Scheduled at <span className="flex text-blue-700">{interview.time}</span></h2>
                                                        <button className="flex justify-center items-center bg-slate-700 text-slate-300 p-1.5 sm:p-2 text-xs sm:text-sm
                                        rounded-md hover:bg-slate-600 hover:scale-[1.05] transition-all duration-300
                                        shadow-md shadow-blue-700"
                                            onClick={() => joinInterviewHandler(interview._id)}>
                                            Join
                                                        </button>
                                                    </div>

                                                    <div className="flex justify-center items-center rounded-xl opacity-[0.4] mt-2 sm:mt-3 md:mt-0">
                                                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPRwgKrfySS9Kd6_0DSFB6ZyVgpmScXBVI0w&s"
                                                            alt="interview" className="w-full max-w-[150px] sm:max-w-[180px] md:max-w-[150px] rounded-xl" />
                                                    </div>

                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 sm:gap-4 w-[100%] h-[100%] justify-center items-center text-sm sm:text-md text-slate-300 font-semibold">
                                    You have no interviews scheduled currently
                                    <button className="bg-blue-950 p-3 sm:p-4 rounded-xl flex justify-center items-center text-gray-300 text-xs sm:text-sm
                                        rounded-md hover:bg-blue-800 hover:scale-[1.05] transition-all duration-300
                                        shadow-md shadow-blue-700"
                                        onClick={() => {
                                            document.getElementById("schedule").scrollIntoView({ behavior: "smooth" });
                                        }}>
                                        Schedule an Interview
                                    </button>
                                </div>
                            )
                        }

                    </div>

                    {/* Completed Interviews Section */}
                    {completedInterviews.length > 0 && (
                        <div className="flex flex-col min-h-screen rounded-xl p-2 sm:p-3 md:p-4 border border-green-950 gap-3 sm:gap-4 md:gap-5">
                            <h2 className="flex justify-center items-center font-semibold text-green-600 
                                text-lg sm:text-xl md:text-2xl">
                                Completed Interviews
                            </h2>        

                            <div className="w-full flex flex-col gap-3 sm:gap-4 md:gap-5">
                                {completedInterviews.map((interview, idx) => (
                                    <div className="flex flex-col md:flex-row justify-between w-full border-2 border-green-900 p-2 sm:p-3 md:p-4 rounded-xl" key={idx}>
                                        <div className="flex flex-col gap-1 sm:gap-2 items-start">
                                            <h2 className="flex text-gray-400 text-lg sm:text-xl">Interview with Vocintera</h2>
                                            <h2 className="flex text-blue-700 text-sm sm:text-md">{interview.role}</h2>
                                            <h2 className="flex justify-center text-gray-400 text-xs sm:text-sm gap-2">
                                                Completed at <span className="flex text-blue-700">
                                                    {new Date(interview.completedAt).toLocaleDateString()}
                                                </span>
                                            </h2>
                                            
                                            {interview.evaluation ? (
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <span className="text-green-400 text-xs sm:text-sm">
                                                        ✅ Evaluated ({interview.evaluation.overallScore}%)
                                                    </span>
                                                    <button 
                                                        className="flex justify-center items-center bg-blue-700 text-white p-1.5 sm:p-2 text-xs sm:text-sm
                                                            rounded-md hover:bg-blue-600 hover:scale-[1.05] transition-all duration-300
                                                            shadow-md shadow-blue-700"
                                                        onClick={() => navigate(`/evaluation/${interview._id}`)}
                                                    >
                                                        <FaChartLine className="mr-1" />
                                                        View Details
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    className="flex justify-center items-center bg-green-700 text-white p-1.5 sm:p-2 text-xs sm:text-sm
                                                        rounded-md hover:bg-green-600 hover:scale-[1.05] transition-all duration-300
                                                        shadow-md shadow-green-700"
                                                    onClick={() => evaluateInterview(interview._id)}
                                                >
                                                    <FaChartLine className="mr-1" />
                                                    Evaluate Interview
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex justify-center items-center rounded-xl opacity-[0.4] mt-2 sm:mt-3 md:mt-0">
                                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPRwgKrfySS9Kd6_0DSFB6ZyVgpmScXBVI0w&s"
                                                alt="interview" className="w-full max-w-[150px] sm:max-w-[180px] md:max-w-[150px] rounded-xl" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-6 sm:gap-7 md:gap-8 items-center mt-5" id="schedule">
                        <h1 className="flex text-blue-800 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl
                         font-semibold text-center">Schedule An Interview</h1>
                        <form className='flex flex-col gap-4 sm:gap-5 border-2 shadow-md shadow-blue-900 w-full sm:w-[95%] md:w-[85%] lg:w-[75%] xl:w-[70%] max-w-[600px]
            border-slate-900 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 rounded-xl min-w-[280px]' onSubmit={submitHandler}>

                            <label htmlFor="role" className="text-gray-300 flex flex-col gap-1 sm:gap-2 w-[100%]">Role *
                                <select name="role" id="role" className="flex justify-center text-gray-300 text-xs sm:text-sm items-center 
                  border-2 cursor-pointer border-gray-800 rounded-xl bg-slate-900 p-2 sm:p-3" value={formData.role}
                                  
                                    onChange={changeHandler}>
                                    <option name='role' value="Software Developer">Software Developer</option>
                                    <option name='role' value="Product Management">Product Management</option>
                                    <option name='role' value="Data Scientist">Data Scientist</option>
                                    <option name='role' value="ML Engineer">ML Engineer</option>
                                    <option name='role' value="Data Analyst">Data Analyst</option>
                                </select>
                            </label>


                            <label htmlFor="time" className="text-gray-300 flex flex-col gap-1 sm:gap-2 w-[100%]">Time *
                                <input type="date" value={formData.time} id="time" name="time"
                                    className="flex justify-center text-gray-300 text-xs sm:text-sm items-center border-2 border-gray-800 
                                    cursor-pointer rounded-xl bg-slate-900 p-2 sm:p-3"
                                    onChange={changeHandler} />
                            </label>

                            <label htmlFor="resume" className="text-gray-300 flex flex-col gap-1 sm:gap-2 w-[100%]">Resume *
                                <input type="file" id="resume" name="resume"
                                    className="flex justify-center text-gray-300 text-xs sm:text-sm items-center border-2 border-gray-800
                                    cursor-pointer rounded-xl bg-slate-900 p-2 sm:p-3"
                                    onChange={changeHandler} />
                            </label>

                            <button className="bg-blue-950 p-3 sm:p-4 rounded-xl flex justify-center items-center text-gray-200 text-sm sm:text-base
                hover:bg-blue-800 transition-all duration-200 hover:scale-[1.05] hover:text-gray-100 shadow-lg shadow-blue-500">
                                Schedule
                            </button>
                        </form>
                    </div>

                </div>

                <Footer />
            </div>

        </div>
    )
}

export default Interview;