import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUsers } from "@redux/slice/userSlice";

import api from "@services/api";

import Modal from "@components/Modal/Modal";
import ModalBody from "@components/Modal/ModalBody";
import ModalHeader from "@components/Modal/ModalHeader";
import { Typography } from "@mui/material";

const EditUser = ({ open, close, user, onSave }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    id: null,
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    status: "Inactivo", // Valor por defecto
  });

  // Función para convertir status a booleano
  const statusToBoolean = (status) => status === "Activo";
  
  // Función para convertir booleano a status
  const booleanToStatus = (isActive) => isActive ? "Activo" : "Inactivo";

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        // Convertimos el status a booleano para la API
        is_active: statusToBoolean(formData.status)
      };
      
      const { data } = await api.put("/user", payload);
      
      if (data.success) {
        dispatch(fetchUsers());
        close(false);
        if (onSave) onSave();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      // Aquí podrías agregar manejo de errores para el usuario
    }
  };

  useEffect(() => {
    if (user && open) {
      console.log("user", user);
      setFormData({
        id: user.id,
        first_name: user.name || user.first_name || "",
        last_name: user.lastname || user.last_name || "",
        username: user.user || user.username || "",
        email: user.email || "",
        password: user.password || "",
        passwordshow: user.passwordshow || "",
        // Convertimos el estado del usuario a nuestro formato de status
        status: user.status || booleanToStatus(user.is_active)
      });
    }
  }, [user, open]);

  if (!open) return null;

  return (
    <Modal open={open} close={close}>
      <ModalHeader>
        <Typography sx={{ color: "white", fontSize: "2rem", mb: "1rem" }}>
          Editar Usuario
        </Typography>
      </ModalHeader>
      <ModalBody>
        <form className="users__form" onSubmit={handleSubmit}>
          <label className="users__form--label">
            NOMBRE
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleFormChange}
              required
            />
          </label>

          <label className="users__form--label">
            APELLIDO
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleFormChange}
              required
            />
          </label>

          <div className="users__form--groups">
            <label className="users__form--label">
              USUARIO
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                required
              />
            </label>
          </div>

          <div className="users__form--groups">
            <label className="users__form--label">
              CORREO ELECTRÓNICO
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
            </label>
          </div>
          
          <div className="users__form--groups">
            <label className="users__form--label">
              Estatus
              <select
                className="users__form--select"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </label>
          </div>
          
          <div className="users__form--btn-group">
            <button type="submit" className="users__form--btn">
              Guardar
            </button>
            <button 
              type="button"
              className="users__form--btn"
              onClick={() => close(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};

export default EditUser;