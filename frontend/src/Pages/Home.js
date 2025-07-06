import { BiSolidDashboard } from "react-icons/bi";
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import Footer from "../Components/Footer";
import Sidebar from "../Components/Sidebar";
import EvaluationCharts from "../Components/EvaluationCharts";
import StorageManager from "../Components/StorageManager";
import toast from "react-hot-toast";



const Home = (props) => {

    const loggedIn = props.loggedIn;
    const setLoggedIn = props.setLoggedIn;
    const [evaluationStats, setEvaluationStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [upcomingInterview, setUpcomingInterview] = useState(null);

    // const [userInfo , setUserInfo] = useState({
    //     username:'',
    //     email:'',
    //     image:'',
    //     // interview:'',
    // });

    const navigate = useNavigate();

    const joinInterviewHandler = (interviewId) => {
        // Navigate to interview room
        navigate(`/interviewroom/${interviewId}`);
    }

    const scheduleInterviewHandler = () =>{
        //schedule interview
        navigate('/interview');
    }

    const resourceHandler = () =>{
        //navigate to practice page
        navigate('/practice')
    }

    // const fetchUserInfo = async () =>{
    //     try {
    //         const res = await fetch(process.env.REACT_APP_BACKEND_URI + '/getUser',{
    //             method: 'GET',
    //             credentials: 'include',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //         });

    //         const data = await res.json();

    //         const user  = data.user;

    //         setUserInfo({
                
    //             // interview:user.interview,
    //         })

    //         console.log(userInfo);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    // Fetch evaluation statistics
    const fetchEvaluationStats = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_BACKEND_URI + '/evaluation/statistics', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setEvaluationStats(data.statistics);
            } else {
                console.error('Failed to fetch evaluation stats:', data.message);
            }
        } catch (error) {
            console.error('Error fetching evaluation stats:', error);
            toast.error('Failed to load evaluation data');
        } finally {
            setLoading(false);
        }
    };

    // Fetch upcoming interview
    const fetchUpcomingInterview = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_BACKEND_URI + '/getInterviewInfo', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (response.ok && Array.isArray(data.interviews)) {
                // Filter pending interviews (status false) and get the latest one
                const pendingInterviews = data.interviews.filter(interview => !interview.status);
                if (pendingInterviews.length > 0) {
                    // Sort by creation date (newest first) and get the latest
                    const latestInterview = pendingInterviews.sort((a, b) => 
                        new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id)
                    )[0];
                    setUpcomingInterview(latestInterview);
                } else {
                    setUpcomingInterview(null);
                }
            } else {
                setUpcomingInterview(null);
            }
        } catch (error) {
            console.error('Error fetching upcoming interview:', error);
            setUpcomingInterview(null);
        }
    };

    useEffect(() => {
        fetchEvaluationStats();
        fetchUpcomingInterview();
    }, []);

    return (
        <div className="flex w-[100%] min-h-screen relative gap-4 overflow-hidden">
            <Sidebar loggedIn = {loggedIn} setLoggedIn = {setLoggedIn}/>

            <div className="w-[100%] max-h-screen bg-slate-900 flex flex-col gap-8 transition-all
            duration-300 ease-in-out rounded-md shadow-md shadow-blue-500 p-5 overflow-y-scroll">

                <h1 className="flex  gap-2 justify-start items-center text-gray-300 font-semibold text-3xl">
                    <BiSolidDashboard /> Dashboard
                </h1>

                <h2 className="flex justify-start items-center text-gray-400 font-semibold text-2xl">
                    Upcoming Interviews
                </h2>

                {upcomingInterview ? (
                    <div className="flex justify-between w-[100%] border-2 border-blue-900 p-4 rounded-xl">
                        <div className="flex flex-col gap-2 items-start">
                            <h2 className="flex text-gray-400 text-xl">Interview with Vocintera</h2>
                            <h2 className="flex text-blue-700 text-md">{upcomingInterview.role}</h2>
                            <h2 className="flex justify-center text-gray-400 text-sm gap-2">
                                Scheduled for <span className="flex text-blue-700">{upcomingInterview.time}</span>
                            </h2>
                            <button className="flex justify-center items-center bg-slate-700 text-slate-300 p-2 text-sm
                             rounded-md hover:bg-slate-600 hover:scale-[1.05] transition-all duration-300
                             shadow-md shadow-blue-700"
                                onClick={() => joinInterviewHandler(upcomingInterview._id)}>
                                Join
                            </button>
                        </div>

                        <div className="flex justify-center items-center rounded-xl opacity-[0.4]">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPRwgKrfySS9Kd6_0DSFB6ZyVgpmScXBVI0w&s"
                              alt="interview" className="w-[100%] rounded-xl"/>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-gray-700 rounded-xl">
                        <div className="text-6xl mb-4">📅</div>
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No Upcoming Interviews</h3>
                        <p className="text-gray-500 text-center mb-4">You don't have any scheduled interviews at the moment</p>
                        <button 
                            className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                            onClick={scheduleInterviewHandler}
                        >
                            Schedule an Interview
                        </button>
                    </div>
                )}

                <h1 className="flex justify-start text-slate-400 font-semibold text-2xl">
                    Interview Performance Analytics
                </h1>

                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <EvaluationCharts statistics={evaluationStats} />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <div className="flex flex-col gap-4">
                        <h2 className="flex justify-start items-center text-xl font-semibold text-blue-800">
                            Quick Actions
                        </h2>

                        <div className="flex items-center justify-start gap-3">
                            <button className="flex items-center text-md p-2 justify-center bg-blue-800 text-slate-300
                            hover:text-slate-200 hover:scale-[1.05] hover:bg-blue-700 rounded-lg transition-all 
                            duration-300 ease-in-out shadow-md shadow-blue-600"
                            onClick={scheduleInterviewHandler}>
                                Schedule an Interview
                            </button>

                            <button className="flex items-center text-md p-2 justify-center bg-slate-700 text-slate-300
                            hover:text-slate-200 hover:scale-[1.05] hover:bg-slate-600 rounded-lg transition-all
                            duration-300 ease-in-out shadow-md shadow-blue-600"
                            onClick={resourceHandler}>
                                Resources
                            </button>
                        </div>
                    </div>

                    {/* Storage Management */}
                    <StorageManager />
                </div>
                <Footer />
            </div>

        </div>
    )
}

export default Home;