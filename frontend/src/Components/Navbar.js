import { NavLink } from 'react-router-dom';


const Navbar = (props) => {

    const loggedIn = props.loggedIn;
    const setLoggedIn = props.setLoggedIn;

    const logOutHandler = () =>{
        setLoggedIn(false);
    }


    return (
        <div className="flex justify-between bg-slate-950 p-3 w-[90%] mx-auto border-b-2 border-blue-700">
            <NavLink to='/' className="flex justify-center items-center text-2xl font-extrabold text-gray-200 hover:text-white 
        cursor-pointer">
                Vocintera
            </NavLink>

            <div className='flex gap-8 text-md items-center text-gray-200'>
                {
                    !loggedIn &&
                    <NavLink to='/product' className='hover:bg-gray-900 p-2 rounded-xl'>
                        Product
                    </NavLink>
                }

                {
                    !loggedIn &&
                    <NavLink to='/pricing' className='hover:bg-gray-900 p-2 rounded-xl'>
                        Pricing
                    </NavLink>
                }

                {
                    !loggedIn &&
                    <NavLink to='/resources' className='hover:bg-gray-900 p-2 rounded-xl'>
                        Resources
                    </NavLink>
                }
              
                {
                    !loggedIn &&
                    <NavLink to='/register' className='flex justify-center items-center bg-blue-700 p-2 
                    rounded-xl hover:bg-blue-600 hover:scale-[1.05] duration-[1s]'>
                        Get Started
                    </NavLink>
                }

                {/* when user logged in  */}

                 {
                    loggedIn &&
                    <NavLink to='/home' className='hover:bg-gray-900 p-2 rounded-xl'>
                      Home
                    </NavLink>
                }

                {
                    loggedIn &&
                    <NavLink to='/dashboard' className='hover:bg-gray-900 p-2 rounded-xl'>
                      Dashboard
                    </NavLink>
                }

                {
                    loggedIn &&
                    <NavLink to='/logout' className='hover:bg-gray-900 hover:scale-[1.1] p-2 rounded-xl 
                    text-blue-700 font-semibold' onClick={logOutHandler}>
                      LogOut
                    </NavLink>
                }
            </div>
        </div>
    )
}

export default Navbar;