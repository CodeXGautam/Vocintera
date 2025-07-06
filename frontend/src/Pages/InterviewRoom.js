import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaMicrophone } from "react-icons/fa6";
import { FaMicrophoneSlash } from "react-icons/fa";
import { MdCallEnd } from "react-icons/md";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';


const InterviewRoom = () => {

        const { interviewId } = useParams();
        const [mic, setMic] = useState(false);
        const [interviewHistory, setInterviewHistory] = useState([]);
        const [loading, setLoading] = useState(true);
        const [speechEnabled, setSpeechEnabled] = useState(true);
        const [isSpeaking, setIsSpeaking] = useState(false);
        const [availableVoices, setAvailableVoices] = useState([]);
        const [selectedVoice, setSelectedVoice] = useState(null);
        const speechSynthesisRef = useRef(null);

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
            };
        }, []);

        const {
            transcript,
            listening,
            resetTranscript,
            browserSupportsSpeechRecognition
        } = useSpeechRecognition();

        // Enhanced speech synthesis function for more human-like voice
        const speakText = (text, testMode = false) => {
            if (!speechEnabled && !testMode) return;
            
            // Cancel any ongoing speech
            if (speechSynthesisRef.current) {
                window.speechSynthesis.cancel();
            }
            
            const utterance = new SpeechSynthesisUtterance(text);
            
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
                SpeechRecognition.startListening();
                setMic(true);
            } else {
                SpeechRecognition.stopListening();
                setMic(!mic);
                setLoading(true);
                try {
                    const res = await fetch(process.env.REACT_APP_BACKEND_URI + '/gemini/get-response', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({ interviewId, question: transcript })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        const aiResponse = data.response;
                        setInterviewHistory(prev => [...prev, { role: 'candidate', text: transcript }, { role: 'interviewer', text: aiResponse }]);
                        // Speak the AI response
                        speakText(aiResponse);
                    } else {
                        toast.error(data.message || "Failed to get Gemini response");
                    }
                } catch (error) {
                    console.error("Error getting Gemini response:", error);
                    toast.error("Failed to get Gemini response");
                } finally {
                    resetTranscript();
                    setLoading(false);
                }
            }
        };


        return (
            <div className="flex flex-col gap-3 max-h-screen p-5">

                <div className="flex items-center justify-center font-extrabold text-3xl text-slate-200">
                    Vocintera
                </div>

                <div className="flex items-center justify-center font-semibold text-md text-blue-800">
                    Interview Panel
                </div>

                <div className="flex w-[100%] h-screen gap-5">
                    <div className="flex flex-col gap-2 justify-start items-center w-[100%] bg-slate-900 
                shadow-md shadow-blue-800 rounded-md hover:bg-slate-800 p-4 overflow-y-scroll">
                        <div className="flex items-center font-semibold text-blue-600 mb-4">
                            Vocintera (AI Interviewer)
                            {isSpeaking && (
                                <span className="ml-2 text-green-400 animate-pulse">
                                    🔊 Speaking...
                                </span>
                            )}
                        </div>
                        {loading && interviewHistory.length === 0 ? (
                            <p className="text-slate-400">Starting interview...</p>
                        ) : (
                            interviewHistory.map((entry, index) => (
                                <div key={index} className={`w-full p-2 rounded-md mb-2 ${entry.role === 'interviewer' ? 'bg-blue-900 text-white self-start' : 'bg-gray-700 text-white self-end'}`}>
                                    <strong>{entry.role === 'interviewer' ? 'AI:' : 'You:'}</strong> {entry.text}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex flex-col gap-2 justify-start items-center w-[100%] bg-slate-900
                shadow-md shadow-blue-800 rounded-md hover:bg-slate-800 p-4 overflow-y-scroll">
                        <div className="flex items-center font-semibold text-blue-600 mb-4">
                            Your Transcript
                        </div>
                        <div className="w-full p-2 rounded-md bg-gray-700 text-white">
                            {transcript}
                        </div>
                    </div>
                </div>

                <div className="flex w-[100%] justify-center items-center gap-4 mt-10">
                    <div className="flex flex-col relative">
                        
                        <button className="flex justify-center items-center rounded-full p-2 text-400 hover:text-500
                            bg-slate-700 hover:bg-slate-600 text-xl" onClick={micHandler}>
                            {mic ? <FaMicrophone /> : <FaMicrophoneSlash />}
                        </button>
                        
                        <span className="absolute top-[-13px] right-0 bg-slate-800 w-3 h-3 rounded-full"></span>
                        <p className="text-slate-400 absolute top-[-32px] text-[10px] bg-slate-800 p-2 rounded-full
                         right-[-18px] flex justify-center items-center z-1">{listening ? 'on' : 'off'}</p>
                    </div>

                    <button 
                        className="flex justify-center items-center rounded-full p-2 text-400 hover:text-500
                            bg-slate-700 hover:bg-slate-600 text-xl" 
                        onClick={() => setSpeechEnabled(!speechEnabled)}
                        title={speechEnabled ? "Disable AI Speech" : "Enable AI Speech"}
                    >
                        {speechEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                    </button>

                    {speechEnabled && availableVoices.length > 0 && (
                        <select 
                            className="bg-slate-700 text-slate-300 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
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
                            className="flex justify-center items-center rounded-full p-2 text-400 hover:text-500
                                bg-green-700 hover:bg-green-600 text-xl" 
                            onClick={testVoice}
                            title="Test Selected Voice"
                        >
                            🔊
                        </button>
                    )}

                    <button className="flex justify-center items-center p-3 rounded-xl bg-red-800 text-xl text-slate-400
                hover:text-300 font-semibold hover:bg-red-700">
                        <MdCallEnd />
                    </button>
                </div>
            </div>
        )
    }

    export default InterviewRoom;
