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
    is_active: true,
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData(() => {
      return {
        ...formData,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/user", formData);
      if (data.success) {
        dispatch(fetchUsers());
        close(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setFormData({
      id: user.id,
      first_name: user.name,
      last_name: user.lastname,
      username: user.user,
      email: user.email || "",
    });
  }, [user]);

  return (
    <>
      <Modal open={open} close={close}>
        <ModalHeader>
          <Typography sx={{ color: "white", fontSize: "2rem", mb: "1rem" }}>
            Editar
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
              />
            </label>

            <label className="users__form--label">
              APELLIDO
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleFormChange}
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
                />
              </label>
            </div>

            <div className="users__form--groups">
              <label className="users__form--label">
                CORREO ELECTR&Oacute;NICO
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                />
              </label>
            </div>
            <div className="users__form--btn-group">
              <button type="submit" className="users__form--btn">
                Guardar
              </button>
              <button type="submit" className="users__form--btn">
                Cancelar
              </button>
            </div>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
};

export default EditUser;
