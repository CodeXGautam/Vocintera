import { IoHome } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { RiMenuUnfold2Line } from "react-icons/ri";
import { RiMenuUnfoldLine } from "react-icons/ri";
import { NavLink, useNavigate } from 'react-router';
import { DiCode } from "react-icons/di";
import { SlCalender } from "react-icons/sl";
import { useState } from "react";

const Sidebar = (props) =>{

    const setLoggedIn = props.setLoggedIn;

    const [menuBar, setMenuBar] = useState(true);


    const navigate = useNavigate();

    const menuHandler = () => {
        if (menuBar === true) {
            document.querySelector('.menu').classList.add('transform', 'translate-x-[-80%]','bg-transparent',);
            document.querySelector('.menu-icon').classList.add('bg-slate-500', 'text-white','p-2', 'rounded-full')
            document.querySelector('.menu').classList.remove('shadow-md');
            document.querySelector('.menu-items').classList.remove('active');
            setMenuBar(false);
        }
        else if (menuBar === false) {
            document.querySelector('.menu').classList.remove('transform', 'translate-x-[-80%]', 'bg-transparent');
            document.querySelector('.menu-icon').classList.remove('bg-slate-500', 'text-white','p-2', 'rounded-full')
            document.querySelector('.menu').classList.add('shadow-md');
            document.querySelector('.menu-items').classList.add('active');
            setMenuBar(true);
        }
    }

    const logoutHandler = () => {
        navigate('/');
        setLoggedIn(false);
    }

    return(
        <div className="">
                        <div className="menu w-[23%] min-w-[240px] fixed left-0 top-0 h-screen bg-slate-900 p-5 rounded-md flex flex-col
               justify-between items-center shadow-md shadow-blue-800 md:hidden lg:hidden xl:hidden 2xl:hidden
               transition-all duration-300 ease-in-out">
                <div className="flex flex-col gap-5 w-[100%]">



                    <div className="flex justify-between items-center w-[100%] mb-5">

                        <h1 className='text-[#b5b5b5a4] bg-clip-text animate-shine font-extrabold text-3xl flex
                            items-center justify-center'
                            style={{
                                backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
                                backgroundSize: '200% 100%',
                                WebkitBackgroundClip: 'text',
                                animationDuration: '5s'
                            }}>
                            Vocintera
                        </h1>

                        <div className="flex justify-center items-center text-xl text-slate-300 hover:text-white
                         cursor-pointer menu-icon" onClick={menuHandler}>
                            {
                                menuBar ? <RiMenuUnfold2Line /> : <RiMenuUnfoldLine />
                            }
                        </div>

                    </div>

                    <div className="flex justify-start items-center gap-4">
                        <span className="w-[40px] h-[40px] rounded-full bg-blue-700 shadow-md shadow-blue-500"></span>
                        {/* user's firstname */}
                        <span className="text-white font-semibold"> Hi User</span>
                    </div>

                    <NavLink to='/home' className="flex justify-start items-center text-slate-300 hover:text-white
                    hover:bg-slate-800 rounded-lg p-2 cursor-pointer w-[100%] gap-4 menu-items">
                        <IoHome /> Home
                    </NavLink>
                    <NavLink to='/practice' className="flex justify-start items-center text-slate-300 hover:text-white
                    hover:bg-slate-800 rounded-lg p-2 cursor-pointer w-[100%] gap-4 menu-items">
                        <DiCode /> Practice
                    </NavLink>
                    <NavLink to='/interview' className="flex justify-start items-center text-slate-300 hover:text-white
                    hover:bg-slate-800 rounded-lg p-2 cursor-pointer w-[100%] gap-4 menu-items">
                        <SlCalender /> Interviews
                    </NavLink>
                    <NavLink to='/settings' className="flex justify-start items-center text-slate-300 hover:text-white
                    hover:bg-slate-800 rounded-lg p-2 cursor-pointer w-[100%] gap-4 menu-items">
                        <IoSettingsOutline /> Settings
                    </NavLink>
                </div>

                <button className="flex justify-center items-center text-red-500 hover:text-red-600
                    hover:bg-slate-800 rounded-lg p-2 cursor-pointer w-[100%]"
                    onClick={logoutHandler}>
                    Logout
                </button>
            </div>

            <div className="w-[25%] min-w-[220px] h-screen bg-slate-900 p-5 rounded-md flex flex-col
               justify-between items-center shadow-md shadow-blue-800 hidden md:flex lg:flex xl:flex 2xl:flex
               transition-all duration-300 ease-in-out">
                <div className="flex flex-col gap-5 w-[100%]">

                    <h1 className='text-[#b5b5b5a4] mb-5 bg-clip-text inline-block animate-shine font-extrabold text-3xl'
                        style={{
                            backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
                            backgroundSize: '200% 100%',
                            WebkitBackgroundClip: 'text',
                            animationDuration: '5s'
                        }}>
                        Vocintera
                    </h1>

                    <div className="flex justify-start items-center gap-4">
                        <span className="w-[40px] h-[40px] rounded-full bg-blue-700 shadow-md shadow-blue-500"></span>
                        {/* user's firstname */}
                        <span className="text-white font-semibold"> Hi User</span>
                    </div>


                    <NavLink to='/home' className="flex justify-start items-center text-slate-300 hover:text-white
                    hover:bg-slate-800 rounded-lg p-2 cursor-pointer w-[100%] gap-4">
                        <IoHome /> Home
                    </NavLink>
                    <NavLink to='/practice' className="flex justify-start items-center text-slate-300 hover:text-white
                    hover:bg-slate-800 rounded-lg p-2 cursor-pointer w-[100%] gap-4">
                        <DiCode /> Practice
                    </NavLink>

                    <NavLink to='/interview' className="flex justify-start items-center text-slate-300 hover:text-white
                    hover:bg-slate-800 rounded-lg p-2 cursor-pointer w-[100%] gap-4">
                        <SlCalender /> Interviews
                    </NavLink>

                    <NavLink to='/settings' className="flex justify-start items-center text-slate-300 hover:text-white
                    hover:bg-slate-800 rounded-lg p-2 cursor-pointer w-[100%] gap-4">
                        <IoSettingsOutline /> Settings
                    </NavLink>
                </div>

                <button className="flex justify-center items-center text-red-500 hover:text-red-600
                    hover:bg-slate-800 rounded-lg p-2 cursor-pointer w-[100%]"
                    onClick={logoutHandler}>
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Sidebar;