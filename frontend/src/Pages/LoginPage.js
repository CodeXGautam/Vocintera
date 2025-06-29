import { useState } from "react";
import { NavLink } from 'react-router';
import { FcGoogle } from "react-icons/fc";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";


const LoginPage = () => {

   const [showpassword, setShowPassword] = useState(false);

   const [formData, setFormData] = useState({
      firstname: '',
      lastname: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
   })

   const passHandler = () => {
      setShowPassword(!showpassword)
   }

   const changeHandler = (event) => {
      setFormData({
         ...formData,
         [event.target.name]: event.target.value
      })
   }

   const submitHandler = (event) => {
      event.preventDefault();
      console.log(formData);
   }

   const googleHandler = () =>{
         console.log("google login button");
   }

   return (
      <div className='flex min-h-screen justify-center items-center'>
         <form className='flex flex-col gap-5 border-2 shadow-md shadow-blue-900 w-[70%] max-w-[600px]
            border-slate-900 p-10 rounded-xl min-w-[300px]' onSubmit={submitHandler}>

            <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 text-center'>Welcome Back !</h1>

            <label htmlFor="Email" className="text-gray-300 flex flex-col gap-2 w-[100%]">Email *
               <input type="email" value={formData.email} id="email" name="email"
                  className="flex justify-center text-gray-300 text-sm items-center border-2 border-gray-800 rounded-xl bg-slate-900 p-3"
                  onChange={changeHandler} />
            </label>

            <label htmlFor="Password" className="text-gray-300 flex flex-col gap-2 w-[100%]">
               Password *
               {!showpassword &&
                  <div className="relative">
                     <input type="password" onChange={changeHandler} name="password" id="password" value={formData.password}
                        className="flex justify-center text-gray-300 text-sm items-center w-[100%] border-2 border-gray-800 rounded-xl bg-slate-900 p-3" />
                     <FaRegEyeSlash onClick={passHandler} className="absolute right-4 bottom-4" />
                  </div>
               }

               {showpassword &&
                  <div className='relative'>
                     <input type="text" onChange={changeHandler} name="password" id="password" value={formData.password}
                        className="flex justify-center text-gray-300 text-sm items-center w-[100%] border-2 border-gray-800 rounded-xl bg-slate-900 p-3" />
                     <FaRegEye onClick={passHandler} className="absolute right-4 bottom-4" />
                  </div>
               }
            </label>

            <div className="flex gap-2 items-center">
               <span className="text-gray-300">Do not have an account ?</span>
               <NavLink to='/register' className='text-blue-500 font-bold hover:text-blue-600 hover:scale-[1.05]'>
                  Register
               </NavLink>
            </div>

            <button className="bg-blue-950 p-4 rounded-xl flex justify-center items-center text-gray-200 
                hover:bg-blue-800 transition-all duration-200 hover:scale-[1.05] hover:text-gray-100 shadow-lg shadow-blue-500">
               Log In
            </button>

            <div className="flex items-center gap-2">
               <span className="w-[100%] h-[1px] bg-slate-800"></span>
               <span className="flex text-sm text-gray-400">OR</span>
               <span className="w-[100%] h-[1px] bg-slate-800"></span>
            </div>

            <div className="bg-blue-950 p-4 rounded-xl flex justify-center cursor-pointer items-center gap-4 text-gray-200 
                hover:bg-blue-800 transition-all duration-200 hover:scale-[1.05] hover:text-gray-100 shadow-lg shadow-blue-500"
                onClick = {googleHandler}>

               Log In with Google <FcGoogle />
            </div>
         </form>
      </div>
   )
}

export default LoginPage;