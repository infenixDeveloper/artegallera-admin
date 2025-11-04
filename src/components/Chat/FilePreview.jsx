import React from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import VideoFileIcon from '@mui/icons-material/VideoFile';

const FilePreview = ({ file, onRemove }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        p: 0.5,
        backgroundColor: '#444',
        borderRadius: '6px',
        border: '1px solid #666',
        mb: 0.5,
        maxWidth: '100%',
        height: '32px' // Altura fija más compacta
      }}
    >
      {/* Icono del tipo de archivo */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {file.type === 'image' ? (
          <ImageIcon sx={{ color: '#4caf50', fontSize: '20px' }} />
        ) : (
          <VideoFileIcon sx={{ color: '#ff9800', fontSize: '20px' }} />
        )}
      </Box>

      {/* Información del archivo */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'white',
            display: 'block',
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {file.name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: '#ccc',
            fontSize: '10px'
          }}
        >
          {formatFileSize(file.size)}
        </Typography>
      </Box>

      {/* Preview pequeño */}
      <Box sx={{ width: '24px', height: '24px', borderRadius: '3px', overflow: 'hidden' }}>
        {file.type === 'image' ? (
          <img
            src={file.url}
            alt="Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <video
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            muted
          >
            <source src={file.url} type={file.file?.type} />
          </video>
        )}
      </Box>

      {/* Botón para eliminar */}
      <IconButton
        onClick={onRemove}
        size="small"
        sx={{
          color: '#ff4444',
          padding: '2px',
          minWidth: '20px',
          height: '20px',
          '&:hover': {
            backgroundColor: '#ff444420'
          }
        }}
      >
        <CloseIcon sx={{ fontSize: '12px' }} />
      </IconButton>
    </Box>
  );
};

export default FilePreview;
