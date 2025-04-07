import React, { useEffect, useRef, useState } from "react";
import AppButton from "@components/Button/Button";
import api from "@services/api";
import Cookies from "js-cookie";
import { Alert, Button, ButtonGroup, IconButton, Snackbar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { getLastEvent } from "@redux/slice/eventsSlice";

const CreateBet = () => {
  const socket = useRef(null);
  const dispatch = useDispatch();
  const event = useSelector((state) => state.results.event);

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_API_URL_WBET);

    socket.current.on("connect", () => {
      console.log("Conectado al servidor");
    });
  }, []);

  useEffect(() => {
    dispatch(getLastEvent());
  }, [dispatch]);

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    location: "",
    is_active: true,
    is_betting_active: false,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    vertical: "top",
    horizontal: "center",
    bgColor: "",
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarOpenText, setSnackbarOpenText] = useState("");

  const { vertical, horizontal } = snackbar;

  const [view, setView] = useState("form");

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get("authToken");

    // Combinar fecha y hora ingresadas por el usuario
    const combinedDate = `${formData.date}T${formData.time}:00`;

    // Convertir a un objeto Date sin considerar zona horaria
    const localDate = new Date(combinedDate);

    // Crear un objeto de fecha local en formato ISO sin ajustar a UTC
    const localDateString = `${formData.date}T${formData.time}:00`;

    const dataToSend = {
      ...formData,
      date: localDateString, // Enviar la fecha sin UTC
    };

    try {
      const response = await api.post("/events/create", dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        socket.current.emit(
          "createRound",
          { id_event: response.data.data.id },
          (res) => {}
        );

        window.location.reload();

        setFormData({
          name: "",
          date: "",
          time: "",
          location: "",
          is_active: true,
          is_betting_active: false,
        });

        setSnackbar({
          ...snackbar,
          open: true,
          message: "Evento creado con éxito",
          bgColor: "#5cb85c",
        });
      }else{
        // console.log(response.data);
        
        // alert(`${response.data.message}`)
        setSnackbarOpenText(response.data.message)
        setSnackbarOpen(true)
      }
    } catch (error) {
      console.error(error);
      setSnackbar({
        ...snackbar,
        open: true,
        message: "Error al crear el evento",
        bgColor: "#dc3545",
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const action = (
    <>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleSnackbarClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  return (
    <>
      <div className="create-bet__container">
        <form onSubmit={handleSubmit}>
          <h2>Crear Evento</h2>
          <label className="create-bets__label">
            Nombre
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
            />
          </label>
          <div className="create-bet__date">
            <label className="create-bets__label">
              Horario
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleFormChange}
                required
              />
            </label>
            <label className="create-bets__label">
              Fecha
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                required
              />
            </label>
          </div>
          <label className="create-bets__label">
            Lugar
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleFormChange}
              required
            />
          </label>
          <AppButton variant="gradient-square" type="submit">
            Guardar
          </AppButton>
        </form>
      </div>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbar.open}
        message={snackbar.message}
        autoHideDuration={5000}
        action={action}
        onClose={handleSnackbarClose}
        key={vertical + horizontal}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: `${snackbar.bgColor}`,
            color: "#ffffff",
          },
        }}
      />
       <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="warning"
          sx={{ width: "100%" }}
        >
         {snackbarOpenText}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateBet;
