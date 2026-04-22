import api from './api';

export const uploadVideoFile = async (file, onProgress) => {
  if (!file) return null;
  
  const formData = new FormData();
  formData.append('video', file);
  
  try {
    const res = await api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) {
          const pct = Math.round((e.loaded * 100) / e.total);
          onProgress(pct);
        }
      }
    });
    
    if (res.data.success) {
      return res.data.videoUrl;
    }
    return null;
  } catch (err) {
    console.error('[VideoUpload] Failed:', err.message);
    return null;
  }
};

export const getVideoSrc = (videoUrl) => {
  if (!videoUrl) return null;
  if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
    return videoUrl;
  }
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
    .replace('/api', '');
  return `${base}${videoUrl}`;
};
