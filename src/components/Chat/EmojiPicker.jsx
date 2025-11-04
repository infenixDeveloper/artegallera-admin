import React, { useState } from 'react';
import { Box, IconButton, Popover, Grid, Typography } from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

const EmojiPicker = ({ onEmojiSelect }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
    '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐', '✋', '🖖', '👏',
    '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾',
    '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀',
    '👁', '👅', '👄', '💋', '🩸', '❤️', '🧡', '💛', '💚', '💙',
    '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗',
    '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️',
    '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋',
    '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️',
    '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️',
    '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲',
    '🅰️', '🅱️', '🆎', '🅾️', '🆑', '🅾️', '🆑', '🅾️', '🆑', '🅾️'
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{ 
          color: '#aaa',
          padding: '2px',
          minWidth: '26px',
          width: '26px',
          height: '26px',
          flexShrink: 0,
          '&:hover': {
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
        size="small"
      >
        <EmojiEmotionsIcon sx={{ fontSize: '18px' }} />
      </IconButton>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            backgroundColor: '#333',
            border: '1px solid #555',
            maxHeight: '300px',
            width: '240px',
            padding: '8px',
            borderRadius: '8px'
          }
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ color: 'white', mb: 1, textAlign: 'center' }}>
            Selecciona un emoji
          </Typography>
          <Grid container spacing={0.5}>
            {emojis.map((emoji, index) => (
              <Grid item xs={2} key={index}>
                <IconButton
                  onClick={() => handleEmojiClick(emoji)}
                  sx={{
                    fontSize: '20px',
                    padding: '4px',
                    '&:hover': {
                      backgroundColor: '#555'
                    }
                  }}
                >
                  {emoji}
                </IconButton>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Popover>
    </>
  );
};

export default EmojiPicker;
