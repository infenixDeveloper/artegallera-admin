// import { useState, useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchUsers } from "@redux/slice/userSlice";
// import Table from "@components/Table/Table";
// import AppButton from "@components/Button/Button";
// import { Typography, TextField, Box, Snackbar, Alert } from "@mui/material";
// import { Visibility } from "@mui/icons-material";
// import { io } from "socket.io-client";

// const Transactions = () => {
//   const socket = useRef(null);

//   useEffect(() => {
//     socket.current = io(import.meta.env.VITE_API_URL_WBET);

//     socket.current.on("connect", () => {
//       console.log("Conectado al servidor de apuestas");
//     });

//     return () => {
//       socket.current.disconnect();
//     };
//   }, []);

//   const dispatch = useDispatch();
//   const { list: users } = useSelector((state) => state.users);

//   const [rows, setRows] = useState([]);
//   const [startDate, setStartDate] = useState(getCurrentDate());
//   const [endDate, setEndDate] = useState(getCurrentDate());
//   const [openSnackbar, setOpenSnackbar] = useState(false);
//   const [isValidDate, setIsValidDate] = useState(true); // Estado para habilitar o deshabilitar el botón

//   // Función para obtener la fecha actual en formato yyyy-mm-dd
//   function getCurrentDate() {
//     const today = new Date();
//     const yyyy = today.getFullYear();
//     const mm = String(today.getMonth() + 1).padStart(2, "0");
//     const dd = String(today.getDate()).padStart(2, "0");
//     return `${yyyy}-${mm}-${dd}`;
//   }

//   useEffect(() => {
//     const usersRows = Array.from(users || [])
//       .filter((u) => u.is_active)
//       .sort((a, b) => b.id - a.id)
//       .map((user) => ({
//         id: user.id,
//         user: user.username,
//         name: user.first_name,
//         lastname: user.last_name,
//         email: user.email,
//         balance: `$ ${user.initial_balance}`,
//         status: user.is_active ? "Activo" : "Inactivo",
//       }));

//     setRows(usersRows);
//   }, [users]);

//   useEffect(() => {
//     dispatch(fetchUsers());
//   }, [dispatch]);

//   const handleDateChange = (e, type) => {
//     const value = e.target.value;

//     if (type === "start") {
//       setStartDate(value);
//       // Validar que la fecha de inicio no sea mayor que la fecha de fin
//       if (new Date(value) > new Date(endDate)) {
//         setIsValidDate(false);
//         setOpenSnackbar(true);
//       } else {
//         setIsValidDate(true);
//       }
//     } else {
//       setEndDate(value);
//       // Validar que la fecha de fin no sea menor que la fecha de inicio
//       if (new Date(value) < new Date(startDate)) {
//         setIsValidDate(false);
//         setOpenSnackbar(true);
//       } else {
//         setIsValidDate(true);
//       }
//     }
//   };

//   const handleDownloadReport = async () => {
//     if (!isValidDate) {
//       // No hacer la petición si las fechas son inválidas
//       return;
//     }

//     const url = `https://4f8k8gjf-3002.use2.devtunnels.ms/betting/report?startDate=${startDate}&endDate=${endDate}`;

//     try {
//       const response = await fetch(url, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.ok) {
//         const blob = await response.blob();
//         const link = document.createElement("a");
//         link.href = URL.createObjectURL(blob);
//         link.download = "reporte_transacciones.xlsx";
//         link.click();
//       } else {
//         console.error("Error al obtener el reporte");
//       }
//     } catch (error) {
//       console.error("Hubo un error al realizar la solicitud", error);
//     }
//   };

//   const columns = [
//     { field: "id", header: "id" },
//     {
//       field: "user",
//       header: "usuario",
//       cell: (row) => (
//         <div>
//           <div className="table__username">{row.user}</div>
//           <div className="table__email">{row.email}</div>
//         </div>
//       ),
//     },
//     {
//       field: "name",
//       header: "nombre",
//       cell: (row) => (
//         <div className="table__name">{`${row.name} ${row.lastname}`}</div>
//       ),
//     },
//     { field: "balance", header: "saldo" },
//     { field: "status", header: "estado" },
//     {
//       field: "actions",
//       header: "acción",
//       cell: (user) => (
//         <AppButton onClick={(e) => handleEditUser(e, user)}>
//           <Visibility />
//         </AppButton>
//       ),
//     },
//   ];

//   return (
//     <div className="users__container">
//       <Typography variant="h4" color="white" sx={{ marginBottom: "50px" }}>
//         Transacciones de usuarios
//       </Typography>

//       <Table
//         searcheable
//         columns={columns}
//         rows={rows}
//         AddButton={
//           <Box display="flex" gap="10px" mb="20px">
//             <TextField
//               label="Fecha de inicio"
//               type="date"
//               value={startDate}
//               onChange={(e) => handleDateChange(e, "start")}
//               InputLabelProps={{
//                 shrink: true,
//               }}
//               sx={{
//                 color: "white", // Cambia el color del texto
//                 "& .MuiInputBase-input": {
//                   color: "white", // Cambia el color del texto dentro del input
//                 },
//                 "& .MuiInputLabel-root": {
//                   color: "white", // Cambia el color de la etiqueta
//                 },
//                 backgroundColor: "#333", // Fondo oscuro (gris oscuro) para el input
//                 "& .MuiOutlinedInput-root": {
//                   borderColor: "white", // Borde blanco
//                 },
//                 "& .MuiOutlinedInput-root.Mui-focused": {
//                   borderColor: "white", // Borde blanco cuando está enfocado
//                 },
//                 "& .MuiSvgIcon-root": {
//                   color: "white", // Color blanco para el icono (calendario)
//                 },
//                 "& .MuiInputAdornment-root .MuiSvgIcon-root": {
//                   color: "white", // Color blanco para el icono de fecha
//                 },
//               }}
//             />
//             <TextField
//               label="Fecha de fin"
//               type="date"
//               value={endDate}
//               onChange={(e) => handleDateChange(e, "end")}
//               InputLabelProps={{
//                 shrink: true,
//               }}
//               sx={{
//                 color: "white", // Cambia el color del texto
//                 "& .MuiInputBase-input": {
//                   color: "white", // Cambia el color del texto dentro del input
//                 },
//                 "& .MuiInputLabel-root": {
//                   color: "white", // Cambia el color de la etiqueta
//                 },
//                 backgroundColor: "#333", // Fondo oscuro (gris oscuro) para el input
//                 "& .MuiOutlinedInput-root": {
//                   borderColor: "white", // Borde blanco
//                 },
//                 "& .MuiOutlinedInput-root.Mui-focused": {
//                   borderColor: "white", // Borde blanco cuando está enfocado
//                 },
//                 "& .MuiSvgIcon-root": {
//                   color: "white", // Color blanco para el icono (calendario)
//                 },
//                 "& .MuiInputAdornment-root .MuiSvgIcon-root": {
//                   color: "white", // Color blanco para el icono de fecha
//                 },
//               }}
//             />
//             <AppButton
//               variant="gradient"
//               onClick={handleDownloadReport}
//               sx={{
//                 width: { md: "200px", sm: "200px" },
//                 fontSize: {
//                   xs: ".7rem",
//                   sm: "1rem",
//                 },
//               }}
//               disabled={!isValidDate} // Deshabilita el botón si la fecha no es válida
//             >
//               Reporte
//             </AppButton>
//           </Box>
//         }
//       />

//       {/* Snackbar para mostrar el mensaje de error */}
//       <Snackbar
//         open={openSnackbar}
//         autoHideDuration={6000}
//         onClose={() => setOpenSnackbar(false)}
//       >
//         <Alert
//           onClose={() => setOpenSnackbar(false)}
//           severity="error"
//           sx={{ width: "100%" }}
//         >
//           La fecha de inicio no puede ser mayor que la fecha de fin.
//         </Alert>
//       </Snackbar>
//     </div>
//   );
// };

// // export default Transactions;
// import { useState, useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchUsers } from "@redux/slice/userSlice";
// import Table from "@components/Table/Table";
// import AppButton from "@components/Button/Button";
// import { Typography, TextField, Box, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, Button } from "@mui/material";
// import { Visibility } from "@mui/icons-material";
// import { io } from "socket.io-client";

// const Transactions = () => {
//   const socket = useRef(null);

//   useEffect(() => {
//     socket.current = io(import.meta.env.VITE_API_URL_WBET);

//     socket.current.on("connect", () => {
//       console.log("Conectado al servidor de apuestas");
//     });

//     return () => {
//       socket.current.disconnect();
//     };
//   }, []);

//   const dispatch = useDispatch();
//   const { list: users } = useSelector((state) => state.users);

//   const [rows, setRows] = useState([]);
//   const [startDate, setStartDate] = useState(getCurrentDate());
//   const [endDate, setEndDate] = useState(getCurrentDate());
//   const [openSnackbar, setOpenSnackbar] = useState(false);
//   const [isValidDate, setIsValidDate] = useState(true); // Estado para habilitar o deshabilitar el botón
//   const [openModal, setOpenModal] = useState(false); // Modal abierto
//   const [selectedEvent, setSelectedEvent] = useState(""); // Evento seleccionado
//   const [movements, setMovements] = useState([]); // Movimientos ficticios

//   // Datos ficticios de movimientos
//   const dummyMovements = [
//     { id: 1, date: "2025-02-10", amount: 100, type: "Gana" },
//     { id: 2, date: "2025-02-10", amount: 50, type: "Pierde" },
//     { id: 3, date: "2025-02-11", amount: 75, type: "Gana" },
//     { id: 4, date: "2025-02-12", amount: 200, type: "Pierde" },
//   ];

//   const events = ["Inter Arandas", "Inter Valle", "Inter Sol", "Inter Luna"]; // Ejemplo de eventos

//   // Función para obtener la fecha actual en formato yyyy-mm-dd
//   function getCurrentDate() {
//     const today = new Date();
//     const yyyy = today.getFullYear();
//     const mm = String(today.getMonth() + 1).padStart(2, "0");
//     const dd = String(today.getDate()).padStart(2, "0");
//     return `${yyyy}-${mm}-${dd}`;
//   }

//   useEffect(() => {
//     const usersRows = Array.from(users || [])
//       .filter((u) => u.is_active)
//       .sort((a, b) => b.id - a.id)
//       .map((user) => ({
//         id: user.id,
//         user: user.username,
//         name: user.first_name,
//         lastname: user.last_name,
//         email: user.email,
//         balance: `$ ${user.initial_balance}`,
//         status: user.is_active ? "Activo" : "Inactivo",
//       }));

//     setRows(usersRows);
//   }, [users]);

//   useEffect(() => {
//     dispatch(fetchUsers());
//   }, [dispatch]);

//   const handleDateChange = (e, type) => {
//     const value = e.target.value;

//     if (type === "start") {
//       setStartDate(value);
//       // Validar que la fecha de inicio no sea mayor que la fecha de fin
//       if (new Date(value) > new Date(endDate)) {
//         setIsValidDate(false);
//         setOpenSnackbar(true);
//       } else {
//         setIsValidDate(true);
//       }
//     } else {
//       setEndDate(value);
//       // Validar que la fecha de fin no sea menor que la fecha de inicio
//       if (new Date(value) < new Date(startDate)) {
//         setIsValidDate(false);
//         setOpenSnackbar(true);
//       } else {
//         setIsValidDate(true);
//       }
//     }
//   };

//   const handleDownloadReport = async () => {
//     if (!isValidDate) {
//       // No hacer la petición si las fechas son inválidas
//       return;
//     }

//     const url = `https://4f8k8gjf-3002.use2.devtunnels.ms/betting/report/range?startDate=${startDate}&endDate=${endDate}`;

//     try {
//       const response = await fetch(url, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.ok) {
//         const blob = await response.blob();
//         const link = document.createElement("a");
//         link.href = URL.createObjectURL(blob);
//         link.download = "reporte_transacciones.xlsx";
//         link.click();
//       } else {
//         console.error("Error al obtener el reporte");
//       }
//     } catch (error) {
//       console.error("Hubo un error al realizar la solicitud", error);
//     }
//   };

//   const handleOpenModal = (user) => {
//     setOpenModal(true);
//     // Cargar los movimientos ficticios (esto podría ser dinámico según el evento seleccionado)
//     setMovements(dummyMovements);
//   };

//   const handleCloseModal = () => {
//     setOpenModal(false);
//     setSelectedEvent("");
//     setMovements([]);
//   };

//   const handleEventChange = (e) => {
//     setSelectedEvent(e.target.value);
//     // Puedes filtrar los movimientos según el evento
//     // Si fuera un filtro dinámico, podrías hacer la solicitud a la API aquí
//   };

//   const columns = [
//     { field: "id", header: "id" },
//     {
//       field: "user",
//       header: "usuario",
//       cell: (row) => (
//         <div>
//           <div className="table__username">{row.user}</div>
//           <div className="table__email">{row.email}</div>
//         </div>
//       ),
//     },
//     {
//       field: "name",
//       header: "nombre",
//       cell: (row) => (
//         <div className="table__name">{`${row.name} ${row.lastname}`}</div>
//       ),
//     },
//     { field: "balance", header: "saldo" },
//     { field: "status", header: "estado" },
//     {
//       field: "actions",
//       header: "acción",
//       cell: (user) => (
//         <AppButton onClick={() => handleOpenModal(user)}>
//           <Visibility />
//         </AppButton>
//       ),
//     },
//   ];

//   return (
//     <div className="users__container">
//       <Typography variant="h4" color="white" sx={{ marginBottom: "50px" }}>
//         Transacciones de usuarios
//       </Typography>

//       <Table
//         searcheable
//         columns={columns}
//         rows={rows}
//         AddButton={
//           <Box display="flex" gap="10px" mb="20px">
//             <TextField
//               label="Fecha de inicio"
//               type="date"
//               value={startDate}
//               onChange={(e) => handleDateChange(e, "start")}
//               InputLabelProps={{
//                 shrink: true,
//               }}
//               sx={{
//                 color: "white", // Cambia el color del texto
//                 "& .MuiInputBase-input": {
//                   color: "white", // Cambia el color del texto dentro del input
//                 },
//                 "& .MuiInputLabel-root": {
//                   color: "white", // Cambia el color de la etiqueta
//                 },
//                 backgroundColor: "#333", // Fondo oscuro (gris oscuro) para el input
//                 "& .MuiOutlinedInput-root": {
//                   borderColor: "white", // Borde blanco
//                 },
//                 "& .MuiOutlinedInput-root.Mui-focused": {
//                   borderColor: "white", // Borde blanco cuando está enfocado
//                 },
//                 "& .MuiSvgIcon-root": {
//                   color: "white", // Color blanco para el icono (calendario)
//                 },
//                 "& .MuiInputAdornment-root .MuiSvgIcon-root": {
//                   color: "white", // Color blanco para el icono de fecha
//                 },
//               }}
//             />
//             <TextField
//               label="Fecha de fin"
//               type="date"
//               value={endDate}
//               onChange={(e) => handleDateChange(e, "end")}
//               InputLabelProps={{
//                 shrink: true,
//               }}
//               sx={{
//                 color: "white", // Cambia el color del texto
//                 "& .MuiInputBase-input": {
//                   color: "white", // Cambia el color del texto dentro del input
//                 },
//                 "& .MuiInputLabel-root": {
//                   color: "white", // Cambia el color de la etiqueta
//                 },
//                 backgroundColor: "#333", // Fondo oscuro (gris oscuro) para el input
//                 "& .MuiOutlinedInput-root": {
//                   borderColor: "white", // Borde blanco
//                 },
//                 "& .MuiOutlinedInput-root.Mui-focused": {
//                   borderColor: "white", // Borde blanco cuando está enfocado
//                 },
//                 "& .MuiSvgIcon-root": {
//                   color: "white", // Color blanco para el icono (calendario)
//                 },
//                 "& .MuiInputAdornment-root .MuiSvgIcon-root": {
//                   color: "white", // Color blanco para el icono de fecha
//                 },
//               }}
//             />
//             <AppButton
//               variant="gradient"
//               onClick={handleDownloadReport}
//               sx={{
//                 width: { md: "200px", sm: "200px" },
//                 fontSize: {
//                   xs: ".7rem",
//                   sm: "1rem",
//                 },
//               }}
//               disabled={!isValidDate} // Deshabilita el botón si la fecha no es válida
//             >
//               Reporte
//             </AppButton>
//           </Box>
//         }
//       />

//       {/* Modal de Movimientos */}
//       <Dialog open={openModal} onClose={handleCloseModal}>
//         <DialogTitle>Movimientos del Jugador</DialogTitle>
//         <DialogContent>
//           <FormControl fullWidth>
//             <InputLabel>Evento</InputLabel>
//             <Select
//               value={selectedEvent}
//               onChange={handleEventChange}
//               label="Evento"
//             >
//               {events.map((event, index) => (
//                 <MenuItem key={index} value={event}>
//                   {event}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
          
//           <List>
//             {movements.map((movement) => (
//               <ListItem key={movement.id}>
//                 <ListItemText
//                   primary={`Fecha: ${movement.date}`}
//                   secondary={`Tipo: ${movement.type} - Monto: $${movement.amount}`}
//                 />
//               </ListItem>
//             ))}
//           </List>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseModal} color="primary">
//             Cerrar
//           </Button>
//           <Button onClick={handleDownloadReport} color="secondary">
//             Descargar Reporte
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar para mostrar el mensaje de error */}
//       <Snackbar
//         open={openSnackbar}
//         autoHideDuration={6000}
//         onClose={() => setOpenSnackbar(false)}
//       >
//         <Alert
//           onClose={() => setOpenSnackbar(false)}
//           severity="error"
//           sx={{ width: "100%" }}
//         >
//           La fecha de inicio no puede ser mayor que la fecha de fin.
//         </Alert>
//       </Snackbar>
//     </div>
//   );
// };
