import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { toggleChat } from "@redux/slice/chatSlice";
import { getLastEvent } from "@redux/slice/eventsSlice";
import { io } from "socket.io-client";
import { Box, IconButton, Tooltip, Typography, Button, Alert, Snackbar } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import StartIcon from "@mui/icons-material/Start";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CancelIcon from "@mui/icons-material/Cancel";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import EmojiPicker from "./EmojiPicker";
import MessageItem from "./MessageItem";
import UserManagementModal from "./UserManagementModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import api from "@services/api";

const socket = io("http://localhost:3002"); // Backend + Socket.IO están en puerto 3002

const Chat = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.chat.isOpen);
  const activeEvent = useSelector((state) => state.results.event);

  // Calcular room dinámicamente basado en el evento activo
  // Manejar caso cuando activeEvent es undefined, null o array vacío
  console.log("🎯 [ADMIN] Evento activo desde Redux:", activeEvent);
  
  // Validación mejorada para detectar evento válido
  const hasValidEvent = activeEvent && 
                        typeof activeEvent === 'object' && 
                        !Array.isArray(activeEvent) && 
                        Object.keys(activeEvent).length > 0 && 
                        activeEvent.id;
  
  const eventId = hasValidEvent ? activeEvent.id : null;
  const room = eventId ? String(eventId) : "general";
  
  console.log("🎯 [ADMIN] ¿Tiene evento válido?:", hasValidEvent);
  console.log("🎯 [ADMIN] eventId calculado:", eventId);
  console.log("🎯 [ADMIN] room calculado:", room);

  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const loadedMessageIds = useRef(new Set()); // Para evitar duplicados
  
  // Estados para manejo de imágenes
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // Estado para el modal de gestión de usuarios
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Estado para modo de selección de mensajes
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [deletingMessages, setDeletingMessages] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Estado para el modal de confirmación de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar evento activo si no está disponible
  useEffect(() => {
    if (!hasValidEvent) {
      console.log("⚠️ [ADMIN] No hay evento activo, cargando desde API...");
      dispatch(getLastEvent());
    }
  }, [hasValidEvent, dispatch]);

  // Debug: Loguear estado de isAdmin
  useEffect(() => {
    console.log("🔍 [DEBUG] Estado de isAdmin:", isAdmin);
    console.log("🔍 [DEBUG] Chat está abierto:", isOpen);
  }, [isAdmin, isOpen]);

  // Función para convertir mensajes de la API al formato del componente
  const formatApiMessage = useCallback((apiMessage) => {
    // Manejar diferentes estructuras de respuesta de la API
    const user = apiMessage.user || apiMessage.users || {};
    const username = user.username || 
                     user.email || 
                     (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null) ||
                     "Usuario";
    
    // Si el mensaje tiene una imagen, formatear como objeto especial
    let messageContent = apiMessage.content;
    if (apiMessage.message_type === 'image' && apiMessage.image_url) {
      messageContent = {
        type: 'image',
        url: `http://localhost:3002${apiMessage.image_url}`,
        name: apiMessage.image_name || 'Imagen',
        text: apiMessage.content || null
      };
    }
    
    return {
      id: apiMessage.id,
      username: username,
      message: messageContent,
      message_type: apiMessage.message_type,
      image_url: apiMessage.image_url,
      image_name: apiMessage.image_name,
      timestamp: apiMessage.createdAt,
      user_id: apiMessage.user_id,
      event_id: apiMessage.event_id,
      is_active_chat: user.is_active_chat !== undefined ? user.is_active_chat : true
    };
  }, []); // Sin dependencias porque no usa variables externas

  // Función para cargar mensajes desde la API (optimizada para evitar parpadeo)
  const loadMessagesFromAPI = useCallback(async (currentEventId = null, isInitialLoad = false) => {
    console.log("📥 [ADMIN] loadMessagesFromAPI llamado con eventId:", currentEventId, "isInitialLoad:", isInitialLoad);
    
    if (isLoadingMessages && !isInitialLoad) {
      console.log("⏭️ [ADMIN] Ya hay una carga en progreso, saltando");
      return;
    }
    
    // Solo mostrar el indicador de carga en la carga inicial
    if (isInitialLoad) {
      setIsLoadingMessages(true);
    }
    
    try {
      let response;
      console.log("🌐 [ADMIN] Realizando petición API...");
      
      if (currentEventId) {
        // Cargar mensajes del evento específico
        console.log(`📡 [ADMIN] GET /messages/event/${currentEventId}`);
        response = await api.get(`/messages/event/${currentEventId}`, {
          params: { limit: 100, offset: 0 }
        });
      } else {
        // Cargar mensajes generales (sin evento)
        console.log("📡 [ADMIN] GET /messages/general");
        response = await api.get("/messages/general", {
          params: { limit: 100, offset: 0 }
        });
      }

      console.log("✅ [ADMIN] Respuesta de la API:", {
        success: response.data?.success,
        messageCount: response.data?.data?.length,
        cached: response.data?.cached
      });

      if (response.data?.success && response.data?.data) {
        const apiMessages = response.data.data;
        
        // Formatear todos los mensajes de la API
        const formattedMessages = apiMessages
          .map(formatApiMessage)
          .reverse(); // Revertir para mostrar del más antiguo al más nuevo

        console.log(`📝 [ADMIN] ${formattedMessages.length} mensajes formateados`);

        // Actualizar mensajes de forma optimizada sin parpadeo
        setMessages(prev => {
          // Crear un mapa de mensajes existentes por ID para búsqueda rápida
          const existingMessagesMap = new Map();
          prev.forEach(msg => {
            if (msg.id) {
              existingMessagesMap.set(msg.id, msg);
            }
          });

          // Crear mapa de nuevos mensajes
          const newMessagesMap = new Map();
          formattedMessages.forEach(msg => {
            newMessagesMap.set(msg.id, msg);
            loadedMessageIds.current.add(msg.id);
          });

          // Si es carga inicial o no hay mensajes previos, reemplazar todo
          if (isInitialLoad || prev.length === 0) {
            console.log("🔄 [ADMIN] Carga inicial - reemplazando todos los mensajes");
            return formattedMessages;
          }

          // Combinar: mantener orden y agregar solo nuevos
          const combined = [...prev];
          let newMessagesCount = 0;

          formattedMessages.forEach(newMsg => {
            if (!existingMessagesMap.has(newMsg.id)) {
              combined.push(newMsg);
              newMessagesCount++;
            }
          });

          if (newMessagesCount > 0) {
            console.log(`➕ [ADMIN] ${newMessagesCount} mensajes nuevos agregados`);
            return combined.sort((a, b) => {
              const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
              const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
              return timeA - timeB;
            });
          }

          console.log("✅ [ADMIN] Sin cambios en mensajes");
          return prev;
        });
      }
    } catch (error) {
      console.error("❌ [ADMIN] Error al cargar mensajes desde la API:", error);
      if (error.response) {
        console.error("❌ [ADMIN] Detalles del error:", error.response.data);
      }
    } finally {
      if (isInitialLoad) {
        setIsLoadingMessages(false);
      }
    }
  }, [isLoadingMessages, formatApiMessage]);

  // Cargar mensajes cuando cambia el evento activo
  useEffect(() => {
    console.log("📅 [ADMIN] Evento cambió. eventId:", eventId, "| room:", room);
    
    // Limpiar mensajes y referencias cuando cambia el evento
    loadedMessageIds.current.clear();
    setMessages([]);
    
    // Cargar mensajes del evento activo (o generales si no hay evento)
    if (eventId) {
      console.log("📅 [ADMIN] Cargando mensajes del evento:", eventId);
      loadMessagesFromAPI(eventId, true);
    } else {
      console.log("📅 [ADMIN] Cargando mensajes generales (sin evento activo)");
      loadMessagesFromAPI(null, true);
    }
  }, [eventId, room, loadMessagesFromAPI]); // Se activa cuando eventId cambia

  // Sincronización automática cada 3 segundos (estilo Facebook Live)
  useEffect(() => {
    console.log("🔄 [ADMIN] Iniciando sincronización automática cada 3 segundos para eventId:", eventId);
    
    // Función que se ejecutará cada 3 segundos
    const syncMessages = () => {
      // No es carga inicial, solo sincronización (isInitialLoad = false)
      loadMessagesFromAPI(eventId, false);
    };

    // Configurar intervalo de 3 segundos
    const intervalId = setInterval(syncMessages, 3000);

    // Limpiar intervalo al desmontar o cuando cambie el evento
    return () => {
      console.log("🛑 [ADMIN] Deteniendo sincronización automática");
      clearInterval(intervalId);
    };
  }, [eventId, loadMessagesFromAPI]); // Re-iniciar intervalo cuando cambie el eventId

  // Unirse a la sala cuando cambia el room o se carga el usuario
  useEffect(() => {
    try {
      const userData = Cookies.get("data");
      if (userData) {
        const user = JSON.parse(userData);
        
        if (user && user.id) {
          console.log("👤 [ADMIN] Usuario cargado desde cookies:", user);
          setUsername(user?.username || user?.email || "Admin");
          setUserId(user?.id);
          // Detectar si es administrador usando el campo is_admin
          const userIsAdmin = user?.is_admin === true || user?.is_admin === 1;
          setIsAdmin(userIsAdmin);
          console.log("👤 [ADMIN] Usuario es administrador:", userIsAdmin, "| is_admin:", user?.is_admin);
          // Unirse a la sala correspondiente
          console.log("🔌 [ADMIN] Uniéndose a la sala:", room, "con usuario ID:", user.id);
          socket.emit("join", room);
        } else {
          console.warn("⚠️ [ADMIN] Cookie 'data' no contiene datos válidos del usuario");
        }
      } else {
        console.warn("⚠️ [ADMIN] No se encontró cookie 'data' - el usuario no está logueado o la cookie no se guardó correctamente");
      }
    } catch (error) {
      console.error("❌ [ADMIN] Error al leer datos del usuario desde cookies:", error);
    }
  }, [room]); // Ejecutar cuando cambia el room

  useEffect(() => {
    console.log("🔌 [ADMIN] Configurando listeners de socket para eventId:", eventId, "room:", room);

    // Recibir historial de mensajes desde socket (legacy - no usar si hay evento)
    socket.on("messageHistory", (historyMessages) => {
      console.log("📋 [ADMIN] Historial recibido desde socket:", historyMessages.length, "mensajes");
      // Solo usar socket si no hay evento activo (los eventos usan API directamente)
      if (!eventId) {
        console.log("✅ [ADMIN] Aplicando historial desde socket (chat general)");
        setMessages(historyMessages);
      } else {
        console.log("⚠️ [ADMIN] Ignorando historial de socket (evento activo usa API)");
      }
    });

    // Recibir mensajes nuevos en tiempo real
    const handleMessage = (msgData) => {
      console.log("📨 [ADMIN] Mensaje recibido por socket:", msgData);
      console.log("📨 [ADMIN] eventId actual del chat:", eventId);
      
      // Convertir a números para comparación confiable
      const msgEventId = msgData.event_id !== null && msgData.event_id !== undefined ? Number(msgData.event_id) : null;
      const currentEventId = eventId ? Number(eventId) : null;
      
      console.log(`📨 [ADMIN] Comparando - msgEventId: ${msgEventId}, currentEventId: ${currentEventId}`);
      
      // Filtrar mensajes según el evento actual
      if (currentEventId !== null) {
        // Hay evento activo: solo aceptar mensajes de ese evento
        if (msgEventId !== currentEventId) {
          console.log(`📨 [ADMIN] Mensaje ignorado - no coincide con evento activo`);
          return;
        }
      } else {
        // No hay evento activo: solo aceptar mensajes generales (sin event_id)
        if (msgEventId !== null) {
          console.log(`📨 [ADMIN] Mensaje ignorado - es de un evento pero estamos en chat general`);
          return;
        }
      }
      
      // Si el mensaje tiene ID y ya existe, no agregarlo
      if (msgData.id && loadedMessageIds.current.has(msgData.id)) {
        console.log(`📨 [ADMIN] Mensaje duplicado ignorado (ID: ${msgData.id})`);
        return;
      }
      
      // Formatear mensaje con imagen si es necesario
      if (msgData.message_type === 'image' && msgData.image_url) {
        msgData.message = {
          type: 'image',
          url: `http://localhost:3002${msgData.image_url}`,
          name: msgData.image_name || 'Imagen',
          text: msgData.message || null
        };
      }
      
      console.log("📨 [ADMIN] Agregando mensaje al estado");
      
      // Agregar el mensaje
      setMessages((prev) => {
        // Verificar duplicados antes de agregar
        const exists = prev.some(msg => 
          msg.id === msgData.id || 
          (msg.username === msgData.username && 
           msg.message === msgData.message && 
           Math.abs(new Date(msg.timestamp || Date.now()) - new Date(msgData.timestamp || Date.now())) < 1000)
        );
        
        if (exists) {
          console.log("📨 [ADMIN] Mensaje duplicado detectado en el estado");
          return prev;
        }
        
        // Agregar ID al conjunto si existe
        if (msgData.id) {
          loadedMessageIds.current.add(msgData.id);
        }
        
        // Agregar mensaje y ordenar por timestamp
        const updated = [...prev, msgData];
        return updated.sort((a, b) => {
          const timeA = new Date(a.timestamp || a.createdAt || Date.now()).getTime();
          const timeB = new Date(b.timestamp || b.createdAt || Date.now()).getTime();
          return timeA - timeB;
        });
      });
    };

    socket.on("message", handleMessage);

    // Listener para eliminación de mensajes en tiempo real
    const handleMessageDeleted = (data) => {
      console.log("🗑️ [ADMIN] Mensaje eliminado recibido por socket:", data);
      if (data.messageId) {
        setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
        // Si el mensaje eliminado estaba seleccionado, quitarlo de la selección
        setSelectedMessages(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.messageId);
          return newSet;
        });
      }
    };

    const handleMessagesDeleted = (data) => {
      console.log("🗑️ [ADMIN] Múltiples mensajes eliminados recibidos por socket:", data);
      if (data.messageIds && Array.isArray(data.messageIds)) {
        setMessages(prev => prev.filter(msg => !data.messageIds.includes(msg.id)));
        // Quitar mensajes eliminados de la selección
        setSelectedMessages(prev => {
          const newSet = new Set(prev);
          data.messageIds.forEach(id => newSet.delete(id));
          return newSet;
        });
      }
    };

    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messagesDeleted", handleMessagesDeleted);

    return () => {
      console.log("🔌 [ADMIN] Limpiando listeners de socket");
      socket.off("messageHistory");
      socket.off("message", handleMessage);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messagesDeleted", handleMessagesDeleted);
    };
  }, [eventId]); // Solo depende de eventId (room se deriva de él)

  const sendMessage = async () => {
    // Validar que haya mensaje o imagen
    if ((!message && !selectedImage) || !room || !userId || isSending) {
      console.warn("⚠️ [ADMIN] No se puede enviar mensaje - faltan datos:", { 
        message: !!message, 
        selectedImage: !!selectedImage,
        room, 
        userId, 
        isSending 
      });
      return;
    }

    // Verificar nuevamente el usuario desde cookies antes de enviar
    let currentUserId = userId;
    let currentUsername = username;
    
    try {
      const userData = Cookies.get("data");
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.id) {
          currentUserId = user.id;
          currentUsername = user?.username || user?.email || "Admin";
          console.log("✅ [ADMIN] Verificando usuario antes de enviar - ID:", currentUserId, "Username:", currentUsername);
        }
      }
    } catch (error) {
      console.error("❌ [ADMIN] Error al verificar usuario antes de enviar:", error);
    }

    const messageContent = message.trim();

    setIsSending(true);

    console.log("📤 [ADMIN] Enviando mensaje con datos:", { 
      user_id: currentUserId, 
      username: currentUsername, 
      event_id: eventId,
      hasImage: !!selectedImage 
    });

    try {
      // Si hay imagen, usar FormData
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('user_id', currentUserId);
        if (messageContent) {
          formData.append('content', messageContent);
        }
        if (eventId) {
          formData.append('event_id', eventId);
        }

        const response = await api.post("/messages", formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data?.success && response.data?.data) {
          const savedMessage = formatApiMessage(response.data.data);
          loadedMessageIds.current.add(savedMessage.id);
          
          setTimeout(() => {
            setMessages((prev) => {
              const exists = prev.some(msg => msg.id === savedMessage.id);
              if (!exists) {
                const updated = [...prev, savedMessage];
                return updated.sort((a, b) => {
                  const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
                  const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
                  return timeA - timeB;
                });
              }
              return prev;
            });
          }, 500);
        }

        // Limpiar imagen después de enviar
        clearSelectedImage();
      } else {
        // Enviar mensaje de texto normal
        if (!messageContent) {
          return;
        }

        const messageData = {
          username: currentUsername,
          message: messageContent,
          user_id: currentUserId
        };

        const response = await api.post("/messages", {
          content: messageContent,
          user_id: currentUserId,
          event_id: eventId || null
        });

        if (response.data?.success && response.data?.data) {
          const savedMessage = formatApiMessage(response.data.data);
          loadedMessageIds.current.add(savedMessage.id);
          
          setTimeout(() => {
            setMessages((prev) => {
              const exists = prev.some(msg => msg.id === savedMessage.id);
              if (!exists) {
                const updated = [...prev, savedMessage];
                return updated.sort((a, b) => {
                  const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
                  const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
                  return timeA - timeB;
                });
              }
              return prev;
            });
          }, 500);
        } else {
          // Fallback: enviar por socket si no tenemos la respuesta de la API
          socket.emit("message", room, messageData);
        }
      }
      
      setMessage("");
    } catch (error) {
      console.error("Error al guardar el mensaje:", error);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al enviar el mensaje',
        severity: 'error'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
  };

  // Manejar selección de imagen
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setSnackbar({
          open: true,
          message: 'Por favor selecciona un archivo de imagen válido',
          severity: 'error'
        });
        return;
      }

      // Validar tamaño máximo (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'La imagen no puede superar los 5MB',
          severity: 'error'
        });
        return;
      }

      setSelectedImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Limpiar imagen seleccionada
  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Abrir selector de archivos
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handler para cuando se hace click en un usuario
  const handleUserClick = (clickedUserId, clickedUsername) => {
    console.log("👤 [ADMIN] Click en usuario:", clickedUserId, clickedUsername);
    
    // Buscar el mensaje completo para obtener is_active_chat del usuario
    const userMessage = messages.find(msg => msg.user_id === clickedUserId);
    
    setSelectedUser({
      user_id: clickedUserId,
      username: clickedUsername,
      is_active_chat: userMessage?.is_active_chat !== undefined ? userMessage.is_active_chat : true
    });
    setUserModalOpen(true);
  };

  // Handler cuando se actualiza el estado del usuario
  const handleUserUpdated = (updatedUser) => {
    console.log("✅ [ADMIN] Usuario actualizado:", updatedUser);
    // Actualizar mensajes para reflejar el nuevo estado
    setMessages(prev => prev.map(msg => 
      msg.user_id === updatedUser.user_id 
        ? { ...msg, is_active_chat: updatedUser.is_active_chat }
        : msg
    ));
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

  // Confirmar eliminación de mensajes
  const confirmDeleteMessages = async () => {
    const messageIds = Array.from(selectedMessages);
    setDeletingMessages(true);

    try {
      const response = await api.post('/messages/delete-multiple', {
        messageIds
      });

      if (response.data?.success) {
        // Eliminar mensajes del estado local
        setMessages(prev => prev.filter(msg => !messageIds.includes(msg.id)));
        
        // Limpiar selección y salir del modo de selección
        setSelectedMessages(new Set());
        setSelectionMode(false);
        
        // Cerrar modal
        setDeleteModalOpen(false);

        setSnackbar({
          open: true,
          message: `${messageIds.length} mensaje(s) eliminado(s) exitosamente`,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error("Error al eliminar mensajes:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al eliminar los mensajes',
        severity: 'error'
      });
    } finally {
      setDeletingMessages(false);
    }
  };



  return (
    <Box
      sx={{
        position: "fixed",
        top: "0",
        right: "0",
        width: "250px",
        height: "100dvh",
        padding: "1rem",
        backgroundColor: "#333",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.3s ease-in-out"
      }}
    >
      {/* Header con botones */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 0.5,
        height: '40px',
        flexShrink: 0
      }}>
        {/* Botón para abrir/cerrar */}
        <Tooltip title={isOpen ? "Cerrar" : "Abrir"} placement="left">
          <Button
            sx={{ 
              position: "absolute", 
              left: isOpen ? ".5rem" : "-90px", 
              color: "white",
              minWidth: 'auto',
              padding: '4px 8px',
              fontSize: '12px'
            }}
            onClick={() => dispatch(toggleChat())}
          >
            {isOpen ? "Cerrar" : <Typography display="flex" alignItems="center" gap={".2rem"}> <StartIcon sx={{ transform: isOpen ? "rotate(0)" : "rotate(180deg)" }} /> Chat</Typography>}
          </Button>
        </Tooltip>

        {/* Botones de modo de selección - Solo visible para admins */}
        {isOpen && isAdmin && (
          <Box sx={{ 
            display: 'flex', 
            gap: 0.5, 
            ml: 'auto'
          }}>
            {!selectionMode ? (
              <Tooltip title="Activar modo selección" placement="left">
                <IconButton
                  size="small"
                  onClick={toggleSelectionMode}
                  sx={{
                    color: 'white',
                    backgroundColor: '#444',
                    '&:hover': { backgroundColor: '#555' },
                    width: '30px',
                    height: '30px'
                  }}
                >
                  <CheckBoxIcon sx={{ fontSize: '16px' }} />
                </IconButton>
              </Tooltip>
            ) : (
              <>
                <Tooltip title={`Eliminar ${selectedMessages.size} mensaje(s)`} placement="left">
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleDeleteSelected}
                      disabled={selectedMessages.size === 0 || deletingMessages}
                      sx={{
                        color: 'white',
                        backgroundColor: selectedMessages.size > 0 ? '#f44336' : '#666',
                        '&:hover': { backgroundColor: selectedMessages.size > 0 ? '#d32f2f' : '#666' },
                        '&:disabled': { backgroundColor: '#666', color: '#999' },
                        width: '30px',
                        height: '30px'
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: '16px' }} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Cancelar selección" placement="left">
                  <IconButton
                    size="small"
                    onClick={toggleSelectionMode}
                    sx={{
                      color: 'white',
                      backgroundColor: '#666',
                      '&:hover': { backgroundColor: '#777' },
                      width: '30px',
                      height: '30px'
                    }}
                  >
                    <CancelIcon sx={{ fontSize: '16px' }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Área de mensajes */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          color: "text.primary",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "0.5rem",
          color: "white",
          backgroundColor: "#222",
          minHeight: 0, // Importante para que flex funcione correctamente
          marginBottom: "0.5rem"
        }}
      >
        {isLoadingMessages && (
          <Typography sx={{ color: '#888', fontSize: '10px', textAlign: 'center', py: 1 }}>
            Cargando mensajes...
          </Typography>
        )}
        {messages.length === 0 && !isLoadingMessages && (
          <Typography sx={{ color: '#888', fontSize: '10px', textAlign: 'center', py: 1 }}>
            {activeEvent?.id ? 'No hay mensajes para este evento' : 'No hay mensajes'}
          </Typography>
        )}
        {messages.map((msgData, index) => {
          // Manejar tanto el formato nuevo como el formato legacy
          if (typeof msgData === 'string') {
            // Formato legacy: "username: message" - extraer username y message
            const colonIndex = msgData.indexOf(':');
            if (colonIndex > 0) {
              const username = msgData.substring(0, colonIndex).trim();
              const message = msgData.substring(colonIndex + 1).trim();
              return (
                <MessageItem 
                  key={msgData.id || `legacy-${index}`} 
                  message={message} 
                  username={username}
                />
              );
            } else {
              // Si no hay dos puntos, mostrar como mensaje sin usuario
              return (
                <MessageItem 
                  key={msgData.id || `legacy-str-${index}`} 
                  message={msgData} 
                  username=""
                />
              );
            }
          } else {
            // Formato nuevo: objeto con username, message, id, user_id
            const isUserAdmin = msgData.user_id === userId;
            return (
              <MessageItem 
                key={msgData.id || `msg-${index}`} 
                message={msgData.message} 
                username={msgData.username}
                userId={msgData.user_id}
                messageId={msgData.id}
                isAdmin={isUserAdmin}
                onUserClick={handleUserClick}
                selectionMode={selectionMode}
                isSelected={selectedMessages.has(msgData.id)}
                onSelect={handleMessageSelect}
              />
            );
          }
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input para mensajes */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          width: "100%",
          flexShrink: 0 // Evita que se comprima
        }}
      >
        {/* Vista previa de imagen */}
        {imagePreview && (
          <Box
            sx={{
              position: "relative",
              backgroundColor: "#333",
              borderRadius: "8px",
              padding: "8px",
              border: "1px solid #555"
            }}
          >
            <IconButton
              size="small"
              onClick={clearSelectedImage}
              sx={{
                position: "absolute",
                top: "4px",
                right: "4px",
                backgroundColor: "#f44336",
                color: "white",
                width: "20px",
                height: "20px",
                zIndex: 1,
                "&:hover": {
                  backgroundColor: "#d32f2f"
                }
              }}
            >
              <CloseIcon sx={{ fontSize: "14px" }} />
            </IconButton>
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "150px",
                borderRadius: "4px",
                display: "block"
              }}
            />
          </Box>
        )}

        <Box 
          display="flex" 
          alignItems="center" 
          gap={0.3}
          sx={{
            backgroundColor: "#444",
            borderRadius: "8px",
            padding: "4px 6px",
            border: "1px solid #555"
          }}
        >
          {/* Input file oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />

          {/* Botón de imagen - Solo visible para admins */}
          {isAdmin && (
            <Tooltip title="Adjuntar imagen" placement="top">
              <IconButton
                onClick={openFileSelector}
                sx={{
                  minWidth: "26px",
                  width: "26px",
                  height: "26px",
                  padding: "2px",
                  borderRadius: "4px",
                  backgroundColor: selectedImage ? "#2196f3" : "#666",
                  color: "white",
                  flexShrink: 0,
                  "&:hover": {
                    backgroundColor: selectedImage ? "#1976d2" : "#777"
                  }
                }}
              >
                <ImageIcon sx={{ fontSize: "16px" }} />
              </IconButton>
            </Tooltip>
          )}
          
          <input
            type="text"
            placeholder="Mensaje..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              height: "26px",
              padding: "0 6px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "transparent",
              color: "white",
              outline: "none",
              fontSize: "10px"
            }}
          />
          
          {/* Botón de emoticonos */}
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          
          {/* Botón de enviar */}
          <IconButton
            sx={{
              minWidth: "26px",
              width: "26px",
              height: "26px",
              padding: "2px",
              borderRadius: "4px",
              backgroundColor: (message || selectedImage) ? "#4caf50" : "#666",
              color: "white",
              flexShrink: 0,
              "&:hover": {
                backgroundColor: (message || selectedImage) ? "#45a049" : "#777"
              },
              "&:disabled": {
                backgroundColor: "#555",
                color: "#888"
              }
            }}
            onClick={sendMessage}
            type="button"
            disabled={(!message && !selectedImage) || isSending}
          >
            <SendIcon sx={{ fontSize: "16px" }} />
          </IconButton>
        </Box>
      </Box>

      {/* Modal de gestión de usuario */}
      <UserManagementModal 
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal 
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteMessages}
        messageCount={selectedMessages.size}
        loading={deletingMessages}
      />

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
    </Box>
  );
};

export default Chat;
