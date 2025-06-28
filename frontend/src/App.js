import {Routes , Route} from 'react-router';
import LandingPage from './Pages/LandingPage';
import Navbar from './Components/Navbar';
import { useState } from 'react';
import Footer from './Components/Footer';
import SplashCursor from './Components/SplashCursor'
import AnimatedGradient from './Components/AnimatedGradient'

const App = () => {

  const[loggedIn , setLoggedIn] = useState(true);



  return (
    <div className="bg-slate-950 min-h-screen flex flex-col gap-10 relative">
      <AnimatedGradient />
      <SplashCursor/>

      <Navbar loggedIn= {loggedIn} setLoggedIn= {setLoggedIn}/>

      <Routes>
        <Route path='*' element={<LandingPage/>}/>
      </Routes>

      <Footer/>
    </div>
  );
}

export default App;
