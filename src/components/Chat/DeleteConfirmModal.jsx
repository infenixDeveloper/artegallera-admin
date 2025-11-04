import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  CircularProgress
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const DeleteConfirmModal = ({ open, onClose, onConfirm, messageCount, loading = false }) => {
  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: '#2c2c2c', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        pb: 2
      }}>
        <Box sx={{ 
          backgroundColor: '#ff9800', 
          borderRadius: '50%', 
          width: 40, 
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <WarningAmberIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Confirmar Eliminación
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2, pb: 1 }}>
        <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
          ¿Estás seguro de que deseas eliminar <strong style={{ color: '#f44336' }}>{messageCount}</strong> mensaje{messageCount > 1 ? 's' : ''}?
        </Typography>
        
        <Box sx={{ 
          backgroundColor: '#fff3e0', 
          padding: 2, 
          borderRadius: '8px',
          borderLeft: '4px solid #ff9800'
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
            ⚠️ Esta acción no se puede deshacer. Los mensajes serán eliminados permanentemente.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ padding: 2, gap: 1, backgroundColor: '#f5f5f5' }}>
        <Button 
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
            px: 3
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color="error"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
            px: 3,
            fontWeight: 600
          }}
        >
          {loading ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmModal;

