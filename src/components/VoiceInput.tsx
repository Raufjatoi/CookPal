
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, isListening, setIsListening }) => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
        
        toast({
          title: "Voice captured!",
          description: `Heard: "${transcript}"`,
        });
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        toast({
          title: "Voice input error",
          description: "Please try again or type your ingredients",
          variant: "destructive"
        });
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [onTranscript, setIsListening, toast]);

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Voice input not supported",
        description: "Please use a modern browser with microphone support",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      
      toast({
        title: "Listening...",
        description: "Speak your ingredients clearly",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleListening}
      className={`border-amber-300 hover:bg-amber-50 ${
        isListening ? 'bg-red-100 border-red-300 text-red-600' : 'text-amber-700'
      }`}
    >
      {isListening ? (
        <MicOff className="w-4 h-4 animate-pulse" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </Button>
  );
};

export default VoiceInput;
