import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "@redux/slice/userSlice";
import Table from "@components/Table/Table";
import AppButton from "@components/Button/Button";
import {
  Typography,
  TextField,
  Box,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  Button,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
const apiUrl = import.meta.env.VITE_API_URL_PROD;
const Transactions = () => {
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_API_URL_WBET);

    socket.current.on("connect", () => {
      console.log("Conectado al servidor de apuestas");
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const dispatch = useDispatch();
  const { list: users } = useSelector((state) => state.users);

  const [rows, setRows] = useState([]);
  const [startDate, setStartDate] = useState(getCurrentDate());
  const [endDate, setEndDate] = useState(getCurrentDate());
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isValidDate, setIsValidDate] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [rounds, setRounds] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // Estado para el usuario seleccionado

  // Función para obtener la fecha actual en formato yyyy-mm-dd
  function getCurrentDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Función para obtener los eventos
  const fetchEvents = async (userId) => {
    try {
      const response = await fetch(`${apiUrl}/betting/report/event/${userId}`);
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      } else {
        console.error("No se encontraron eventos");
      }
    } catch (error) {
      console.error("Error al obtener eventos", error);
    }
  };

  // Función para obtener las transacciones de las rondas
  const fetchRounds = async (userId, eventId) => {
    try {
      const response = await fetch(
        `${apiUrl}/betting/report/car/${userId}/${eventId}`
      );
      const data = await response.json();
      if (data.success) {
        setRounds(data.data); // Guardar las rondas
      } else {
        console.error("No se encontraron transacciones");
      }
    } catch (error) {
      console.error("Error al obtener transacciones", error);
    }
  };

  // Cuando se abre el modal
  const handleOpenModal = async (user) => {
    setOpenModal(true);
    setSelectedEvent(""); // Limpiar evento seleccionado
    setRounds([]); // Limpiar rondas anteriores
    setSelectedUser(user); // Guardamos el usuario seleccionado
    fetchEvents(user.id); // Obtener eventos al abrir el modal
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEvent("");
    setRounds([]);
  };

  const handleEventChange = async (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    fetchRounds(selectedUser.id, eventId); // Ahora usamos el id del usuario seleccionado
  };

  // Función para descargar el PDF (Reporte de Usuario y Evento)
  const handleDownloadUserReport = async () => {
    if (!selectedUser || !selectedEvent) {
      console.error("Usuario o evento no seleccionado");
      return;
    }

    const url = `${apiUrl}/betting/pdf/listAmountTransactions/${selectedUser.id}/${selectedEvent}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/pdf",
        },
      });
      console.log({ selectedUser });

      if (response.ok) {
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${selectedUser.user}.pdf`;
        link.click();
      } else {
        console.error("Error al obtener el PDF");
      }
    } catch (error) {
      console.error("Hubo un error al realizar la solicitud", error);
    }
  };

  // Función para descargar el reporte en Excel (por rango de fechas)
  const handleDownloadExcelReport = async () => {
    if (!isValidDate) {
      return;
    }

    const url = `${apiUrl}/betting/report/range?startDate=${startDate}&endDate=${endDate}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "reporte_transacciones.xlsx";
        link.click();
      } else {
        console.error("Error al obtener el reporte Excel");
      }
    } catch (error) {
      console.error("Hubo un error al realizar la solicitud", error);
    }
  };

  const columns = [
    { field: "id", header: "id" },
    {
      field: "user",
      header: "usuario",
      cell: (row) => row.user,
    },
    {
      field: "name",
      header: "nombre",
      cell: (row) => (
        <div className="table__name">{`${row.name} ${row.lastname}`}</div>
      ),
    },
    { field: "balance", header: "saldo" },
    { field: "status", header: "estado" },
    {
      field: "actions",
      header: "acción",
      cell: (user) => (
        <AppButton onClick={() => handleOpenModal(user)}>
          <Visibility />
        </AppButton>
      ),
    },
  ];

  useEffect(() => {
    const usersRows = Array.from(users || [])
      .filter((u) => u.is_active)
      .sort((a, b) => b.id - a.id)
      .map((user) => ({
        id: user.id,
        user: user.username,
        name: user.first_name,
        lastname: user.last_name,
        email: user.email,
        balance: `$ ${user.initial_balance}`,
        status: user.is_active ? "Activo" : "Inactivo",
      }));
    console.log(usersRows);

    setRows(usersRows);
  }, [users]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDateChange = (e, type) => {
    const value = e.target.value;

    if (type === "start") {
      setStartDate(value);
      if (new Date(value) > new Date(endDate)) {
        setIsValidDate(false);
        setOpenSnackbar(true);
      } else {
        setIsValidDate(true);
      }
    } else {
      setEndDate(value);
      if (new Date(value) < new Date(startDate)) {
        setIsValidDate(false);
        setOpenSnackbar(true);
      } else {
        setIsValidDate(true);
      }
    }
  };

  return (
    <div className="users__container">
      <Typography variant="h4" color="white" sx={{ marginBottom: "50px" }}>
        Transacciones de usuarios
      </Typography>

      <Table
        searcheable
        columns={columns}
        rows={rows}
        AddButton={
          <Box display="flex" gap="10px" mb="20px">
            <TextField
              label="Fecha de inicio"
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange(e, "start")}
              InputLabelProps={{
                shrink: true,
              }}
              sx={inputStyle}
            />
            <TextField
              label="Fecha de fin"
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange(e, "end")}
              InputLabelProps={{
                shrink: true,
              }}
              sx={inputStyle}
            />
            <AppButton
              variant="gradient"
              onClick={handleDownloadExcelReport}
              sx={{
                width: { md: "200px", sm: "200px" },
                fontSize: {
                  xs: ".7rem",
                  sm: "1rem",
                },
              }}
              disabled={!isValidDate}
            >
              Reporte
            </AppButton>
          </Box>
        }
      />

      {/* Modal de Movimientos */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          "& .MuiDialog-paper": {
            width: "70%", // En escritorio ocupa el 70% de la pantalla
            maxWidth: "none", // Para evitar el ancho máximo predeterminado
            background: "linear-gradient(180deg, #000000 0%, #1c1502 100%)", // Gradiente de fondo
            color: "white", // Color del texto dentro del Dialog
          },
          [(theme) => theme.breakpoints.down("sm")]: {
            "& .MuiDialog-paper": {
              width: "90%", // En móviles ocupa el 90% de la pantalla
            },
          },
        }}
      >
        <DialogTitle>Movimientos del Jugador</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Evento</InputLabel>
            <Select
              value={selectedEvent}
              onChange={handleEventChange}
              label="Evento"
              sx={{
                backgroundColor: "white", // Fondo blanco para el Select
                color: "black", // Color de texto dentro del Select
                "& .MuiSelect-icon": {
                  color: "black", // Color del ícono de la flecha
                },
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 200, // Máxima altura del menú
                    overflowY: "auto", // Agregar scroll si las opciones son muchas
                  },
                },
              }}
            >
              {events.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <List>
            {rounds.map((round) => (
              <div key={round.round}>
                <Typography variant="h6">{`Pelea ${round.round}`}</Typography>
                {console.log(round)}

                <Table
                  columns={[
                    { field: "id", header: "ID" },
                    {
                      field: "user",
                      header: "Usuario",
                      cell: (row) => row.user.username,
                    },
                    {
                      field: "type_transaction",
                      header: "Tipo de Transacción",
                    },
                    { field: "previous_balance", header: "Saldo Anterior" },
                    { field: "amount", header: "Monto" },
                    { field: "current_balance", header: "Saldo Actual" },
                    { field: "team", header: "Equipo" },
                  ]}
                  rows={round.transactions} // Usamos las transacciones
                />
              </div>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cerrar
          </Button>
          <Button onClick={handleDownloadUserReport} color="secondary">
            Descargar Reporte PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mostrar el mensaje de error */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          La fecha de inicio no puede ser mayor que la fecha de fin.
        </Alert>
      </Snackbar>
    </div>
  );
};

const inputStyle = {
  color: "white",
  "& .MuiInputBase-input": {
    color: "white",
  },
  "& .MuiInputLabel-root": {
    color: "white",
  },
  backgroundColor: "#333",
  "& .MuiOutlinedInput-root": {
    borderColor: "white",
  },
  "& .MuiOutlinedInput-root.Mui-focused": {
    borderColor: "white",
  },
  "& .MuiSvgIcon-root": {
    color: "white",
  },
};

export default Transactions;
