'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Volume2, VolumeX, History } from 'lucide-react';
import Link from 'next/link';

const INTERVIEW_GREETING = "Hello! I'm your AI interviewer today. I'll be asking you some questions to learn more about your experience and skills. Are you ready to begin?";

const INTERVIEW_QUESTIONS = [
  "Could you tell me about your background and experience?",
  "What interests you most about this position?",
  "Can you describe a challenging project you've worked on?",
  "How do you handle difficult situations or conflicts?",
  "What are your strengths and areas for improvement?",
  "Where do you see yourself in five years?",
  "Do you have any questions for me?",
];

export default function VoiceChatPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [interviewComplete, setInterviewComplete] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const canvasRef = useRef(null);
  const waveAnimationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeCanvas();
    return () => cleanup();
  }, []);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;
    let time = 0;

    const drawWave = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#0066ff');

      // Draw circle with wave effect
      ctx.beginPath();
      for (let i = 0; i < Math.PI * 2; i += 0.01) {
        const waveAmplitude = isSpeaking ? 20 : 0;
        const distortion = Math.sin(i * 8 + time) * waveAmplitude;
        const x = centerX + (radius + distortion) * Math.cos(i);
        const y = centerY + (radius + distortion) * Math.sin(i);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      time += 0.05;
      waveAnimationRef.current = requestAnimationFrame(drawWave);
    };

    drawWave();
  };

  const cleanup = () => {
    if (waveAnimationRef.current) {
      cancelAnimationFrame(waveAnimationRef.current);
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      if (!recognitionRef.current) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          
          recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            const transcript = result[0].transcript;
            setTranscript(transcript);
            
            if (result.isFinal) {
              handleMessage(transcript);
              setTranscript('');
            }
          };

          recognition.onerror = (event) => {
            console.error('Speech recognition error:', event);
            setError('Speech recognition error: ' + event.error);
            setIsRecording(false);
          };

          recognitionRef.current = recognition;
        }
      }

      if (recognitionRef.current) {
        await initializeAudio();
        recognitionRef.current.start();
        setIsRecording(true);
        setIsSpeaking(false); // Stop AI speaking when user starts talking
        if (synthRef.current) {
          synthRef.current.cancel(); // Stop any ongoing speech
        }
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Could not start recording: ' + error.message);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const initializeAudio = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
    } catch (err) {
      console.error('Error initializing audio:', err);
      setError('Microphone access required');
    }
  };

  const toggleAudio = () => {
    try {
      if (!synthRef.current) {
        synthRef.current = window.speechSynthesis;
      }
      
      setAudioEnabled(!audioEnabled);
      if (synthRef.current && audioEnabled) {
        synthRef.current.cancel();
      }

      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Audio toggle error:', err);
      setError('Could not initialize audio. Please check browser permissions.');
      setAudioEnabled(false);
    }
  };

  const handleMessage = async (text) => {
    try {
      setIsProcessing(true);
      setMessages(prev => [...prev, { role: 'user', content: text }]);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          context: 'interview',
          currentQuestion: INTERVIEW_QUESTIONS[currentQuestionIndex]
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      
      // Move to next question or end interview
      if (currentQuestionIndex < INTERVIEW_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeout(() => {
          const nextQuestion = INTERVIEW_QUESTIONS[currentQuestionIndex + 1];
          setMessages(prev => [...prev, { role: 'assistant', content: nextQuestion }]);
          if (audioEnabled) {
            speakText(nextQuestion);
          }
        }, 2000);
      } else if (!interviewComplete) {
        setInterviewComplete(true);
        const closingMessage = "Thank you for your time! The interview is now complete. I'll save our conversation for review.";
        setMessages(prev => [...prev, { role: 'assistant', content: closingMessage }]);
        if (audioEnabled) {
          speakText(closingMessage);
        }
        saveConversationHistory();
      }
      
      if (audioEnabled) {
        speakText(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveConversationHistory = async () => {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation: messages }),
      });
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  const speakText = (text) => {
    if (!synthRef.current) {
      try {
        // Initialize speech synthesis if not already done
        synthRef.current = window.speechSynthesis;
      } catch (err) {
        console.error('Speech synthesis initialization error:', err);
        return;
      }
    }

    // Cancel any ongoing speech
    try {
      synthRef.current.cancel();

      // Create and configure utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = 'en-US'; // Set language explicitly

      // Handle events
      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setError('Error speaking: ' + event.error);
        setIsSpeaking(false);
        
        // Try to reinitialize speech synthesis
        if (event.error === 'not-allowed') {
          synthRef.current = null;
          setAudioEnabled(false);
          setError('Speech synthesis requires user interaction first. Please click the speaker icon to enable audio.');
        }
      };

      // Speak the text
      synthRef.current.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis error:', err);
      setError('Speech synthesis error. Please try again.');
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    if (messages.length === 0) {
      handleInitialGreeting();
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInitialGreeting = async () => {
    setMessages([{ role: 'assistant', content: INTERVIEW_GREETING }]);
    setCurrentQuestionIndex(0);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="w-8" /> {/* Spacer */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleAudio}
            className="text-white/80 hover:text-white"
          >
            {audioEnabled ? (
              <Volume2 className="h-6 w-6" />
            ) : (
              <VolumeX className="h-6 w-6" />
            )}
          </button>
          <Link href="/history">
            <button className="text-white/80 hover:text-white">
              <History className="h-6 w-6" />
            </button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-72 h-72">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Controls */}
      <div className="p-8 flex items-center justify-center space-x-8">
        <button
          onClick={toggleRecording}
          className={`p-4 rounded-full ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <Mic className={`h-8 w-8 ${isRecording ? 'text-white' : 'text-red-500'}`} />
        </button>
        <button
          onClick={() => window.location.reload()}
          className="p-4 rounded-full bg-white/10 hover:bg-white/20"
        >
          <X className="h-8 w-8 text-white" />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute bottom-20 left-0 right-0 mx-auto text-center">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg inline-block">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
