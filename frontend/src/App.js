import { Routes, Route } from 'react-router';
import LandingPage from './Pages/LandingPage';
import { useState } from 'react';
import RegisterPage from './Pages/RegisterPage';
import LoginPage from './Pages/LoginPage';
import Home from './Pages/Home';
import Practice from './Pages/Practice';
import Interview from './Pages/Interview';
import Settings from './Pages/Settings';


const App = () => {

  const [loggedIn, setLoggedIn] = useState(true);



  return (
    <div className="bg-slate-950 min-h-screen flex flex-col relative">

      <Routes>
        <Route path='/' element={<LandingPage loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
        <Route path='/register' element={<RegisterPage loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
        <Route path='/login' element={<LoginPage loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
        {
          loggedIn &&
          <Route path='/home' element={<Home loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
        }
        {
          loggedIn &&
          <Route path='/practice' element={<Practice loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
        }
        {
          loggedIn &&
          <Route path='/interview' element={<Interview loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
        }
        {
          loggedIn &&
          <Route path='/settings' element={<Settings loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
        }
      </Routes>
    </div>
  );
}

export default App;
