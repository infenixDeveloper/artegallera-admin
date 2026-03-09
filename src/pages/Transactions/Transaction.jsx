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
  Autocomplete,
  List,
  Button,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import api from "@services/api";

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

  // Formatear fecha de evento para mostrar en el selector
  const formatEventDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Función para obtener la fecha actual en formato yyyy-mm-dd
  function getCurrentDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Función para obtener los eventos (usa api para entorno local con token)
  const fetchEvents = async () => {
    try {
      const response = await api.get("/events");
      const data = response.data;
      if (data.success && data.data) {
        setEvents(data.data);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error al obtener eventos", error);
      setEvents([]);
    }
  };

  // Función para obtener las transacciones de las rondas (usa api para entorno local con token)
  const fetchRounds = async (userId, eventId) => {
    if (!userId || eventId === "" || eventId == null) {
      setRounds([]);
      return;
    }
    try {
      const response = await api.get(
        `/betting/report/car/${userId}/${eventId}`
      );
      const data = response.data;
      if (data.success && data.data?.length > 0) {
        setRounds(data.data);
      } else {
        setRounds([]);
      }
    } catch (error) {
      console.error("Error al obtener transacciones", error);
      setRounds([]);
    }
  };

  // Cuando se abre el modal
  const handleOpenModal = async (user) => {
    setOpenModal(true);
    setSelectedEvent(""); // Limpiar evento seleccionado
    setRounds([]); // Limpiar rondas anteriores
    setSelectedUser(user); // Guardamos el usuario seleccionado
    fetchEvents(); // Obtener eventos al abrir el modal
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEvent("");
    setRounds([]);
  };

  const handleEventChange = async (event, newValue) => {
    const eventId = newValue?.id ?? "";
    setSelectedEvent(eventId);
    if (!selectedUser?.id) return;
    if (eventId) fetchRounds(selectedUser.id, eventId);
    else setRounds([]);
  };

  // Función para descargar el PDF (Reporte de Usuario y Evento)
  const handleDownloadUserReport = async () => {
    if (!selectedUser || !selectedEvent) {
      console.error("Usuario o evento no seleccionado");
      return;
    }

    try {
      const response = await api.get(
        `/betting/pdf/listAmountTransactions/${selectedUser.id}/${selectedEvent}`,
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${selectedUser.user}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error al obtener el PDF", error);
    }
  };

  // Función para descargar el reporte en Excel (por rango de fechas)
  const handleDownloadExcelReport = async () => {
    if (!isValidDate) return;

    try {
      const response = await api.get("/betting/report/range", {
        params: { startDate, endDate },
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "reporte_transacciones.xlsx";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error al obtener el reporte Excel", error);
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
          <Autocomplete
            value={events.find((e) => e.id === selectedEvent) ?? null}
            onChange={handleEventChange}
            options={events}
            getOptionLabel={(option) =>
              `${option.name ?? ""} — ${formatEventDate(option.date)}`
            }
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar evento (nombre o fecha)"
                placeholder="Escribe para filtrar..."
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Typography variant="body1" fontWeight={600} sx={{ color: "#1a1a1a" }}>
                    {option.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#555" }}>
                    {formatEventDate(option.date)}
                    {option.location ? ` · ${option.location}` : ""}
                  </Typography>
                </Box>
              </li>
            )}
            noOptionsText="No hay eventos"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                "&.Mui-focused fieldset": { borderColor: "white" },
              },
              "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
              "& .MuiInputLabel-root.Mui-focused": { color: "white" },
              "& .MuiAutocomplete-input": { color: "black" },
              "& .MuiAutocomplete-popupIndicator": { color: "black" },
              "& .MuiAutocomplete-clearIndicator": { color: "black" },
            }}
            slotProps={{
              paper: {
                sx: {
                  backgroundColor: "#fff",
                  color: "#1a1a1a",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
                  "& .MuiAutocomplete-listbox": {
                    backgroundColor: "#fff",
                    color: "#1a1a1a",
                    "& .MuiAutocomplete-option": {
                      "&:hover": { backgroundColor: "#f0f0f0" },
                      "&[aria-selected='true']": { backgroundColor: "#e3f2fd" },
                    },
                  },
                },
              },
            }}
            ListboxProps={{
              sx: { maxHeight: 280, backgroundColor: "#fff", color: "#1a1a1a" },
            }}
          />

          {selectedEvent && rounds.length === 0 ? (
            <Box
              sx={{
                py: 4,
                px: 2,
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.9)",
              }}
            >
              <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
                No tiene movimientos en ese evento.
              </Typography>
            </Box>
          ) : (
            <List>
              {rounds.map((round) => (
                <div key={round.round}>
                  <Typography variant="h6">{`Pelea ${round.round}`}</Typography>

                  <Table
                    columns={[
                      { field: "id", header: "ID" },
                      {
                        field: "user",
                        header: "Usuario",
                        cell: (row) => row.user?.username ?? "-",
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
                    rows={round.transactions}
                  />
                </div>
              ))}
            </List>
          )}
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
