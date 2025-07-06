import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaMicrophone } from "react-icons/fa6";
import { FaMicrophoneSlash } from "react-icons/fa";
import { MdCallEnd } from "react-icons/md";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useNavigate } from "react-router-dom";

// Enhanced speech recognition configuration
const SPEECH_CONFIG = {
    continuous: true,
    interimResults: true,
    lang: 'en-US',
    maxAlternatives: 1,
    grammars: null
};


const InterviewRoom = () => {

        const { interviewId } = useParams();
        const navigate = useNavigate();
        const [mic, setMic] = useState(false);
        const [interviewHistory, setInterviewHistory] = useState([]);
        const [loading, setLoading] = useState(true);
        const [speechEnabled, setSpeechEnabled] = useState(true);
        const [isSpeaking, setIsSpeaking] = useState(false);
        const [availableVoices, setAvailableVoices] = useState([]);
        const [selectedVoice, setSelectedVoice] = useState(null);
        const [isListening, setIsListening] = useState(false);
        const [timeoutCountdown, setTimeoutCountdown] = useState(0);
        const [usingFallback, setUsingFallback] = useState(false);
        const [speechError, setSpeechError] = useState(null);
        const [recognitionQuality, setRecognitionQuality] = useState('good');
        const [interviewTimeRemaining, setInterviewTimeRemaining] = useState(900); // 15 minutes in seconds
        const [isInterviewEnding, setIsInterviewEnding] = useState(false);
        const speechSynthesisRef = useRef(null);
        const speechTimeoutRef = useRef(null);
        const lastTranscriptRef = useRef('');
        const countdownIntervalRef = useRef(null);
        const transcriptBufferRef = useRef('');
        const interviewTimerRef = useRef(null);
        const confidenceThreshold = 0.7;

        useEffect(() => {
            const startInterview = async () => {
                try {
                    const res = await fetch(process.env.REACT_APP_BACKEND_URI + '/gemini/start-interview', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({ interviewId })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        const initialQuestion = data.initialQuestion;
                        setInterviewHistory([{ role: 'interviewer', text: initialQuestion }]);
                        // Speak the initial question
                        speakText(initialQuestion);
                        
                        // Check if using fallback
                        if (data.usingFallback) {
                            setUsingFallback(true);
                            setTimeout(() => setUsingFallback(false), 5000); // Show for 5 seconds
                        }
                    } else {
                        toast.error(data.message || "Failed to start interview");
                    }
                } catch (error) {
                    console.error("Error starting interview:", error);
                    toast.error("Failed to start interview");
                } finally {
                    setLoading(false);
                }
            };

            if (interviewId) {
                startInterview();
            }
        }, [interviewId]);

        // Interview timer effect
        useEffect(() => {
            if (interviewId && !loading) {
                // Start the 15-minute timer
                interviewTimerRef.current = setInterval(() => {
                    setInterviewTimeRemaining(prev => {
                        if (prev <= 1) {
                            // Interview time is up
                            clearInterval(interviewTimerRef.current);
                            endInterview();
                            return 0;
                        }
                        
                        // Show warning at 5 minutes remaining
                        if (prev === 300) {
                            toast.error('5 minutes remaining in the interview!');
                        }
                        
                        return prev - 1;
                    });
                }, 1000);

                // Cleanup timer on unmount
                return () => {
                    if (interviewTimerRef.current) {
                        clearInterval(interviewTimerRef.current);
                    }
                };
            }
        }, [interviewId, loading]);

        // Load available voices
        useEffect(() => {
            const loadVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                setAvailableVoices(voices);
                
                // Auto-select the best voice
                const bestVoice = voices.find(voice => 
                    voice.name.includes('Google') && 
                    (voice.name.includes('Female') || voice.name.includes('Male'))
                ) || voices[0];
                
                if (bestVoice) {
                    setSelectedVoice(bestVoice);
                }
            };
            
            // Load voices immediately if available
            loadVoices();
            
            // Also listen for voices to load
            window.speechSynthesis.onvoiceschanged = loadVoices;
            
                    // Cleanup
        return () => {
            if (speechSynthesisRef.current) {
                window.speechSynthesis.cancel();
            }
            if (speechTimeoutRef.current) {
                clearTimeout(speechTimeoutRef.current);
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
            if (interviewTimerRef.current) {
                clearInterval(interviewTimerRef.current);
            }
        };
        }, []);

        const {
            transcript,
            listening,
            resetTranscript,
            browserSupportsSpeechRecognition,
            isMicrophoneAvailable
        } = useSpeechRecognition({
            commands: [],
            continuous: true,
            interimResults: true,
            lang: 'en-US',
            maxAlternatives: 1
        });

        // Function to send response to backend
        const sendResponseToBackend = async (question) => {
            if (!question || question.trim() === '') return;
            
            setLoading(true);
            try {
                const res = await fetch(process.env.REACT_APP_BACKEND_URI + '/gemini/get-response', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ interviewId, question: question.trim() })
                });
                const data = await res.json();
                if (res.ok) {
                    const aiResponse = data.aiResponse;
                    const isUsingFallback = data.isUsingFallback;
                    
                    setInterviewHistory(prev => [...prev, { role: 'candidate', text: question.trim() }, { role: 'interviewer', text: aiResponse }]);
                    // Speak the AI response
                    speakText(aiResponse);
                    
                    // Show fallback notification if using Ollama or fallback questions
                    if (isUsingFallback) {
                        setUsingFallback(true);
                        setTimeout(() => setUsingFallback(false), 5000); // Show for 5 seconds
                    }
                } else {
                    if (data.message && data.message.includes("rate limit")) {
                        toast.error("API rate limit reached. Using fallback questions. Please try again later.");
                        setUsingFallback(true);
                    } else {
                        toast.error(data.message || "Failed to get Gemini response");
                    }
                }
            } catch (error) {
                console.error("Error getting Gemini response:", error);
                toast.error("Failed to get Gemini response");
            } finally {
                resetTranscript();
                setLoading(false);
                setIsListening(false);
            }
        };

        // Function to handle speech timeout
        const handleSpeechTimeout = () => {
            if (transcript && transcript.trim() !== '' && transcript !== lastTranscriptRef.current) {
                lastTranscriptRef.current = transcript;
                sendResponseToBackend(transcript);
            }
        };

        // Function to end the interview
        const endInterview = async (isManual = false) => {
            setIsInterviewEnding(true);
            
            // Stop speech recognition
            if (mic) {
                SpeechRecognition.stopListening();
                setMic(false);
                setIsListening(false);
            }
            
            // Clear all timers
            if (speechTimeoutRef.current) {
                clearTimeout(speechTimeoutRef.current);
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
            if (interviewTimerRef.current) {
                clearInterval(interviewTimerRef.current);
            }
            
            try {
                // Update interview status to completed
                const res = await fetch(process.env.REACT_APP_BACKEND_URI + '/gemini/end-interview', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ 
                        interviewId,
                        status: true,
                        isManual: isManual
                    })
                });
                
                if (!res.ok) {
                    console.error('Failed to update interview status');
                }
            } catch (error) {
                console.error('Error updating interview status:', error);
            }
            
            // Add ending message
            const endingMessage = "Thank you for your time! This concludes our interview. We'll review your responses and get back to you soon.";
            setInterviewHistory(prev => [...prev, { role: 'interviewer', text: endingMessage }]);
            
            // Speak the ending message
            speakText(endingMessage);
            
            // Show completion toast
            toast.success('Interview completed! Thank you for your time.');
            
            // Automatically evaluate the interview
            try {
                const evalResponse = await fetch(process.env.REACT_APP_BACKEND_URI + `/evaluation/${interviewId}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (evalResponse.ok) {
                    toast.success('Interview evaluation completed!');
                } else {
                    console.log('Evaluation failed, but interview ended successfully');
                }
            } catch (evalError) {
                console.error('Error evaluating interview:', evalError);
            }
            
            // Redirect to interviews page after 3 seconds
            setTimeout(() => {
                navigate('/interview');
            }, 3000);
        };

        // Enhanced effect to monitor transcript changes with better performance
        useEffect(() => {
            if (listening && transcript && transcript.trim() !== '') {
                // Buffer the transcript for better stability
                transcriptBufferRef.current = transcript;
                
                // Clear existing timeout and countdown
                if (speechTimeoutRef.current) {
                    clearTimeout(speechTimeoutRef.current);
                }
                if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                }
                
                // Fixed 5-second timeout for all responses
                const timeoutDuration = 5000; // 5 seconds
                
                // Start countdown
                let countdown = Math.floor(timeoutDuration / 1000);
                setTimeoutCountdown(countdown);
                
                countdownIntervalRef.current = setInterval(() => {
                    countdown--;
                    setTimeoutCountdown(countdown);
                    if (countdown <= 0) {
                        clearInterval(countdownIntervalRef.current);
                        setTimeoutCountdown(0);
                    }
                }, 1000);
                
                // Set new timeout
                speechTimeoutRef.current = setTimeout(() => {
                    handleSpeechTimeout();
                    clearInterval(countdownIntervalRef.current);
                    setTimeoutCountdown(0);
                }, timeoutDuration);
                
                // Assess recognition quality
                const words = transcript.trim().split(' ').length;
                if (words > 20) {
                    setRecognitionQuality('excellent');
                } else if (words > 10) {
                    setRecognitionQuality('good');
                } else {
                    setRecognitionQuality('fair');
                }
            } else {
                // Clear countdown if not listening or no transcript
                if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                    setTimeoutCountdown(0);
                }
                setRecognitionQuality('good');
            }
        }, [transcript, listening]);

        // Enhanced speech synthesis function with performance optimizations
        const speakText = (text, testMode = false) => {
            if (!speechEnabled && !testMode) return;
            
            // Cancel any ongoing speech
            if (speechSynthesisRef.current) {
                window.speechSynthesis.cancel();
            }
            
            // Optimize text for better speech synthesis
            const optimizedText = text
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();
            
            if (!optimizedText) return;
            
            const utterance = new SpeechSynthesisUtterance(optimizedText);
            
            // Get available voices and wait for them to load
            let voices = window.speechSynthesis.getVoices();
            
            // If voices aren't loaded yet, wait for them
            if (voices.length === 0) {
                window.speechSynthesis.onvoiceschanged = () => {
                    voices = window.speechSynthesis.getVoices();
                    setVoice(utterance, voices);
                };
            } else {
                setVoice(utterance, voices);
            }
            
            // Set up event handlers
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            
            speechSynthesisRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        };

        // Test voice function
        const testVoice = () => {
            speakText("Hello! This is a test of the selected voice. How does it sound?", true);
        };

        // Function to set the best available voice
        const setVoice = (utterance, voices) => {
            // Use the selected voice if available, otherwise find the best one
            let voiceToUse = selectedVoice;
            
            if (!voiceToUse) {
                // Priority list for human-like voices
                const voicePriority = [
                    'Google UK English Female',
                    'Google UK English Male', 
                    'Google US English Female',
                    'Google US English Male',
                    'Samantha',
                    'Alex',
                    'Victoria',
                    'Daniel',
                    'Karen',
                    'Fred'
                ];
                
                // First try to find a Google voice (usually the most natural)
                voiceToUse = voices.find(voice => 
                    voice.name.includes('Google') && 
                    (voice.name.includes('Female') || voice.name.includes('Male'))
                );
                
                // If no Google voice, try other high-quality voices
                if (!voiceToUse) {
                    for (const voiceName of voicePriority) {
                        voiceToUse = voices.find(voice => 
                            voice.name.includes(voiceName) || 
                            voice.name.toLowerCase().includes(voiceName.toLowerCase())
                        );
                        if (voiceToUse) break;
                    }
                }
                
                // If still no voice found, use the first available
                if (!voiceToUse && voices.length > 0) {
                    voiceToUse = voices[0];
                }
            }
            
            if (voiceToUse) {
                utterance.voice = voiceToUse;
                console.log('Using voice:', voiceToUse.name);
            }
            
            // Optimize speech parameters for human-like sound
            utterance.rate = 0.85; // Slightly slower for natural pace
            utterance.pitch = 1.0; // Natural pitch
            utterance.volume = 0.9; // Good volume
        };

        if (!browserSupportsSpeechRecognition) {
            return <span>Browser doesn't support speech recognition.</span>;
        }

        const micHandler = async () => {
            if (!mic) {
                try {
                    // Check microphone availability
                    if (!isMicrophoneAvailable) {
                        setSpeechError('Microphone not available. Please check permissions.');
                        toast.error('Microphone not available. Please check permissions.');
                        return;
                    }
                    
                    // Clear any previous errors
                    setSpeechError(null);
                    
                    // Start listening with enhanced configuration
                    SpeechRecognition.startListening(SPEECH_CONFIG);
                    setMic(true);
                    setIsListening(true);
                    lastTranscriptRef.current = '';
                    transcriptBufferRef.current = '';
                    
                    // Reset recognition quality
                    setRecognitionQuality('good');
                    
                    console.log('🎤 Speech recognition started with enhanced settings');
                } catch (error) {
                    console.error('Error starting speech recognition:', error);
                    setSpeechError('Failed to start speech recognition');
                    toast.error('Failed to start speech recognition');
                    setMic(false);
                    setIsListening(false);
                }
            } else {
                try {
                    // Stop listening manually
                    SpeechRecognition.stopListening();
                    setMic(false);
                    setIsListening(false);
                    
                    // Clear any existing timeout
                    if (speechTimeoutRef.current) {
                        clearTimeout(speechTimeoutRef.current);
                    }
                    if (countdownIntervalRef.current) {
                        clearInterval(countdownIntervalRef.current);
                    }
                    setTimeoutCountdown(0);
                    
                    // Send current transcript if available
                    const finalTranscript = transcriptBufferRef.current || transcript;
                    if (finalTranscript && finalTranscript.trim() !== '') {
                        sendResponseToBackend(finalTranscript);
                    }
                    
                    console.log('🎤 Speech recognition stopped');
                } catch (error) {
                    console.error('Error stopping speech recognition:', error);
                    setSpeechError('Failed to stop speech recognition');
                }
            }
        };


        return (
            <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-5 p-2 sm:p-3 md:p-4 lg:p-5 overflow-hidden h-[100%]">

                <div className="flex items-center justify-center font-extrabold text-xl sm:text-2xl md:text-3xl text-slate-200">
                    Vocintera
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between font-semibold text-xs sm:text-sm md:text-md text-blue-800 px-1 sm:px-2 md:px-4 gap-1 sm:gap-2">
                    <span className="text-center">Interview Panel</span>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-xs text-gray-400">Time Remaining:</span>
                        <span className={`font-bold text-xs sm:text-sm md:text-md ${interviewTimeRemaining <= 300 ? 'text-red-500' : interviewTimeRemaining <= 600 ? 'text-yellow-500' : 'text-green-500'}`}>
                            {Math.floor(interviewTimeRemaining / 60)}:{(interviewTimeRemaining % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-5 overflow-hidden">
                    <div className="flex flex-col gap-2 justify-start items-center w-full md:w-1/2 bg-slate-900 
                shadow-md shadow-blue-800 rounded-md hover:bg-slate-800 p-2 sm:p-3 md:p-4 overflow-y-scroll">
                        <div className="flex flex-wrap items-center font-semibold text-blue-600 mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm md:text-base">
                            Vocintera (AI Interviewer)
                            {isSpeaking && (
                                <span className="ml-2 text-green-400 animate-pulse">
                                    🔊 Speaking...
                                </span>
                            )}
                            {isListening && (
                                <span className="ml-2 text-red-400 animate-pulse">
                                    🎤 Listening...
                                    {timeoutCountdown > 0 && (
                                        <span className="ml-1 text-yellow-400">
                                            ({timeoutCountdown}s)
                                        </span>
                                    )}
                                </span>
                            )}
                            {usingFallback && (
                                <span className="ml-2 text-orange-400 animate-pulse">
                                    🔄 Using OpenRouter AI
                                </span>
                            )}
                            {speechError && (
                                <span className="ml-2 text-red-400 animate-pulse">
                                    ⚠️ {speechError}
                                </span>
                            )}
                            {recognitionQuality === 'excellent' && (
                                <span className="ml-2 text-green-400">
                                    🎯 Excellent Recognition
                                </span>
                            )}
                            {recognitionQuality === 'fair' && (
                                <span className="ml-2 text-yellow-400">
                                    📝 Fair Recognition
                                </span>
                            )}
                        </div>
                        {loading && interviewHistory.length === 0 ? (
                            <p className="text-slate-400 text-xs sm:text-sm">Starting interview...</p>
                        ) : (
                            interviewHistory.map((entry, index) => (
                                <div key={index} className={`w-full p-2 rounded-md mb-2 text-xs sm:text-sm md:text-base ${entry.role === 'interviewer' ? 'bg-blue-900 text-white self-start' : 'bg-gray-700 text-white self-end'}`}>
                                    <strong>{entry.role === 'interviewer' ? 'AI:' : 'You:'}</strong> {entry.text}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex flex-col gap-2 justify-start items-center w-full md:w-1/2 bg-slate-900
                shadow-md shadow-blue-800 rounded-md hover:bg-slate-800 p-2 sm:p-3 md:p-4 overflow-y-scroll">
                        <div className="flex items-center font-semibold text-blue-600 mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm md:text-base">
                            Your Transcript
                        </div>
                        <div className="w-full p-2 rounded-md bg-gray-700 text-white">
                            <div className="text-xs text-gray-300 mb-1">
                                {recognitionQuality === 'excellent' && '🎯 High Quality Recognition'}
                                {recognitionQuality === 'good' && '✅ Good Recognition'}
                                {recognitionQuality === 'fair' && '📝 Fair Recognition'}
                            </div>
                            <div className="text-white text-xs sm:text-sm md:text-base">
                                {transcript || 'Start speaking...'}
                            </div>
                            {transcript && (
                                <div className="text-xs text-gray-400 mt-1">
                                    Words: {transcript.trim().split(' ').length} | 
                                    Characters: {transcript.trim().length}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row w-full justify-center items-center gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4 md:mt-6 lg:mt-10 px-1 sm:px-2 md:px-4">
                    <div className="flex flex-col relative">
                        
                        <button 
                            className={`flex justify-center items-center rounded-full p-1.5 sm:p-2 md:p-3 text-400 hover:text-500 text-base sm:text-lg md:text-xl ${
                                isInterviewEnding ? 'bg-slate-500 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600'
                            }`} 
                            onClick={micHandler}
                            disabled={isInterviewEnding}
                        >
                            {mic ? <FaMicrophone /> : <FaMicrophoneSlash />}
                        </button>
                        
                        <span className="absolute top-[-10px] sm:top-[-13px] right-0 bg-slate-800 w-2 h-2 sm:w-3 sm:h-3 rounded-full"></span>
                        <p className="text-slate-400 absolute top-[-25px] sm:top-[-32px] text-[8px] sm:text-[10px] bg-slate-800 p-1 sm:p-2 rounded-full
                         right-[-15px] sm:right-[-18px] flex justify-center items-center z-1">
                            {mic ? (isListening ? 'Listening' : 'Ready') : 'Off'}
                        </p>
                    </div>

                                        <button 
                        className={`flex justify-center items-center rounded-full p-1.5 sm:p-2 md:p-3 text-white text-xs sm:text-sm md:text-lg font-semibold transition-all duration-300 ${
                            isInterviewEnding 
                                ? 'bg-gray-500 cursor-not-allowed' 
                                : 'bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-lg hover:shadow-xl'
                        }`}
                        onClick={() => endInterview(true)}
                        disabled={isInterviewEnding}
                        title="End Interview"
                    >
                        <MdCallEnd className="mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">End Interview</span>
                        <span className="sm:hidden">End</span>
                    </button>

                    <button 
                        className="flex justify-center items-center rounded-full p-1.5 sm:p-2 md:p-3 text-400 hover:text-500 text-base sm:text-lg md:text-xl bg-slate-700 hover:bg-slate-600"
                        onClick={() => setSpeechEnabled(!speechEnabled)}
                        title={speechEnabled ? "Disable AI Speech" : "Enable AI Speech"}
                    >
                        {speechEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                    </button>

                    {speechEnabled && availableVoices.length > 0 && (
                        <select 
                            className="bg-slate-700 text-slate-300 px-1 sm:px-2 md:px-3 py-1 sm:py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 text-xs sm:text-sm md:text-base"
                            value={selectedVoice?.name || ''}
                            onChange={(e) => {
                                const voice = availableVoices.find(v => v.name === e.target.value);
                                setSelectedVoice(voice);
                            }}
                            title="Select AI Voice"
                        >
                            {availableVoices.map((voice, index) => (
                                <option key={index} value={voice.name}>
                                    {voice.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {speechEnabled && selectedVoice && (
                        <button 
                            className="flex justify-center items-center rounded-full p-1.5 sm:p-2 md:p-3 text-400 hover:text-500
                                bg-green-700 hover:bg-green-600 text-base sm:text-lg md:text-xl" 
                            onClick={testVoice}
                            title="Test Selected Voice"
                        >
                            🔊
                        </button>
                    )}


                </div>
            </div>
        )
    }

    export default InterviewRoom;
