
'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Pause, Play, Send, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AudioRecorderProps {
  onRecordingComplete: (audioData: { blob: Blob; url: string }) => void;
  isPublishing: boolean;
}

type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped';

export function AudioRecorder({ onRecordingComplete, isPublishing }: AudioRecorderProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Clean up function to stop media tracks when the component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [stream, audioUrl]);

  const getMicrophonePermission = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
            title: "API não suportada",
            description: "Seu navegador não suporta a gravação de áudio.",
            variant: 'destructive'
        });
        setPermissionError(true);
        return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);
      setPermissionError(false);
      return mediaStream;
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast({
        title: "Permissão de Microfone Negada",
        description: "Por favor, habilite o acesso ao microfone nas configurações do seu navegador.",
        variant: "destructive",
      });
      setPermissionError(true);
    }
  };

  const startRecording = async () => {
    let mediaStream = stream;
    if (!mediaStream) {
        mediaStream = await getMicrophonePermission();
    }
    if (!mediaStream) return;

    setStatus('recording');
    setAudioBlob(null);
    if(audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);

    const mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioUrl(url);
    };

    mediaRecorder.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      setStatus('stopped');
      // Stop the tracks to turn off the microphone indicator
      stream?.getTracks().forEach(track => track.stop());
      setStream(null); // Set stream to null so we have to ask for permission again
    }
  };

  const handlePublish = () => {
    if (audioBlob && audioUrl) {
      onRecordingComplete({ blob: audioBlob, url: audioUrl });
    } else {
        toast({
            title: "Nenhum áudio gravado",
            description: "Grave um áudio antes de publicar.",
            variant: "destructive"
        })
    }
  };

  if (permissionError) {
    return (
        <Alert variant="destructive" className="w-full">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Acesso ao Microfone Necessário</AlertTitle>
            <AlertDescription>
                Você precisa permitir o acesso ao microfone para gravar áudio. Verifique as permissões do seu navegador.
                <Button onClick={getMicrophonePermission} variant="secondary" className="mt-2">Tentar Novamente</Button>
            </AlertDescription>
        </Alert>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full">
        {status === 'idle' && (
            <button onClick={startRecording} className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-110">
                <Mic className="w-10 h-10 text-white" />
            </button>
        )}
        
        {status === 'recording' && (
            <button onClick={stopRecording} className="w-24 h-24 bg-background border-4 border-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Pause className="w-10 h-10 text-red-500" />
            </button>
        )}

        {status === 'stopped' && audioUrl && (
            <div className="w-full flex flex-col items-center gap-4">
                <audio src={audioUrl} controls className="w-full rounded-full" />
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={startRecording}>
                        Gravar Novamente
                    </Button>
                    <Button onClick={handlePublish} disabled={isPublishing}>
                        {isPublishing ? <Loader2 className="animate-spin" /> : <Send />}
                        Publicar
                    </Button>
                </div>
            </div>
        )}
    </div>
  );
}

    