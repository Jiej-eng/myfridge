import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useCamera - wraps the MediaDevices API (navigator.mediaDevices.getUserMedia).
 *
 * Lifecycle:
 *   startCamera() -> requests the video stream and attaches it to a <video>
 *   capturePhoto() -> draws the current frame into a canvas and returns a
 *                     compressed JPEG data URL (small enough for localStorage)
 *   stopCamera()  -> stops every track so the camera light turns off
 *
 * The stream is always released on unmount - a leaked MediaStream keeps the
 * camera busy and makes the next attempt fail with NotReadableError.
 */
export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | starting | active | error
  const [error, setError] = useState('');

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus('idle');
  }, []);

  const startCamera = useCallback(async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('error');
      setError('This browser does not expose a camera API. Use the upload option instead.');
      return;
    }
    setStatus('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setStatus('active');
    } catch (cameraError) {
      setStatus('error');
      setError(describeCameraError(cameraError));
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;

    // Downscale to 720 px on the long edge: a full-resolution frame would be
    // several megabytes and blow the ~5 MB localStorage budget.
    const maxEdge = 720;
    const scale = Math.min(1, maxEdge / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.72);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  return { videoRef, status, error, startCamera, stopCamera, capturePhoto };
}

/** Converts the DOMException names into messages a student can act on. */
function describeCameraError(cameraError) {
  switch (cameraError?.name) {
    case 'NotAllowedError':
      return 'Camera permission was denied. Allow it in the browser site settings.';
    case 'NotFoundError':
      return 'No camera was found on this device.';
    case 'NotReadableError':
      return 'The camera is already in use by another application.';
    default:
      return 'The camera could not be started.';
  }
}

/** Turns an <input type="file" accept="image/*"> selection into a small data URL. */
export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxEdge = 720;
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      image.onerror = () => reject(new Error('That file is not a valid image.'));
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
