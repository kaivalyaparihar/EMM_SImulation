//frontend/src/context/CameraContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";

interface CameraContextType {
  stream: MediaStream | null;
  isActive: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  captureFrame: () => string | null;
}

const CameraContext = createContext<CameraContextType>({
  stream: null,
  isActive: false,
  error: null,
  startCamera: async () => { },
  stopCamera: () => { },
  videoRef: { current: null },
  captureFrame: () => null,
});

export const useCamera = () => useContext(CameraContext);

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startCamera = useCallback(async () => {
    if (stream) return; // Already active, don't reinitialize

    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      setStream(mediaStream);
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Camera access denied";
      setError(message);
      setIsActive(false);
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !isActive) return null;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.6);
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <CameraContext.Provider
      value={{
        stream,
        isActive,
        error,
        startCamera,
        stopCamera,
        videoRef,
        captureFrame,
      }}
    >
      {children}
      {/* Hidden video element that persists across view switches */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: "none" }}
      />
    </CameraContext.Provider>
  );
};
