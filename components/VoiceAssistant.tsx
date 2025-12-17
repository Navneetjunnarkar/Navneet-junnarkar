import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { getApiKey, SYSTEM_INSTRUCTION } from '../services/geminiService';

interface VoiceAssistantProps {
  language: Language;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ language }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const t = translations[language];

  // Audio Context Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputNodeRef = useRef<ScriptProcessorNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null); // LiveSession
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const currentInputTranscription = useRef<string>('');
  const currentOutputTranscription = useRef<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  const disconnect = () => {
    // 1. Close session
    if (sessionRef.current) {
      // session.close() might not exist on the type depending on SDK version, but connection closes on audio context stop usually
      // Ideally calling close if available.
    }

    // 2. Stop tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // 3. Close Audio Contexts
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    // 4. Reset State
    setIsConnected(false);
    setIsSpeaking(false);
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const connect = async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setError("API Key missing. Please check Vercel settings.");
      return;
    }

    setError(null);
    setTranscripts([]);

    try {
      // --- 1. Setup Audio Contexts ---
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);
      outputNodeRef.current = outputNode;

      // --- 2. Setup Gemini Live Client ---
      const ai = new GoogleGenAI({ apiKey });
      
      // Determine language instruction
      let langInstruction = "Respond in English.";
      if (language === 'hi') langInstruction = "Respond in Hindi (Devanagari).";
      else if (language === 'mr') langInstruction = "Respond in Marathi (Devanagari).";
      else if (language === 'pa') langInstruction = "Respond in Punjabi (Gurmukhi).";
      else if (language === 'raj') langInstruction = "Respond in Rajasthani or Hindi with Rajasthani context.";

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `${SYSTEM_INSTRUCTION}\n\nIMPORTANT: ${langInstruction} Keep your audio responses concise and conversational (under 40 words if possible) unless explaining a complex case.`,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          inputAudioTranscription: { model: 'gemini-2.5-flash-native-audio-preview-09-2025' },
          outputAudioTranscription: { model: 'gemini-2.5-flash-native-audio-preview-09-2025' }
        },
        callbacks: {
          onopen: async () => {
            console.log("Gemini Live Connected");
            setIsConnected(true);
            
            // --- 3. Start Input Stream ---
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              streamRef.current = stream;
              
              const source = inputCtx.createMediaStreamSource(stream);
              const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
              inputNodeRef.current = scriptProcessor;

              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(inputCtx.destination);
            } catch (err) {
              console.error("Microphone access failed", err);
              setError("Microphone access failed.");
              disconnect();
            }
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Transcriptions
            if (msg.serverContent?.outputTranscription) {
               currentOutputTranscription.current += msg.serverContent.outputTranscription.text;
            } else if (msg.serverContent?.inputTranscription) {
               currentInputTranscription.current += msg.serverContent.inputTranscription.text;
            }

            if (msg.serverContent?.turnComplete) {
                if (currentInputTranscription.current) {
                    setTranscripts(prev => [...prev, { role: 'user', text: currentInputTranscription.current }]);
                    currentInputTranscription.current = '';
                }
                if (currentOutputTranscription.current) {
                    setTranscripts(prev => [...prev, { role: 'model', text: currentOutputTranscription.current }]);
                    currentOutputTranscription.current = '';
                }
            }

            // Handle Audio Output
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
               try {
                 const ctx = outputAudioContextRef.current;
                 if (!ctx) return;
                 
                 setIsSpeaking(true);
                 // Ensure nextStartTime is at least current time
                 nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

                 const audioBuffer = await decodeAudioData(
                   decode(base64Audio),
                   ctx,
                   24000,
                   1
                 );

                 const source = ctx.createBufferSource();
                 source.buffer = audioBuffer;
                 source.connect(outputNodeRef.current!);
                 
                 source.addEventListener('ended', () => {
                    sourcesRef.current.delete(source);
                    if (sourcesRef.current.size === 0) setIsSpeaking(false);
                 });

                 source.start(nextStartTimeRef.current);
                 nextStartTimeRef.current += audioBuffer.duration;
                 sourcesRef.current.add(source);

               } catch (e) {
                 console.error("Audio decode error", e);
               }
            }

            // Handle Interruption
            if (msg.serverContent?.interrupted) {
                console.log("Interrupted");
                sourcesRef.current.forEach(source => source.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setIsSpeaking(false);
                // Flush transcripts on interrupt
                if (currentOutputTranscription.current) {
                    setTranscripts(prev => [...prev, { role: 'model', text: currentOutputTranscription.current }]);
                    currentOutputTranscription.current = '';
                }
            }
          },
          onclose: () => {
            console.log("Session Closed");
            setIsConnected(false);
          },
          onerror: (err) => {
            console.error("Session Error", err);
            setError("Connection Error. Please retry.");
            disconnect();
          }
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      console.error("Connection Failed", err);
      setError(err.message || "Failed to connect to Live API.");
      setIsConnected(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => disconnect();
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <div className="p-6 text-center z-10">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">{t.voiceTitle}</h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto">{t.voiceDesc}</p>
        <p className="text-xs text-blue-400 mt-1">Powered by Gemini Live API</p>
      </div>

      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
         {/* Visualizer Circle */}
         <div className="relative mb-8">
            {isConnected && (
                <>
                    <div className="absolute inset-0 bg-blue-500 rounded-full opacity-10 animate-ping delay-75"></div>
                    <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping delay-150"></div>
                </>
            )}
            
            <button
              onClick={isConnected ? disconnect : connect}
              className={`relative z-20 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
                isConnected 
                  ? 'bg-red-500 text-white border-4 border-red-200' 
                  : 'bg-blue-900 text-white border-4 border-blue-200'
              }`}
            >
                {isConnected ? (
                   <i className="fa-solid fa-phone-slash text-4xl"></i>
                ) : (
                   <i className="fa-solid fa-microphone text-4xl"></i>
                )}
            </button>

            {/* Status Badge */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-md text-xs font-bold whitespace-nowrap z-30">
                {error ? (
                    <span className="text-red-500">{error}</span>
                ) : isConnected ? (
                    isSpeaking ? (
                        <span className="text-green-500 flex items-center gap-1">
                            <i className="fa-solid fa-volume-high animate-pulse"></i> Speaking...
                        </span>
                    ) : (
                        <span className="text-blue-500 flex items-center gap-1">
                            <i className="fa-solid fa-ear-listen animate-pulse"></i> Listening...
                        </span>
                    )
                ) : (
                    <span className="text-slate-500">Tap to Start</span>
                )}
            </div>
         </div>
      </div>

      {/* Transcript Area */}
      <div className="h-64 bg-white border-t border-slate-200 p-4 overflow-y-auto" ref={scrollRef}>
          {transcripts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-300 text-sm italic">
                  Conversation history will appear here...
              </div>
          ) : (
              <div className="space-y-3">
                  {transcripts.map((item, idx) => (
                      <div key={idx} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                              item.role === 'user' 
                                ? 'bg-blue-100 text-blue-900 rounded-tr-none' 
                                : 'bg-slate-100 text-slate-800 rounded-tl-none'
                          }`}>
                              <p>{item.text}</p>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

// --- Audio Helper Functions ---

function createBlob(data: Float32Array): { data: string, mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      // Clamp values
      const s = Math.max(-1, Math.min(1, data[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
}

function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

export default VoiceAssistant;