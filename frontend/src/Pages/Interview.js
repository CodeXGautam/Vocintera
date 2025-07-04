import { useEffect, useState } from "react";
import Footer from "../Components/Footer";
import Sidebar from "../Components/Sidebar";
import toast from "react-hot-toast";



const Interview = (props) => {

    const loggedIn = props.loggedIn;
    const setLoggedIn = props.setLoggedIn;

    const joinInterviewHandler = () => {
        console.log("INterview joined");
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

    const [interviews, setInterviews] = useState([
    ])

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
            // Expecting data.interviews to be an array
            setInterviews(Array.isArray(data.interviews) ? data.interviews : []);
        } catch (error) {
            console.log("Error : ", error);
        }
    }

    useEffect(()=>{
        getInterviewInfo();
    },[])

    return (
        <div className="flex w-[100%] relative gap-4 overflow-hidden">
            <Sidebar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />

            <div className="w-[100%] max-h-screen bg-slate-900 flex flex-col gap-8 transition-all
            duration-300 ease-in-out rounded-md shadow-md shadow-blue-500 p-5 overflow-y-scroll">

                <div className="flex flex-col gap-10">
                    <div className="flex flex-col min-h-screen rounded-xl p-4
                      border border-blue-950 gap-5">
                
                        <h2 className="flex justify-center items-center font-semibold text-blue-800 
                    text-3xl">
                            Your Interviews
                        </h2>        

                        {
                            interviews && interviews.length > 0 ? (
                                <div className="w-[100%] flex flex-col gap-5">
                                    {
                                        interviews.map((interview,idx) => {
                                            return (
                                                <div className="flex justify-between w-[100%] border-2 border-blue-900 p-4 rounded-xl" key={idx}>
                                                    <div className="flex flex-col gap-2 items-start">

                                                        {/* interview details will be fetched from backend  */}

                                                        <h2 className="flex text-gray-400 text-xl">Interview with Vocintera</h2>
                                                        <h2 className="flex text-blue-700 text-md">{interview.role}</h2>
                                                        <h2 className="flex justify-center text-gray-400 text-sm gap-2">Scheduled at <span className="flex text-blue-700">{interview.time}</span></h2>
                                                        <button className="flex justify-center items-center bg-slate-700 text-slate-300 p-2 text-sm
                                        rounded-md hover:bg-slate-600 hover:scale-[1.05] transition-all duration-300
                                        shadow-md shadow-blue-700"
                                                            onClick={joinInterviewHandler}>
                                                            Join
                                                        </button>
                                                    </div>

                                                    <div className="flex justify-center items-center rounded-xl opacity-[0.4]">
                                                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPRwgKrfySS9Kd6_0DSFB6ZyVgpmScXBVI0w&s"
                                                            alt="interview" className="w-[100%] rounded-xl" />
                                                    </div>

                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 w-[100%] h-[100%] justify-center items-center text-md text-slate-300 font-semibold">
                                    You have no interviews scheduled currently
                                    <button className="bg-blue-950 p-4 rounded-xl flex justify-center items-center text-gray-300 text-sm
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

                    <div className="flex flex-col gap-8 items-center mt-5" id="schedule">
                        <h1 className="flex text-blue-800 text-xl sm:text-2xl md:text-3xl lg:text-4xl
                         font-semibold text-center">Schedule An Interview</h1>
                        <form className='flex flex-col gap-5 border-2 shadow-md shadow-blue-900 w-[70%] max-w-[600px]
            border-slate-900 p-10 rounded-xl min-w-[300px]' onSubmit={submitHandler}>

                            <label htmlFor="role" className="text-gray-300 flex flex-col gap-2 w-[100%]">Role *
                                <select name="role" id="role" className="flex justify-center text-gray-300 text-sm items-center 
                  border-2 cursor-pointer border-gray-800 rounded-xl bg-slate-900 p-3" value={formData.role}
                                  
                                    onChange={changeHandler}>
                                    <option name='role' value="Software Developer">Software Developer</option>
                                    <option name='role' value="Product Management">Product Management</option>
                                    <option name='role' value="Data Scientist">Data Scientist</option>
                                    <option name='role' value="ML Engineer">ML Engineer</option>
                                    <option name='role' value="Data Analyst">Data Analyst</option>
                                </select>
                            </label>


                            <label htmlFor="time" className="text-gray-300 flex flex-col gap-2 w-[100%]">Time *
                                <input type="date" value={formData.time} id="time" name="time"
                                    className="flex justify-center text-gray-300 text-sm items-center border-2 border-gray-800 
                                    cursor-pointer rounded-xl bg-slate-900 p-3"
                                    onChange={changeHandler} />
                            </label>

                            <label htmlFor="resume" className="text-gray-300 flex flex-col gap-2 w-[100%]">Resume *
                                <input type="file" id="resume" name="resume"
                                    className="flex justify-center text-gray-300 text-sm items-center border-2 border-gray-800
                                    cursor-pointer rounded-xl bg-slate-900 p-3"
                                    onChange={changeHandler} />
                            </label>

                            <button className="bg-blue-950 p-4 rounded-xl flex justify-center items-center text-gray-200 
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