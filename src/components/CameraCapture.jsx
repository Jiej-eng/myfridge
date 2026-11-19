import { useEffect, useRef } from 'react';
import { Camera, ImagePlus, RefreshCw, VideoOff } from 'lucide-react';
import { useCamera, readImageFile } from '../hooks/useCamera.js';
import Modal from './Modal.jsx';

/**
 * CameraCapture - the UI for the MediaDevices feature.
 * A live <video> preview comes from useCamera; a shutter button grabs a frame.
 * If the API is unavailable or refused, the same dialog still lets the user
 * pick a photo from the device, which keeps the flow usable.
 */
export default function CameraCapture({ onCapture, onClose }) {
  const { videoRef, status, error, startCamera, stopCamera, capturePhoto } = useCamera();
  const fileInputRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleShutter = () => {
    const photo = capturePhoto();
    if (photo) {
      onCapture(photo);
      stopCamera();
      onClose();
    }
  };

  const handleFile = async (event) => {
    try {
      const photo = await readImageFile(event.target.files?.[0]);
      if (photo) {
        onCapture(photo);
        onClose();
      }
    } catch {
      /* handled by the thumbnail staying empty */
    }
  };

  return (
    <Modal
      title="Take a photo"
      subtitle="Label the item so you can spot it at a glance."
      onClose={onClose}
      variant="camera"
    >
      <div className="camera-stage">
        {status === 'error' ? (
          <div className="camera-placeholder">
            <VideoOff size={34} aria-hidden="true" />
            <p>{error}</p>
          </div>
        ) : (
          <video ref={videoRef} className="camera-video" playsInline muted aria-label="Camera preview" />
        )}
        {status === 'starting' && <span className="camera-loading">Starting camera…</span>}
      </div>

      <div className="camera-actions">
        <button type="button" className="primary-button" onClick={handleShutter} disabled={status !== 'active'}>
          <Camera size={18} /> Capture
        </button>
        <button type="button" className="ghost-button" onClick={() => fileInputRef.current?.click()}>
          <ImagePlus size={18} /> Upload instead
        </button>
        {status === 'error' && (
          <button type="button" className="ghost-button" onClick={startCamera}>
            <RefreshCw size={18} /> Retry
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleFile}
      />

      <p className="camera-hint">
        Permission is requested by the browser the first time you open this dialog. The photo is resized to
        720 px and stored with the item, so it survives a reload.
      </p>
    </Modal>
  );
}
