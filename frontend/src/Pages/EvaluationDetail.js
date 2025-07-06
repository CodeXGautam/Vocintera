import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from "../Components/Sidebar";
import DetailedEvaluation from "../Components/DetailedEvaluation";
import Footer from "../Components/Footer";
import toast from "react-hot-toast";

const EvaluationDetail = (props) => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const { loggedIn, setLoggedIn } = props;
    
    const [evaluation, setEvaluation] = useState(null);
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvaluationDetail();
    }, [interviewId]);

    const fetchEvaluationDetail = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_BACKEND_URI + `/evaluation/${interviewId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setEvaluation(data.evaluation);
                setInterview(data.interview);
            } else {
                toast.error(data.message || 'Failed to load evaluation');
                navigate('/interview');
            }
        } catch (error) {
            console.error('Error fetching evaluation detail:', error);
            toast.error('Failed to load evaluation details');
            navigate('/interview');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/interview');
    };

    if (loading) {
        return (
            <div className="flex w-[100%] min-h-screen relative gap-4 overflow-hidden">
                <Sidebar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
                <div className="w-[100%] max-h-screen bg-slate-900 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-[100%] min-h-screen relative gap-4 overflow-hidden">
            <Sidebar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
            
            <div className="w-[100%] max-h-screen bg-slate-900 flex flex-col gap-8 transition-all
                duration-300 ease-in-out rounded-md shadow-md shadow-blue-500 p-5 overflow-y-scroll">
                
                <DetailedEvaluation 
                    evaluation={evaluation} 
                    interview={interview} 
                    onBack={handleBack}
                />
                
                <Footer />
            </div>
        </div>
    );
};

export default EvaluationDetail; 