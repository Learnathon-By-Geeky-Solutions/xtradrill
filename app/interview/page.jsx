'use client';

import { useState, useRef, useEffect } from 'react';
import Button from '@/app/components/ui/button';
import Image from 'next/image';
import { Camera, CameraOff, Mic, MicOff } from 'lucide-react';

export default function InterviewPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const silenceTimeoutRef = useRef(null);

  const toggleCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isCameraOn;
      });
      setIsCameraOn(!isCameraOn);
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMicOn;
      });
      setIsMicOn(!isMicOn);
    }
    
    if (!isMicOn) {
      // Turning mic on
      if (isListening && recognitionRef.current) {
        recognitionRef.current.start();
      }
    } else {
      // Turning mic off
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const processAnswer = async (answer) => {
    const response = await fetch('/api/interview/process-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        answer,
        history: interviewHistory 
      }),
    });

    const { nextQuestion } = await response.json();

    setInterviewHistory(prev => [
      ...prev,
      { role: 'candidate', content: answer },
      { role: 'interviewer', content: nextQuestion }
    ]);

    const speech = new SpeechSynthesisUtterance(nextQuestion);
    speech.onend = () => {
      // Resume listening after AI finishes speaking
      if (recognitionRef.current && isMicOn) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
        }
      }
    };
    window.speechSynthesis.speak(speech);

    setCurrentQuestion(nextQuestion);
    setTranscript('');
  };

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript + ' ';
              // Process the answer if silence is detected
              if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
              }
              silenceTimeoutRef.current = setTimeout(() => {
                if (finalTranscript.trim()) {
                  processAnswer(finalTranscript.trim());
                  setIsSpeaking(false);
                }
              }, 1500); // Wait 1.5 seconds of silence before processing
            } else {
              interimTranscript += result[0].transcript;
            }
          }
          
          setTranscript(interimTranscript || finalTranscript);
          setIsSpeaking(true);
        };

        recognition.onend = () => {
          setIsSpeaking(false);
          if (isListening && isMicOn) {
            recognition.start();
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsSpeaking(false);
        };

        recognitionRef.current = recognition;
      } else {
        console.error('Speech Recognition not supported in this browser');
      }
    }

    // Setup camera
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setIsCameraOn(false);
        setIsMicOn(false);
      }
    };
    setupCamera();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  const startInterview = async () => {
    setIsRecording(true);
    setIsListening(true);
    if (recognitionRef.current && isMicOn) {
      try {
        await recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }

    const response = await fetch('/api/interview/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const { question } = await response.json();
    setCurrentQuestion(question);
    setInterviewHistory(prev => [...prev, { role: 'interviewer', content: question }]);

    const speech = new SpeechSynthesisUtterance(question);
    speech.onend = () => {
      // Start listening after AI finishes speaking
      if (recognitionRef.current && isMicOn) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Error starting recognition:', error);
        }
      }
    };
    window.speechSynthesis.speak(speech);
  };

  const endInterview = async () => {
    setIsRecording(false);
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const response = await fetch('/api/interview/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: interviewHistory }),
    });

    const { score, feedback } = await response.json();
    setScore(score);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Interview Session</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">AI Interviewer</h2>
          <div className="relative w-full aspect-video mb-4">
            <Image
              src="/interviewer.jpg"
              alt="AI Interviewer"
              fill
              className="rounded-lg object-cover"
              priority
            />
          </div>
          <div className="bg-gray-100 p-4 rounded-lg max-h-48 overflow-y-auto">
            {interviewHistory.map((item, index) => (
              <div key={index} className={`mb-2 ${item.role === 'interviewer' ? 'text-blue-600' : 'text-gray-700'}`}>
                <strong>{item.role === 'interviewer' ? 'AI: ' : 'You: '}</strong>
                {item.content}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">You</h2>
            <div className="space-x-2">
              <button
                onClick={toggleCamera}
                className={`p-2 rounded-full ${isCameraOn ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}
              >
                {isCameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
              </button>
              <button
                onClick={toggleMic}
                className={`p-2 rounded-full ${isMicOn ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}
              >
                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
            </div>
          </div>
          {isCameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg shadow-lg mb-4"
            />
          ) : (
            <div className="w-full aspect-video bg-gray-200 rounded-lg shadow-lg mb-4 flex items-center justify-center">
              <CameraOff size={40} className="text-gray-400" />
            </div>
          )}
          {isListening && (
            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">
                  Status: {!isMicOn ? 'Microphone Off' : isSpeaking ? 'Speaking' : 'Listening'}
                </p>
                {isMicOn && (
                  <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                )}
              </div>
              {transcript && (
                <p className="text-sm text-gray-600">
                  {transcript}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-center space-y-4">
        {!isRecording ? (
          <Button onClick={startInterview}>Start Interview</Button>
        ) : (
          <Button onClick={endInterview} variant="destructive">End Interview</Button>
        )}

        {currentQuestion && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold mb-2">Current Question:</h2>
            <p className="text-blue-800">{currentQuestion}</p>
          </div>
        )}

        {score !== null && (
          <div className="p-4 bg-green-100 rounded-lg">
            <h2 className="font-semibold mb-2">Interview Score:</h2>
            <p className="text-xl">{score}/100</p>
          </div>
        )}
      </div>
    </div>
  );
}
