import { getVideoSrc } from '../services/videoUpload';

export default function VideoPlayer({ videoUrl, label = 'Recorded video' }) {
  const src = getVideoSrc(videoUrl);
  
  if (!src) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        background: '#F9FAFB',
        borderRadius: '8px',
        color: '#9CA3AF',
        fontSize: '13px',
        border: '1px solid #E5E7EB'
      }}>
        No video uploaded for this request.
      </div>
    );
  }
  
  return (
    <div>
      <video
        key={src}
        controls
        playsInline
        style={{
          width: '100%',
          borderRadius: '8px',
          maxHeight: '260px',
          background: '#000',
          display: 'block'
        }}
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        Your browser does not support video playback.
      </video>
      <p style={{
        fontSize: '11px',
        color: '#9CA3AF',
        marginTop: '4px',
        textAlign: 'center'
      }}>
        {label}
      </p>
    </div>
  );
}
