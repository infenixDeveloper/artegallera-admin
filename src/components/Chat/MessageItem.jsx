import React from 'react';
import { Box, Typography, Tooltip, Checkbox } from '@mui/material';

const MessageItem = ({ message, username, userId, isAdmin = false, onUserClick, messageId, selectionMode = false, isSelected = false, onSelect }) => {
  // Función para generar un color consistente basado en el nombre del usuario
  const getUserColor = (username) => {
    if (!username) return '#888';
    
    const colors = [
      '#4caf50', // Verde
      '#2196f3', // Azul
      '#ff9800', // Naranja
      '#9c27b0', // Púrpura
      '#f44336', // Rojo
      '#00bcd4', // Cian
      '#ffeb3b', // Amarillo
      '#e91e63', // Rosa
      '#795548', // Marrón
      '#607d8b', // Azul gris
      '#8bc34a', // Verde claro
      '#ff5722', // Rojo naranja
    ];
    
    // Generar un índice basado en el nombre del usuario
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const renderContent = (content) => {
    // Si es un objeto con archivo multimedia
    if (typeof content === 'object' && content.type) {
      return (
        <>
          {content.type === 'image' && (
            <Box sx={{ mb: 0.5, mt: 0.5 }}>
              <img
                src={content.url}
                alt={content.name}
                onError={(e) => {
                  console.error('Error cargando imagen:', content.url);
                  e.target.style.display = 'none';
                }}
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <Typography variant="caption" sx={{ color: 'gray', display: 'block', mt: 0.5, fontSize: '10px' }}>
                {content.name}
              </Typography>
            </Box>
          )}
          {content.type === 'video' && (
            <Box sx={{ mb: 0.5, mt: 0.5 }}>
              <video
                controls
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  borderRadius: '8px'
                }}
              >
                <source src={content.url} type={content.file?.type} />
                Tu navegador no soporta videos.
              </video>
              <Typography variant="caption" sx={{ color: 'gray', display: 'block', mt: 0.5, fontSize: '10px' }}>
                {content.name}
              </Typography>
            </Box>
          )}
          {content.text && (
            <Typography 
              component="div"
              sx={{ 
                color: 'white',
                fontSize: '10px',
                lineHeight: 1.4,
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                fontFamily: 'inherit',
                mt: 0.5
              }}
            >
              {content.text}
            </Typography>
          )}
        </>
      );
    }

    return null;
  };

  const userColor = getUserColor(username);

  const handleUsernameClick = (e) => {
    e.stopPropagation();
    // Solo permitir click si no es admin y hay un callback
    if (!isAdmin && onUserClick && userId) {
      onUserClick(userId, username);
    }
  };

  const isClickable = !isAdmin && onUserClick && userId;

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    if (onSelect && messageId) {
      onSelect(messageId);
    }
  };

  // Handler para hacer click en todo el mensaje cuando está en modo de selección
  const handleMessageClick = (e) => {
    // No hacer nada si se está clickeando el username para gestionar usuario
    if (e.target.closest('[data-username-click]')) {
      return;
    }
    
    // Si está en modo de selección, alternar selección
    if (selectionMode && onSelect && messageId) {
      onSelect(messageId);
    }
  };

  return (
    <Box 
      onClick={selectionMode ? handleMessageClick : undefined}
      sx={{ 
        mb: 0.3, 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: 0.3,
        backgroundColor: selectionMode && isSelected ? 'rgba(33, 150, 243, 0.15)' : 'transparent',
        borderRadius: '3px',
        padding: selectionMode ? '3px 4px' : '0',
        transition: 'all 0.15s',
        cursor: selectionMode ? 'pointer' : 'default',
        '&:hover': selectionMode ? {
          backgroundColor: isSelected ? 'rgba(33, 150, 243, 0.25)' : 'rgba(255, 255, 255, 0.04)'
        } : {}
      }}
    >
      {/* Checkbox de selección */}
      {selectionMode && (
        <Checkbox
          checked={isSelected}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          size="small"
          sx={{
            padding: '0',
            margin: '0',
            color: '#666',
            '&.Mui-checked': {
              color: '#2196f3',
            },
            '& .MuiSvgIcon-root': {
              fontSize: 12
            }
          }}
        />
      )}
      
      <Typography 
        component="div" 
        sx={{ 
          color: 'white',
          fontSize: '10px',
          lineHeight: 1.1,
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          fontFamily: 'inherit',
          flex: 1,
          minWidth: 0
        }}
      >
        <Tooltip 
          title={isClickable ? "Click para gestionar usuario" : ""} 
          placement="top"
          arrow
        >
          <Typography 
            component="span" 
            onClick={handleUsernameClick}
            data-username-click="true"
            sx={{ 
              fontWeight: 'bold',
              color: userColor,
              fontSize: '10px',
              lineHeight: 1.1,
              fontFamily: 'inherit',
              cursor: isClickable ? 'pointer' : 'default',
              '&:hover': isClickable ? {
                textDecoration: 'underline',
                opacity: 0.8
              } : {},
              position: 'relative',
              zIndex: 2
            }}
          >
            {username || 'Usuario'}:
          </Typography>
        </Tooltip>
        {' '}
        {typeof message === 'object' && message.type ? (
          <Box component="div" sx={{ mt: 0.3 }}>
            {renderContent(message)}
          </Box>
        ) : (
          <Typography component="span" sx={{ fontSize: '10px', fontFamily: 'inherit' }}>
            {message}
          </Typography>
        )}
      </Typography>
    </Box>
  );
};

export default MessageItem;
