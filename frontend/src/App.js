import { Routes, Route } from 'react-router';
import LandingPage from './Pages/LandingPage';
import Navbar from './Components/Navbar';
import { useState } from 'react';
import Footer from './Components/Footer';

import RegisterPage from './Pages/RegisterPage';
import LoginPage from './Pages/LoginPage';
import Home from './Pages/Home';


const App = () => {

  const [loggedIn, setLoggedIn] = useState(false);



  return (
    <div className="bg-slate-950 min-h-screen flex flex-col gap-10 relative">


      <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />

      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/login' element={<LoginPage />} />
        {
          loggedIn &&
          <Route path='/home' element={<Home/>}/>
        }
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
