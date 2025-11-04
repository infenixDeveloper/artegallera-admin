import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  setSelectedEvent,
  setSelectedUser,
  clearFilters,
  filterMessages,
  deleteMessage,
} from "@redux/slice/messagesSlice";
import { getEvents } from "@redux/slice/eventsSlice";
import { fetchUsers } from "@redux/slice/userSlice";
import {
  Typography,
  Box,
  IconButton,
  Avatar,
  Tooltip,
  Autocomplete,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import ImageIcon from "@mui/icons-material/Image";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CancelIcon from "@mui/icons-material/Cancel";
import Checkbox from "@mui/material/Checkbox";
import AppButton from "@components/Button/Button";
import Modal from "@components/Modal/Modal";
import ModalHeader from "@components/Modal/ModalHeader";
import ModalBody from "@components/Modal/ModalBody";
import "./EventChats.css";

const EventChats = () => {
  const dispatch = useDispatch();
  const { filteredList: messages, status, selectedEvent, selectedUser } = useSelector((state) => state.messages);
  const { events } = useSelector((state) => state.results);
  const { list: users } = useSelector((state) => state.users);

  const [localEventFilter, setLocalEventFilter] = useState(null);
  const [localUserFilter, setLocalUserFilter] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ url: "", username: "", date: "" });
  
  // Estados para modo de selección múltiple
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Estado para Snackbar (toast)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(fetchMessages());
    dispatch(getEvents());
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleEventFilterChange = (event, newValue) => {
    setLocalEventFilter(newValue);
    const eventId = newValue?.id === null ? null : (newValue?.id || null);
    dispatch(setSelectedEvent(eventId));
    // Aplicar filtros automáticamente
    setTimeout(() => {
      dispatch(filterMessages());
    }, 100);
  };

  const handleUserFilterChange = (event, newValue) => {
    setLocalUserFilter(newValue);
    const userId = newValue?.id || null;
    dispatch(setSelectedUser(userId));
    // Aplicar filtros automáticamente
    setTimeout(() => {
      dispatch(filterMessages());
    }, 100);
  };

  const handleClearFilters = () => {
    setLocalEventFilter(null);
    setLocalUserFilter(null);
    dispatch(clearFilters());
  };

  const handleRefresh = () => {
    if (selectedEvent) {
      dispatch(fetchMessages({ event_id: selectedEvent }));
    } else {
      dispatch(fetchMessages());
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este mensaje?")) {
      try {
        await dispatch(deleteMessage(messageId)).unwrap();
        setSnackbar({
          open: true,
          message: 'Mensaje eliminado exitosamente',
          severity: 'success'
        });
      } catch (error) {
        console.error(error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Error al eliminar el mensaje',
          severity: 'error'
        });
      }
    }
  };

  const handleOpenImageModal = (imageUrl, username, date) => {
    // Formatear la URL de la imagen igual que en el chat de tiempo real
    const baseURL = import.meta.env.MODE === 'production' 
      ? import.meta.env.VITE_API_URL_PROD
      : import.meta.env.VITE_API_URL_DEV || "http://localhost:3002";
    
    // Si la URL ya es completa (empieza con http), usarla tal cual
    // Si no, agregar el baseURL
    const fullImageUrl = imageUrl?.startsWith('http') 
      ? imageUrl 
      : `${baseURL}${imageUrl}`;
    
    setSelectedImage({ url: fullImageUrl, username, date });
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage({ url: "", username: "", date: "" });
  };

  // Activar/desactivar modo de selección
  const toggleSelectionMode = () => {
    setSelectionMode(prev => !prev);
    setSelectedMessages(new Set()); // Limpiar selección al cambiar modo
  };

  // Manejar selección de un mensaje
  const handleMessageSelect = (messageId) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Seleccionar/deseleccionar todos
  const handleSelectAll = () => {
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set());
    } else {
      const allIds = new Set(messages.map(msg => msg.id));
      setSelectedMessages(allIds);
    }
  };

  // Abrir modal de confirmación de eliminación
  const handleDeleteSelected = () => {
    if (selectedMessages.size === 0) {
      setSnackbar({
        open: true,
        message: 'No hay mensajes seleccionados',
        severity: 'warning'
      });
      return;
    }
    setDeleteModalOpen(true);
  };

  // Confirmar eliminación de mensajes múltiples
  const confirmDeleteMessages = async () => {
    const messageIds = Array.from(selectedMessages);
    
    try {
      // Eliminar todos los mensajes seleccionados
      const deletePromises = messageIds.map(id => dispatch(deleteMessage(id)).unwrap());
      await Promise.all(deletePromises);
      
      // Limpiar selección y salir del modo de selección
      setSelectedMessages(new Set());
      setSelectionMode(false);
      setDeleteModalOpen(false);
      
      setSnackbar({
        open: true,
        message: `${messageIds.length} mensaje(s) eliminado(s) exitosamente`,
        severity: 'success'
      });
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al eliminar los mensajes',
        severity: 'error'
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getEventName = (eventId) => {
    if (!eventId) return "Chat General";
    const event = events?.find((e) => e.id === eventId);
    return event ? event.name : `Evento #${eventId}`;
  };

  const getUserName = (user) => {
    if (!user) return "Usuario desconocido";
    return user.username || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Usuario";
  };

  // Preparar opciones para los Autocomplete
  const eventOptions = [
    { id: null, name: "Chat General", label: "Chat General" },
    ...(events?.map((event) => ({
      id: event.id,
      name: event.name,
      label: event.name,
      location: event.location,
      date: event.date,
    })) || []),
  ];

  const userOptions = users?.map((user) => ({
    id: user.id,
    username: user.username,
    label: `${user.username} - ${user.first_name} ${user.last_name}`,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
  })) || [];

  return (
    <div className="event-chats__container">
      <Typography variant="h4" color="white" className="event-chats__title">
        Evento - Chats
      </Typography>

      {/* Filtros */}
      <Box className="event-chats__filters">
        <div className="event-chats__filters-row">
          <Autocomplete
            className="event-chats__filter-control"
            options={eventOptions}
            value={localEventFilter}
            onChange={handleEventFilterChange}
            getOptionLabel={(option) => option.label || ""}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Filtrar por Evento"
                placeholder="Buscar evento..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <EventIcon sx={{ color: "rgba(255, 255, 255, 0.5)", ml: 1, mr: -0.5 }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
                sx={{
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.23)" },
                    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                    "&.Mui-focused fieldset": { borderColor: "white" },
                  },
                  "& .MuiAutocomplete-endAdornment .MuiSvgIcon-root": { color: "white" },
                  "& .MuiInputBase-input::placeholder": { color: "rgba(255, 255, 255, 0.5)", opacity: 1 },
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id || "general"}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EventIcon sx={{ fontSize: 20, color: "#00bcd4" }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "white" }}>
                      {option.name}
                    </Typography>
                    {option.location && (
                      <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                        {option.location}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </li>
            )}
            noOptionsText="No se encontraron eventos"
            clearText="Limpiar"
            openText="Abrir"
            closeText="Cerrar"
            sx={{ flex: 1 }}
          />

          <Autocomplete
            className="event-chats__filter-control"
            options={userOptions}
            value={localUserFilter}
            onChange={handleUserFilterChange}
            getOptionLabel={(option) => option.label || ""}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Filtrar por Usuario"
                placeholder="Buscar usuario..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <PersonIcon sx={{ color: "rgba(255, 255, 255, 0.5)", ml: 1, mr: -0.5 }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
                sx={{
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.23)" },
                    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                    "&.Mui-focused fieldset": { borderColor: "white" },
                  },
                  "& .MuiAutocomplete-endAdornment .MuiSvgIcon-root": { color: "white" },
                  "& .MuiInputBase-input::placeholder": { color: "rgba(255, 255, 255, 0.5)", opacity: 1 },
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: "#f50057", fontSize: "0.875rem" }}>
                    {option.username?.charAt(0).toUpperCase() || "U"}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "white" }}>
                      {option.username}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                      {option.first_name} {option.last_name}
                    </Typography>
                  </Box>
                </Box>
              </li>
            )}
            noOptionsText="No se encontraron usuarios"
            clearText="Limpiar"
            openText="Abrir"
            closeText="Cerrar"
            sx={{ flex: 1 }}
          />
        </div>

        <div className="event-chats__buttons-row">
          <AppButton 
            variant="gradient" 
            onClick={handleClearFilters} 
            startIcon={<ClearIcon />}
            sx={{
              minHeight: "56px",
              fontSize: "0.95rem",
              fontWeight: "600",
              padding: "0 2rem",
              flex: 1,
              color: "black",
            }}
          >
            Limpiar Filtros
          </AppButton>

          <AppButton 
            variant="gradient" 
            onClick={handleRefresh} 
            startIcon={<RefreshIcon />}
            sx={{
              minHeight: "56px",
              fontSize: "0.95rem",
              fontWeight: "600",
              padding: "0 2rem",
              flex: 1,
              color: "black",
            }}
          >
            Actualizar
          </AppButton>

          {!selectionMode && (
            <AppButton 
              variant="gradient" 
              onClick={toggleSelectionMode} 
              startIcon={<CheckBoxIcon />}
              sx={{
                minHeight: "56px",
                fontSize: "0.95rem",
                fontWeight: "600",
                padding: "0 2rem",
                flex: 1,
                color: "black",
              }}
            >
              Seleccionar
            </AppButton>
          )}
        </div>
      </Box>

      {/* Barra de herramientas con modo de selección */}
      {selectionMode && (
        <Box className="event-chats__selection-toolbar">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body1" sx={{ color: "white", fontWeight: 600 }}>
              {selectedMessages.size} mensaje(s) seleccionado(s)
            </Typography>
            <AppButton
              variant="gradient"
              onClick={handleSelectAll}
              sx={{
                minHeight: "40px",
                fontSize: "0.85rem",
                padding: "0 1.5rem",
                color: "black",
              }}
            >
              {selectedMessages.size === messages.length ? "Deseleccionar Todos" : "Seleccionar Todos"}
            </AppButton>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <AppButton
              variant="gradient"
              onClick={handleDeleteSelected}
              disabled={selectedMessages.size === 0}
              startIcon={<DeleteOutlinedIcon />}
              sx={{
                minHeight: "40px",
                fontSize: "0.85rem",
                padding: "0 1.5rem",
                backgroundColor: selectedMessages.size > 0 ? "#f44336 !important" : undefined,
                color: "white !important",
                "&:disabled": {
                  opacity: 0.5,
                },
              }}
            >
              Eliminar Seleccionados
            </AppButton>
            <AppButton
              variant="gradient"
              onClick={toggleSelectionMode}
              startIcon={<CancelIcon />}
              sx={{
                minHeight: "40px",
                fontSize: "0.85rem",
                padding: "0 1.5rem",
                color: "black",
              }}
            >
              Cancelar
            </AppButton>
          </Box>
        </Box>
      )}

      {/* Tabla de mensajes */}
      <div className="event-chats__table-wrapper">
        {status === "loading" ? (
          <div className="event-chats__loading">Cargando mensajes...</div>
        ) : messages && messages.length > 0 ? (
          <div className="event-chats__scroll-container">
            <table className="event-chats__table">
              <thead className="event-chats__table-header">
                <tr>
                  {selectionMode && <th style={{ width: "50px" }}>
                    <Checkbox
                      checked={selectedMessages.size === messages.length && messages.length > 0}
                      indeterminate={selectedMessages.size > 0 && selectedMessages.size < messages.length}
                      onChange={handleSelectAll}
                      sx={{
                        color: "white",
                        "&.Mui-checked": { color: "#00bcd4" },
                        "&.MuiCheckbox-indeterminate": { color: "#00bcd4" },
                      }}
                    />
                  </th>}
                  <th>ID</th>
                  <th>Fecha - Hora</th>
                  <th>Evento</th>
                  <th>Usuario</th>
                  <th>Mensaje</th>
                  <th>Imagen</th>
                  {!selectionMode && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody className="event-chats__table-body">
                {messages.map((message) => (
                  <tr 
                    key={message.id} 
                    className={`event-chats__table-row ${selectionMode && selectedMessages.has(message.id) ? "selected" : ""}`}
                    onClick={() => selectionMode && handleMessageSelect(message.id)}
                    style={{ cursor: selectionMode ? "pointer" : "default" }}
                  >
                    {selectionMode && (
                      <td className="event-chats__table-cell event-chats__checkbox-cell">
                        <Checkbox
                          checked={selectedMessages.has(message.id)}
                          onChange={() => handleMessageSelect(message.id)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            color: "white",
                            "&.Mui-checked": { color: "#00bcd4" },
                          }}
                        />
                      </td>
                    )}
                    <td className="event-chats__table-cell">{message.id}</td>
                    <td className="event-chats__table-cell">
                      {formatDate(message.createdAt)}
                    </td>
                    <td className="event-chats__table-cell">
                      {getEventName(message.event_id)}
                    </td>
                    <td className="event-chats__table-cell">
                      <div className="event-chats__user-info">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "#f50057" }}>
                          {message.user?.username?.charAt(0).toUpperCase() || "U"}
                        </Avatar>
                        <div>
                          <div className="event-chats__username">
                            {getUserName(message.user)}
                          </div>
                          <div className="event-chats__user-email">
                            {message.user?.email || ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="event-chats__table-cell event-chats__message-content">
                      {message.content || <em>Sin mensaje de texto</em>}
                    </td>
                    <td className="event-chats__table-cell event-chats__image-cell">
                      {message.image_url ? (
                        <Tooltip title="Ver imagen">
                          <IconButton
                            onClick={() => handleOpenImageModal(
                              message.image_url,
                              getUserName(message.user),
                              formatDate(message.createdAt)
                            )}
                            className="event-chats__image-link"
                            size="small"
                          >
                            <ImageIcon sx={{ color: "#00bcd4" }} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <span className="event-chats__no-image">-</span>
                      )}
                    </td>
                    {!selectionMode && (
                      <td className="event-chats__table-cell">
                        <IconButton
                          onClick={() => handleDeleteMessage(message.id)}
                          sx={{ color: "#f44336" }}
                          size="small"
                        >
                          <DeleteOutlinedIcon />
                        </IconButton>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="event-chats__no-data">
            No hay mensajes para mostrar
          </div>
        )}
      </div>

      {/* Información adicional */}
      <Box className="event-chats__info">
        <Typography variant="body2" color="white">
          Total de mensajes: {messages?.length || 0}
        </Typography>
      </Box>

      {/* Modal para ver imagen */}
      <Modal open={imageModalOpen} onClose={handleCloseImageModal}>
        <ModalHeader>
          <div className="event-chats__modal-header">
            <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
              Imagen del Chat
            </Typography>
            <IconButton onClick={handleCloseImageModal} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="event-chats__modal-content">
            <div className="event-chats__modal-info">
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                <strong>Usuario:</strong> {selectedImage.username}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                <strong>Fecha:</strong> {selectedImage.date}
              </Typography>
            </div>
            <div className="event-chats__modal-image-container">
              {selectedImage.url ? (
                <img
                  src={selectedImage.url}
                  alt="Imagen del chat"
                  className="event-chats__modal-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23333' width='300' height='200'/%3E%3Ctext fill='white' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
                  }}
                />
              ) : (
                <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  No hay imagen disponible
                </Typography>
              )}
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Modal de confirmación de eliminación múltiple */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <ModalHeader>
          <div className="event-chats__modal-header">
            <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
              Confirmar Eliminación
            </Typography>
            <IconButton onClick={() => setDeleteModalOpen(false)} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </div>
        </ModalHeader>
        <ModalBody>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="body1" sx={{ color: "white", mb: 3 }}>
              ¿Estás seguro de que deseas eliminar {selectedMessages.size} mensaje(s)?
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 3 }}>
              Esta acción no se puede deshacer.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <AppButton
                variant="gradient"
                onClick={() => setDeleteModalOpen(false)}
                sx={{
                  minHeight: "45px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  padding: "0 2rem",
                  color: "black",
                }}
              >
                Cancelar
              </AppButton>
              <AppButton
                variant="gradient"
                onClick={confirmDeleteMessages}
                sx={{
                  minHeight: "45px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  padding: "0 2rem",
                  backgroundColor: "#f44336 !important",
                  color: "white !important",
                }}
              >
                Eliminar
              </AppButton>
            </Box>
          </Box>
        </ModalBody>
      </Modal>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EventChats;

