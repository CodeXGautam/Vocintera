import { useState } from "react";
import { FaMicrophone } from "react-icons/fa6";
import { FaMicrophoneSlash } from "react-icons/fa";
import { MdCallEnd } from "react-icons/md";


const InterviewRoom = () => {

    const [mic, setMic] = useState(false);

    const micHandler = () => {
        setMic(!mic);
    };

    return (
        <div className="flex flex-col gap-3 h-screen p-5">

            <div className="flex items-center justify-center font-extrabold text-3xl text-slate-200">
                Vocintera
            </div>

             <div className="flex items-center justify-center font-semibold text-md text-blue-800">
                Interview Panel
            </div>

            <div className="flex w-[100%] h-[100%] gap-5">
                <div className="flex flex-col gap-2 justify-center items-center w-[100%] bg-slate-900 
                shadow-md shadow-blue-800 rounded-md hover:bg-slate-800">
                    <div className="w-[100px] h-[100px] rounded-full bg-slate-700 border-2 border-slate-300"></div>
                    <div className="flex items-center font-semibold text-blue-600">
                        Vocintera
                    </div>
                </div>

                <div className="flex flex-col gap-2 justify-center items-center w-[100%] bg-slate-900
                shadow-md shadow-blue-800 rounded-md hover:bg-slate-800">
                    <div className="w-[100px] h-[100px] rounded-full bg-slate-700 border-2 border-slate-300"></div>
                    <div className="flex items-center font-semibold text-blue-600">
                        User
                    </div>
                </div>
            </div>

            <div className="flex w-[100%] justify-center items-center gap-4 mt-3">
                <div>
                    {
                        mic ? (
                            <button className="flex justify-center items-center rounded-full p-2 text-400 hover:text-500
                            bg-slate-700 hover:bg-slate-600 text-xl" onClick={micHandler}>
                                <FaMicrophone />
                            </button>
                        )
                            :
                            <button className="flex justify-center items-center rounded-full p-2 text-400 hover:text-500
                            bg-slate-700 hover:bg-slate-600 text-xl" onClick={micHandler}>
                                <FaMicrophoneSlash />
                            </button>
                    }
                </div>

                <button className="flex justify-center items-center p-3 rounded-xl bg-red-800 text-xl text-slate-400
                hover:text-300 font-semibold hover:bg-red-700">
                    <MdCallEnd />
                </button>
            </div>
        </div>
    )
}

export default InterviewRoom;
