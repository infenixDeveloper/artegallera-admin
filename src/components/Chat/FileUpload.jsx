import React, { useRef, useState } from 'react';
import { Box, IconButton, Typography, LinearProgress } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import VideoFileIcon from '@mui/icons-material/VideoFile';

const FileUpload = ({ onFileSelect, disabled }) => {
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileClick = () => {
    if (!disabled) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi'];
    
    if (!allowedImageTypes.includes(file.type) && !allowedVideoTypes.includes(file.type)) {
      alert('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP) y video (MP4, WebM, OGG, AVI)');
      return;
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 10MB permitido.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simular progreso de carga
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    try {
      // Aquí iría la lógica real de subida al servidor
      // Por ahora simulamos la carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadProgress(100);
      
      // Crear objeto con información del archivo
      const fileData = {
        file,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file) // URL temporal para preview
      };

      onFileSelect(fileData);
      
    } catch (error) {
      console.error('Error al subir archivo:', error);
      alert('Error al subir el archivo');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Limpiar el input
      event.target.value = '';
    }
  };

  const getFileIcon = () => {
    return <AttachFileIcon />;
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <IconButton
        onClick={handleFileClick}
        disabled={disabled || isUploading}
        sx={{ 
          color: 'white', 
          padding: '4px',
          opacity: disabled || isUploading ? 0.5 : 1
        }}
        size="small"
      >
        {getFileIcon()}
      </IconButton>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      {isUploading && (
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#333',
            padding: '4px',
            borderRadius: '4px',
            zIndex: 1000,
            minWidth: '150px'
          }}
        >
          <Typography variant="caption" sx={{ color: 'white', display: 'block', mb: 1 }}>
            Subiendo archivo...
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress}
            sx={{
              backgroundColor: '#555',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#4caf50'
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
