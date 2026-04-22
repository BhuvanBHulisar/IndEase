import { useState } from 'react';
import { uploadVideoFile } from '../services/videoUpload';

export default function VideoUploadInput({ onUploaded, onFileSelected }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file.');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('Video must be under 100MB.');
      return;
    }

    setError('');
    setFileName(file.name);
    setProgress(0);

    // Notify parent of file selection immediately
    if (onFileSelected) onFileSelected(file);

    // Upload
    setUploading(true);
    const videoUrl = await uploadVideoFile(file, (pct) => setProgress(pct));
    setUploading(false);

    if (videoUrl) {
      if (onUploaded) onUploaded(videoUrl);
    } else {
      setError('Upload failed. Please try again.');
    }
  };

  return (
    <div>
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        border: '1px dashed #D1D5DB',
        borderRadius: '8px',
        cursor: 'pointer',
        background: '#FAFAFA',
        fontSize: '13px',
        color: '#6B7280',
        transition: 'border-color 0.2s'
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.258a1 1 0 01-1.447.894L15 14"/>
          <rect x="2" y="6" width="13" height="12" rx="2"/>
        </svg>
        {uploading
          ? `Uploading... ${progress}%`
          : fileName
            ? fileName
            : 'Upload fault video'
        }
        <input
          type="file"
          accept="video/*"
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </label>

      {uploading && (
        <div style={{
          marginTop: '6px',
          height: '4px',
          background: '#E5E7EB',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: '#2563EB',
            borderRadius: '2px',
            transition: 'width 0.3s'
          }} />
        </div>
      )}

      {error && (
        <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>
          {error}
        </p>
      )}
    </div>
  );
}
