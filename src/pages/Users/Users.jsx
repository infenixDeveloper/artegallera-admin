import React, { useState, useEffect } from "react";
// Redux
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "@redux/slice/userSlice";

// Components
import Button from "@components/Button/Button";
import Table from "@components/Table/Table";
import AddUser from "./AddUser";
import Dropdown from "@components/Dropdown/Dropdown";
import AppButton from "@components/Button/Button";

// Style
import "./Users.css";
import EditUser from "./EditUser";
import SettingsIcon from "@assets/icons/SettingsIcon";
import AddBalance from "./AddBalance";
import DeleteUser from "./DeleteUser";
import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import WithdrawBalance from "./WithdrawBalance";
import ChangePassword from "./ChangePassword";
import { useRef } from "react";
import { io } from "socket.io-client";
import * as XLSX from 'xlsx';

const Users = () => {
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
  const { list: users, status } = useSelector((state) => state.users);

  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [openBalance, setOpenBalance] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openEditUser = Boolean(anchorEl);
  const [selectedUser, setSelectedUser] = useState({});
  const [rows, setRows] = useState([]);

  const handleOpenAddUser = () => {
    setOpen(true);
  };

  const handleEditUser = (event, user) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setSelectedUser(user);
  };

  useEffect(() => {
    const usersRows = Array.from(users || [])
      .sort((a, b) => b.id - a.id)
      .map((user) => ({
        id: user.id,
        user: user.username,
        name: user.first_name,
        lastname: user.last_name,
        email: user.email,
        balance: `$ ${user.initial_balance}`,
        status: user.is_active ? "Activo" : "Inactivo",
        passwordshow: user.passwordshow || "",
      }));

    setRows(usersRows);
  }, [users]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch, openEdit]);

  const handleAddBalance = ({ user, balance }) => {
    try {
      socket.current.emit(
        "add-balance",
        {
          id_user: user,
          amount: parseFloat(balance),
        },

        (response) => {
          if (response.success) {
            dispatch(fetchUsers());
          } else {
            console.error("Error al recargar saldo:", response.error);
          }
        }
      );
    } catch (error) {
      console.error("Error al enviar datos al socket:", error);
    }
  };

  const handleWithdrawBalance = ({ user, balance }) => {
    try {
      socket.current.emit(
        "withdraw-balance",
        {
          id_user: user,
          amount: parseFloat(balance),
        },

        (response) => {

          if (response.success) {
            dispatch(fetchUsers());
          } else {
            console.error("Error al retirar saldo:", response.error);
          }
        }
      );
    } catch (error) {
      console.error("Error al enviar datos al socket:", error);
    }
  };

  const columns = [
    { field: "id", header: "id" },
    {
      field: "user",
      header: "usuario",
      cell: (row) => (
        <div>
          <div className="table__username">{row.user}</div>
          <div className="table__email">{row.email}</div>
        </div>
      ),
    },
    {
      field: "name",
      header: "nombre",
      cell: (row) => (
        <div>
          <div className="table__name">{`${row.name} ${row.lastname}`}</div>
        </div>
      ),
    },
    { field: "balance", header: "saldo" },
    { field: "status", header: "estado" },
    {
      field: "actions",
      header: "acción",
      cell: (user) => (
        <AppButton
          id="custom-dropdown"
          aria-controls={openEditUser ? "dropdown" : undefined}
          aria-haspopup="true"
          aria-expanded={openEditUser ? "true" : undefined}
          onClick={(e) => handleEditUser(e, user)}
        >
          <SettingsIcon />
        </AppButton>
      ),
    },
  ];

  const exportToExcel = () => {
    try {
      // Preparamos los datos
      // tansformar el monto de balance a entero actualmente esta de esta forma $ 1000.00
      // y lo convertimos a 1000
      const excelData = rows.map(row => ({
        ID: row.id,
        Usuario: row.user,
        Nombre: `${row.name} ${row.lastname}`,
        Email: row.email,
        Saldo: parseFloat(row.balance.replace(/[^0-9.-]+/g, "")), // Convertir a número
        Estado: row.status
      }));

      if (excelData.length === 0) {
        alert('No hay datos para exportar');
        return;
      }

      // Crear hoja de trabajo
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Ajustar el ancho de las columnas
      const wscols = [
        { wch: 5 },  // ID
        { wch: 15 }, // Usuario
        { wch: 20 }, // Nombre
        { wch: 25 }, // Email
        { wch: 10 }, // Saldo
        { wch: 10 }  // Estado
      ];
      ws['!cols'] = wscols;
      
      // Crear libro y exportar
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
      XLSX.writeFile(wb, `usuarios_${new Date().toISOString().slice(0,10)}.xlsx`);
      
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      alert('Ocurrió un error al exportar los datos');
    }
  };
  return (
    <>
      <div className="users__container">
        <Typography variant="h4" color="white">
          Usuarios
        </Typography>
        <Table
          searcheable
          columns={columns}
          rows={rows}
          AddButton={
            <div style={{ display: 'flex', gap: '10px' }}>
              <AppButton
                variant="gradient"
                onClick={exportToExcel}
                sx={{
                  width: { md: "200px", sm: "200px" },
                  minWidth: "200px",
                  minHeight: "55px",
                  fontSize: {
                    xs: ".7rem",
                    sm: "1rem",
                  },
                  fontWeight: "bold",
                }}
              >
                Exportar
              </AppButton>
              <AppButton
                variant="gradient"
                onClick={handleOpenAddUser}
                sx={{
                  width: { md: "200px", sm: "200px" },
                  minWidth: "200px",
                  minHeight: "55px",
                  fontSize: {
                    xs: ".7rem",
                    sm: "1rem",
                  },
                  fontWeight: "bold",
                }}
              >
                Crear Usuario +
              </AppButton>
              
            </div>
          }
        />

        <AddUser open={open} close={setOpen} />
        <EditUser open={openEdit} close={setOpenEdit} user={selectedUser} />
        <ChangePassword
          open={openPassword}
          close={setOpenPassword}
          user={selectedUser}
        />
        <AddBalance
          open={openBalance}
          close={setOpenBalance}
          user={selectedUser}
          handleAddBalance={handleAddBalance}
        />
        <WithdrawBalance
          open={openWithdraw}
          close={setOpenWithdraw}
          user={selectedUser}
          handleWithdrawBalance={handleWithdrawBalance}
        />
        <DeleteUser
          open={openDelete}
          close={setOpenDelete}
          user={selectedUser}
        />

        <Dropdown
          id="dropdown"
          open={openEditUser}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
        >
          {" "}
          <MenuList>
            <MenuItem
              onClick={() => {
                setOpenEdit(true);
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <EditOutlinedIcon fontSize="small" sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText>Editar</ListItemText>
            </MenuItem>

            <MenuItem
              onClick={() => {
                setOpenPassword(true);
                setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <EditOutlinedIcon fontSize="small" sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText>Cambiar Contraseña</ListItemText>
            </MenuItem>

            <MenuItem
              className="btn__options"
              onClick={() => {
                setOpenBalance(true), setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <AttachMoneyIcon fontSize="small" sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText>Recargar Saldo</ListItemText>
            </MenuItem>

            <MenuItem
              className="btn__options"
              onClick={() => {
                setOpenWithdraw(true), setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <AttachMoneyIcon fontSize="small" sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText>Retirar Saldo</ListItemText>
            </MenuItem>

            <MenuItem
              className="btn__options"
              onClick={() => {
                setOpenDelete(true), setAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <DeleteOutlinedIcon fontSize="small" sx={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText>Eliminar</ListItemText>
            </MenuItem>
          </MenuList>
        </Dropdown>
      </div>
    </>
  );
};

export default Users;
