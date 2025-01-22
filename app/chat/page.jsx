'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, X } from 'lucide-react';

const INITIAL_GREETING = "Hello! I'm your AI assistant. How can I help you today?";

export default function VoiceChatPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [chatStarted, setChatStarted] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const canvasRef = useRef(null);
  const aiCanvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const micStreamRef = useRef(null);

  // Start chat with AI greeting
  useEffect(() => {
    if (!chatStarted) {
      handleInitialGreeting();
    }
  }, []);

  const handleInitialGreeting = async () => {
    setChatStarted(true);
    setMessages([{ role: 'assistant', content: INITIAL_GREETING }]);
    if (audioEnabled) {
      speakText(INITIAL_GREETING);
    }
  };

  // Initialize audio visualization
  const initAudioVisualization = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      drawVisualization();
    } catch (err) {
      console.error('Error initializing audio visualization:', err);
    }
  };

  const drawVisualization = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      ctx.fillStyle = 'rgb(14, 16, 27)';
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgb(${barHeight + 100}, 65, 255)`;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();
  };

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setError('Speech recognition error: ' + event.error);
        };

        recognitionRef.current = recognition;
      }

      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
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
  }, []);

  const startRecording = async () => {
    setError('');
    if (recognitionRef.current) {
      await initAudioVisualization();
      recognitionRef.current.start();
      setIsRecording(true);
      setTranscript('');
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

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (synthRef.current && audioEnabled) {
      synthRef.current.cancel();
    }
  };

  const handleMessage = async (text) => {
    try {
      setIsProcessing(true);
      setMessages(prev => [...prev, { role: 'user', content: text }]);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      
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

  const speakText = (text) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

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
    };

    synthRef.current.speak(utterance);
  };

  const endChat = () => {
    stopRecording();
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setChatStarted(false);
    setMessages([]);
    setTranscript('');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-2 gap-6">
        {/* AI Side */}
        <Card className="h-[600px] flex flex-col">
          <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">AI Assistant</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleAudio}
                className={audioEnabled ? 'text-green-500' : 'text-red-500'}
              >
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex-1 bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <canvas
                  ref={aiCanvasRef}
                  width={300}
                  height={300}
                  className="rounded-full bg-gray-900"
                />
                {isSpeaking && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-ping w-4 h-4 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-sm mb-1">AI Response</p>
              <p className="text-gray-700">
                {messages.length > 0 ? messages[messages.length - 1]?.content : ''}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Side */}
        <Card className="h-[600px] flex flex-col">
          <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">You</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={endChat}
                className="text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-900"
              />
            </div>

            {transcript && (
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <p className="font-medium text-sm mb-1">Current Speech</p>
                <p className="text-gray-600">{transcript}</p>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <Button
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-8 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                disabled={isProcessing || isSpeaking}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-5 w-5 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    Speak
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 text-red-500 p-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
