'use client';
import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

/** Groq Orpheus TTS accepts max 200 characters per request. */
const AUDIO_TEXT_MAX_LENGTH = 200;

interface Props {
  textForAudio: string;
  topic: string;
  /** Stability AI: data URL of generated lesson image (keyframe). */
  videoImageDataUrl?: string;
  /** Stability AI: data URL of generated MP4 video. */
  videoDataUrl?: string;
}

export default function VideoVisualizer({ textForAudio, topic, videoImageDataUrl, videoDataUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasStabilityVisual = Boolean(videoDataUrl || videoImageDataUrl);
  const audioRef = useRef<HTMLAudioElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const videoBlobUrlRef = useRef<string | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Use a blob URL for video when we have a data URL so the video element loads reliably
  useEffect(() => {
    if (!videoDataUrl?.startsWith('data:')) {
      if (videoBlobUrlRef.current) {
        URL.revokeObjectURL(videoBlobUrlRef.current);
        videoBlobUrlRef.current = null;
      }
      setVideoSrc(videoDataUrl ?? null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(videoDataUrl);
        if (!res.ok || cancelled) return;
        const blob = await res.blob();
        if (cancelled) return;
        if (videoBlobUrlRef.current) URL.revokeObjectURL(videoBlobUrlRef.current);
        const url = URL.createObjectURL(blob);
        videoBlobUrlRef.current = url;
        setVideoSrc(url);
      } catch {
        setVideoSrc(videoDataUrl);
      }
    })();
    return () => {
      cancelled = true;
      if (videoBlobUrlRef.current) {
        URL.revokeObjectURL(videoBlobUrlRef.current);
        videoBlobUrlRef.current = null;
      }
    };
  }, [videoDataUrl]);

  useEffect(() => {
    if (!textForAudio?.trim()) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setAudioUrl(null);
      setAudioError(null);
      return;
    }

    const text = textForAudio.substring(0, AUDIO_TEXT_MAX_LENGTH);
    const controller = new AbortController();

    fetch('/api/ai/audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const contentType = res.headers.get('content-type');
          let message = 'Could not load audio.';
          if (contentType?.includes('application/json')) {
            try {
              const data = await res.json();
              if (typeof data?.error === 'string') message = data.error;
            } catch {
              // use default message
            }
          }
          throw new Error(message);
        }
        return res.blob();
      })
      .then((blob) => {
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        setAudioUrl(url);
        setAudioError(null);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setAudioError(err instanceof Error ? err.message : 'Could not load audio.');
        setAudioUrl(null);
      });

    return () => {
      controller.abort();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setAudioUrl(null);
    };
  }, [textForAudio]);

  const togglePlay = () => {
    if (videoRef.current && (videoSrc ?? videoDataUrl)) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }
    if (audioRef.current?.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (hasStabilityVisual) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.002;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#1e1b4b');
      gradient.addColorStop(1, '#312e81');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 20; i++) {
        const x = (Math.sin(time + i) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(time * 0.8 + i) * 0.5 + 0.5) * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, isPlaying ? 30 + Math.sin(time) * 10 : 20, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${0.1 + (i / 40)})`;
        ctx.fill();
      }

      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(topic, canvas.width / 2, canvas.height / 2);

      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('AI Video Explanation Sync', canvas.width / 2, canvas.height / 2 + 30);

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasStabilityVisual, isPlaying, topic]);

  const showVideo = Boolean(videoDataUrl);
  const effectiveVideoSrc = videoSrc ?? videoDataUrl ?? undefined;

  return (
    <div className="relative group rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
      {showVideo && effectiveVideoSrc ? (
        <video
          ref={videoRef}
          src={effectiveVideoSrc}
          className="w-full aspect-video bg-black object-cover"
          playsInline
          muted={false}
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      ) : videoImageDataUrl ? (
        <img
          src={videoImageDataUrl}
          alt={topic}
          decoding="async"
          className="w-full aspect-video bg-black object-cover"
        />
      ) : (
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full aspect-video bg-black"
        />
      )}

      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={togglePlay}
          disabled={!audioUrl}
          className="p-6 bg-white/20 backdrop-blur-xl rounded-full border border-white/40 hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlaying ? <Pause className="text-white w-8 h-8" /> : <Play className="text-white w-8 h-8 fill-current" />}
        </button>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
        <Volume2 className="text-white w-5 h-5 shrink-0" />
        {audioError ? (
          <span className="text-red-300 text-sm">{audioError}</span>
        ) : (
          <audio
            ref={audioRef}
            src={audioUrl ?? undefined}
            onEnded={() => setIsPlaying(false)}
            className="flex-1 h-8 min-w-0"
          />
        )}
        <span className="text-white text-xs font-medium px-2 py-1 bg-brand-primary/50 rounded shrink-0">
          {videoDataUrl ? 'AUTO-SYNC VIDEO' : 'LESSON VISUAL'}
        </span>
      </div>
    </div>
  );
}
