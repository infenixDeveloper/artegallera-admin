import { useState } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  Alert,
  CircularProgress
} from "@mui/material";
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from "@services/api";

const UserManagementModal = ({ open, onClose, user, onUserUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!user) return null;

  const handleToggleChatStatus = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newStatus = !user.is_active_chat;
      
      const response = await api.patch(`/user/${user.user_id}/chat-status`, {
        is_active_chat: newStatus
      });

      if (response.data?.success) {
        setSuccess(
          newStatus 
            ? `Usuario ${user.username} desbloqueado exitosamente` 
            : `Usuario ${user.username} bloqueado exitosamente`
        );
        
        // Notificar al componente padre que el usuario fue actualizado
        if (onUserUpdated) {
          onUserUpdated({
            ...user,
            is_active_chat: newStatus
          });
        }

        // Cerrar modal después de 1.5 segundos
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 1500);
      }
    } catch (error) {
      console.error("Error al cambiar estado del chat:", error);
      setError(
        error.response?.data?.message || 
        "Error al cambiar el estado del usuario"
      );
    } finally {
      setLoading(false);
    }
  };

  const isBlocked = !user.is_active_chat;

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        backgroundColor: '#333', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        {isBlocked ? <BlockIcon /> : <CheckCircleIcon />}
        Gestión de Usuario
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Usuario:</strong> {user.username}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>ID:</strong> {user.user_id}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 1,
              padding: 1,
              borderRadius: 1,
              backgroundColor: isBlocked ? '#ffebee' : '#e8f5e9',
              color: isBlocked ? '#c62828' : '#2e7d32'
            }}
          >
            <strong>Estado actual:</strong> {isBlocked ? '🔴 Bloqueado' : '🟢 Activo'}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mb: 2 }}>
          {isBlocked 
            ? `¿Deseas desbloquear a ${user.username} para que pueda enviar mensajes?`
            : `¿Deseas bloquear a ${user.username} para que no pueda enviar mensajes?`
          }
        </Typography>

        <Alert severity="info" sx={{ fontSize: '12px' }}>
          {isBlocked
            ? 'El usuario podrá enviar mensajes inmediatamente después de ser desbloqueado.'
            : 'El usuario será notificado automáticamente y no podrá enviar mensajes hasta que sea desbloqueado.'
          }
        </Alert>
      </DialogContent>
      
      <DialogActions sx={{ padding: 2, gap: 1 }}>
        <Button 
          onClick={onClose}
          disabled={loading}
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleToggleChatStatus}
          disabled={loading}
          variant="contained"
          color={isBlocked ? "success" : "error"}
          startIcon={loading ? <CircularProgress size={20} /> : (isBlocked ? <CheckCircleIcon /> : <BlockIcon />)}
        >
          {loading 
            ? 'Procesando...' 
            : isBlocked 
              ? 'Desbloquear Usuario' 
              : 'Bloquear Usuario'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserManagementModal;

