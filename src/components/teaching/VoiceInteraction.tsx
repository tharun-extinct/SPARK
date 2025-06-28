import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  RotateCcw,
  Headphones,
  Radio,
  Settings
} from 'lucide-react';

interface VoiceInteractionProps {
  onTranscription?: (text: string) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  autoSpeak?: boolean;
  language?: string;
}

const VoiceInteraction: React.FC<VoiceInteractionProps> = ({
  onTranscription,
  onSpeechStart,
  onSpeechEnd,
  autoSpeak = true,
  language = 'en-US'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef<any | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Check for browser support
  useEffect(() => {
    // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition && speechSynthesis) {
      setIsSupported(true);
      synthRef.current = speechSynthesis;
    } else {
      setIsSupported(false);
      setError('Speech recognition or synthesis not supported in this browser');
    }
  }, []);

  // Initialize audio context for visualization
  const initializeAudioContext = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      microphoneRef.current.connect(analyserRef.current);
      
      updateAudioLevel();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Microphone access denied');
    }
  };

  // Update audio level for visualization
  const updateAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setAudioLevel(average / 255);
    
    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  // Start speech recognition
  const startListening = async () => {
    if (!isSupported) return;

    try {
      // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
        onSpeechStart?.();
        initializeAudioContext();
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            setConfidence(result[0].confidence);
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          onTranscription?.(finalTranscript);
        }
        
        setInterimTranscript(interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        onSpeechEnd?.();
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      recognitionRef.current.start();
    } catch (err) {
      setError('Failed to start speech recognition');
      console.error('Speech recognition error:', err);
    }
  };

  // Stop speech recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Text-to-speech function
  const speak = (text: string) => {
    if (!synthRef.current || !text.trim()) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setError('Speech synthesis error');
    };

    synthRef.current.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Clear transcript
  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-red-50 to-rose-100 border-red-200">
        <CardContent className="p-6 text-center">
          <MicOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Voice Features Not Available</h3>
          <p className="text-red-600">
            Your browser doesn't support speech recognition or synthesis. 
            Please use Chrome, Edge, or Safari for voice features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Voice Controls */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Headphones className="w-5 h-5" />
            Voice Interaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Microphone Visualization */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div 
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isListening 
                    ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-lg scale-110' 
                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                }`}
                style={{
                  transform: isListening ? `scale(${1.1 + audioLevel * 0.3})` : 'scale(1)',
                }}
              >
                {isListening ? (
                  <Mic className="w-8 h-8 text-white" />
                ) : (
                  <MicOff className="w-8 h-8 text-white" />
                )}
              </div>
              
              {/* Audio level rings */}
              {isListening && (
                <>
                  <div 
                    className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping"
                    style={{ opacity: audioLevel }}
                  />
                  <div 
                    className="absolute inset-0 rounded-full border border-red-200 animate-pulse"
                    style={{ 
                      transform: `scale(${1.2 + audioLevel * 0.5})`,
                      opacity: audioLevel * 0.5 
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={isListening ? stopListening : startListening}
              className={`${
                isListening 
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Listening
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={clearTranscript}
              disabled={!transcript}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center justify-center gap-4">
            {isListening && (
              <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse">
                <Radio className="w-3 h-3 mr-1" />
                Listening...
              </Badge>
            )}
            
            {isSpeaking && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 animate-pulse">
                <Volume2 className="w-3 h-3 mr-1" />
                Speaking...
              </Badge>
            )}

            {confidence > 0 && (
              <Badge variant="outline">
                Confidence: {Math.round(confidence * 100)}%
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Volume2 className="w-5 h-5" />
              Speech Transcript
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-white rounded-lg border border-green-200 min-h-20">
              <p className="text-gray-800">
                {transcript}
                {interimTranscript && (
                  <span className="text-gray-500 italic">{interimTranscript}</span>
                )}
              </p>
            </div>
            
            {transcript && (
              <div className="flex items-center justify-between mt-4">
                <Badge variant="outline" className="text-green-600 border-green-200">
                  {transcript.split(' ').length} words
                </Badge>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => speak(transcript)}
                    disabled={isSpeaking}
                  >
                    {isSpeaking ? (
                      <Pause className="w-4 h-4 mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {isSpeaking ? 'Speaking...' : 'Read Aloud'}
                  </Button>
                  
                  {isSpeaking && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={stopSpeaking}
                    >
                      <VolumeX className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="bg-gradient-to-br from-red-50 to-rose-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <MicOff className="w-5 h-5" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Tips */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <h4 className="font-medium text-blue-800">Voice Interaction Tips</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Speak clearly and at a normal pace</p>
              <p>• Allow microphone access when prompted</p>
              <p>• Use in a quiet environment for best results</p>
              <p>• The AI can read responses aloud automatically</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceInteraction;