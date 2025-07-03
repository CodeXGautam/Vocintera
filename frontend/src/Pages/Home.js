import { BiSolidDashboard } from "react-icons/bi";
import { useNavigate } from 'react-router';
import Footer from "../Components/Footer";
import Sidebar from "../Components/Sidebar";



const Home = (props) => {

    const loggedIn = props.loggedIn;
    const setLoggedIn = props.setLoggedIn;

    // const [userInfo , setUserInfo] = useState({
    //     username:'',
    //     email:'',
    //     image:'',
    //     // interview:'',
    // });

    const navigate = useNavigate();

    const joinInterviewHandler = () => {
        // interview join button 
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

    // useEffect(() => {
    //     fetchUserInfo();
    // },[]);

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

                <div className="flex justify-between w-[100%] border-2 border-blue-900 p-4 rounded-xl">
                    <div className="flex flex-col gap-2 items-start">

                        {/* interview details will be fetched from backend  */}

                        <h2 className="flex text-gray-400 text-xl">Interview with Vocintera</h2>
                        <h2 className="flex text-blue-700 text-md">Software Development role</h2>
                        <button className="flex justify-center items-center bg-slate-700 text-slate-300 p-2 text-sm
                         rounded-md hover:bg-slate-600 hover:scale-[1.05] transition-all duration-300
                         shadow-md shadow-blue-700"
                            onClick={joinInterviewHandler}>
                            Join
                        </button>
                    </div>

                    <div className="flex justify-center items-center rounded-xl opacity-[0.4]">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPRwgKrfySS9Kd6_0DSFB6ZyVgpmScXBVI0w&s"
                      alt="interview" className="w-[100%] rounded-xl"/>
                    </div>

                </div>

                <h1 className="flex justify-start text-slate-400 font-semibold text-2xl">
                    Past Interview Performance
                </h1>

                <div className="flex gap-2 items-center w-[100%]">
                    {/* fetch past interview performance from backend  */}
                    <div className="flex flex-col gap-4 border-2 border-blue-900 p-4 rounded-xl w-[100%]">
                        <h2 className="flex justify-start items-center text-lg text-slate-400">Overall Performance</h2>
                        <div className="flex items-center justify-start text-md text-slate-400 font-bold">
                            {/* percentage */}
                            85%
                        </div>
                        <div>
                            {/* performance graph */}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 border-2 border-blue-900 p-4 rounded-xl w-[100%]">
                        <h2 className="flex justify-start items-center text-lg text-slate-400">Skill Breakdown</h2>
                        <div className="flex items-center justify-start text-md text-slate-400 font-bold">
                            {/* percentage */}
                            78%
                        </div>
                        <div>
                            {/* performance graph */}
                        </div>
                    </div>
                </div>

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
                <Footer />
            </div>

        </div>
    )
}

export default Home;