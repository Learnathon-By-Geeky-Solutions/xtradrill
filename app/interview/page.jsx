'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, CameraOff, Mic, MicOff, Loader2, Pause, Play } from 'lucide-react';

const INTERVIEW_QUESTIONS = [
  "Tell me about your experience with AI and machine learning.",
  "What projects have you worked on that involved deep learning?",
  "How do you keep up with the latest developments in AI?",
  "Can you explain how transformers work?",
  "What's your experience with deploying ML models in production?"
];

const SILENCE_DURATION = 2000; // 2 seconds of silence before processing answer

export default function InterviewPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [lastSpeechTime, setLastSpeechTime] = useState(Date.now());
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
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
      startListening();
    } else {
      stopListening();
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isPaused) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      startListening();
    } else {
      stopListening();
    }
  };

  const processAnswer = async (answer) => {
    if (!answer.trim() || isPaused) return;

    // Clear any existing silence timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }

    // Stop listening while processing
    stopListening();

    // Add the answer to history
    setInterviewHistory(prev => [
      ...prev,
      { role: 'candidate', content: answer }
    ]);

    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < INTERVIEW_QUESTIONS.length) {
      const nextQuestion = INTERVIEW_QUESTIONS[nextIndex];
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(nextQuestion);
      
      setInterviewHistory(prev => [
        ...prev,
        { role: 'interviewer', content: nextQuestion }
      ]);

      // Generate video for the next question
      await generateVideo(nextQuestion);

      // Only start listening after video is ready
      if (!isPaused) {
        startListening();
      }
    } else {
      setIsRecording(false);
      setIsListening(false);
      setTranscript('');
    }
  };

  const generateVideo = async (text) => {
    try {
      setIsGeneratingVideo(true);
      const response = await fetch('/api/heygen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setCurrentVideo(data.video_url);
    } catch (error) {
      console.error('Error generating video:', error);
      setError('Failed to generate interviewer video: ' + error.message);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          // Get only the latest result
          const result = event.results[event.results.length - 1];
          if (result.isFinal) {
            finalTranscript = result[0].transcript;
            setTranscript(finalTranscript);
            
            // Clear any existing silence timeout
            if (silenceTimeoutRef.current) {
              clearTimeout(silenceTimeoutRef.current);
            }

            // Set new silence timeout
            silenceTimeoutRef.current = setTimeout(() => {
              if (finalTranscript.trim()) {
                processAnswer(finalTranscript.trim());
                // Stop recognition after processing answer
                stopListening();
              }
            }, SILENCE_DURATION);
          } else {
            interimTranscript = result[0].transcript;
            setTranscript(interimTranscript);
          }
          
          setLastSpeechTime(Date.now());
        };

        recognition.onend = () => {
          // Only restart if we're still in listening mode and not paused
          if (isListening && isMicOn && !isPaused) {
            try {
              recognition.start();
            } catch (error) {
              console.error('Error restarting recognition:', error);
            }
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setError('Speech recognition error: ' + event.error);
        };

        recognitionRef.current = recognition;
      } else {
        setError('Speech Recognition not supported in this browser');
      }
    }

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
        setError('Error accessing camera: ' + err.message);
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
    setIsPaused(false);

    const firstQuestion = INTERVIEW_QUESTIONS[0];
    setCurrentQuestion(firstQuestion);
    setInterviewHistory([{ role: 'interviewer', content: firstQuestion }]);
    
    // Generate video for the first question
    await generateVideo(firstQuestion);

    // Start listening after video is ready
    if (!isPaused) {
      startListening();
    }
  };

  const endInterview = () => {
    setIsRecording(false);
    setIsListening(false);
    stopListening();
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold text-center mb-8">AI Interview Session</h1>
      
      {error && (
        <Dialog open={!!error} onOpenChange={() => setError(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
              <DialogDescription>{error}</DialogDescription>
            </DialogHeader>
            <Button onClick={() => setError(null)}>Close</Button>
          </DialogContent>
        </Dialog>
      )}
      
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">AI Interviewer</h2>
            </div>
            
            <div className="relative aspect-video mb-4 bg-gray-100 rounded-lg overflow-hidden">
              {isGeneratingVideo ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <div className="text-sm text-gray-600">Generating response...</div>
                  </div>
                </div>
              ) : currentVideo ? (
                <video
                  key={currentVideo}
                  src={currentVideo}
                  autoPlay
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <div className="text-gray-500 text-lg">AI Interviewer</div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
              {interviewHistory.map((item, index) => (
                <div
                  key={index}
                  className={`mb-2 p-2 rounded ${
                    item.role === 'interviewer'
                      ? 'bg-blue-50 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <strong>{item.role === 'interviewer' ? 'AI: ' : 'You: '}</strong>
                  {item.content}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">You</h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleCamera}
                  className={isCameraOn ? 'text-blue-600' : 'text-red-600'}
                >
                  {isCameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMic}
                  className={isMicOn ? 'text-blue-600' : 'text-red-600'}
                >
                  {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                {isRecording && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePause}
                    className={isPaused ? 'text-green-600' : 'text-yellow-600'}
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>

            {isCameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-video rounded-lg shadow-lg mb-4 bg-gray-100"
              />
            ) : (
              <div className="w-full aspect-video bg-gray-100 rounded-lg shadow-lg mb-4 flex items-center justify-center">
                <CameraOff className="h-12 w-12 text-gray-400" />
              </div>
            )}

            {isListening && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {!isMicOn ? 'Microphone Off' : isPaused ? 'Paused' : transcript ? 'Speaking...' : 'Listening...'}
                  </span>
                  {isMicOn && !isPaused && (
                    <div className={`w-2 h-2 rounded-full ${
                      transcript ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                    }`} />
                  )}
                </div>
                {transcript && (
                  <p className="text-sm text-gray-600">{transcript}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center space-x-4">
        {!isRecording ? (
          <Button
            size="lg"
            onClick={startInterview}
            className="px-8"
          >
            Start Interview
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="lg"
            onClick={endInterview}
            className="px-8"
          >
            End Interview
          </Button>
        )}
      </div>

      {currentQuestion && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h2 className="font-semibold mb-2">Current Question:</h2>
            <p className="text-lg text-blue-800">{currentQuestion}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
