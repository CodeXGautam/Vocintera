import { Routes, Route} from 'react-router';
import LandingPage from './Pages/LandingPage';
import { useState, useEffect } from 'react';
import RegisterPage from './Pages/RegisterPage';
import LoginPage from './Pages/LoginPage';
import Home from './Pages/Home';
import Practice from './Pages/Practice';
import Interview from './Pages/Interview';
import Settings from './Pages/Settings';
import InterviewRoom from './Pages/InterviewRoom';
import EvaluationDetail from './Pages/EvaluationDetail';


const App = () => {

  const [loggedIn, setLoggedIn] = useState(false);

  const refreshToken = async () => {
    try {
      const res = await fetch(process.env.REACT_APP_BACKEND_URI + '/refresh-token', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.message === "Token not found" || data.message === "Unauthorized user" || data.message === "Token expired or already used") {
        console.log(data.message);
        setLoggedIn(false);
        return;
      }
      if (data.message === "Access token refreshed") {
        console.log("access token refreshed");
        setLoggedIn(true);
      }
      else {
        console.log("Error: ", data.message)
      }

    } catch (err) {
      console.log("Refreshing token failed");
      setLoggedIn(false);
    }
  };

  useEffect(() => {
    refreshToken();
  }, []);


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
        {
          loggedIn &&
          <Route path='/interviewroom/:interviewId' element={<InterviewRoom />} />
        }
        {
          loggedIn &&
          <Route path='/evaluation/:interviewId' element={<EvaluationDetail loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
        }
      </Routes>
    </div>
  );
}

export default App;
