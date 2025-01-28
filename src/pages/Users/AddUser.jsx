import { useState } from "react";

import Modal from "@components/Modal/Modal";
import ModalBody from "@components/Modal/ModalBody";
import ModalHeader from "@components/Modal/ModalHeader";

import { fetchUsers, registerUser } from "@redux/slice/userSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import api from "@services/api";

import imgLogo from "@assets/images/arte-gallera-logo.png";

const AddUser = ({ open, close }) => {
  const dispatch = useDispatch();

  const { error } = useSelector((state) => state.users);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    email: "",
    initial_balance: "",
    is_admin: false,
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
      const { data } = await api.post("/auth/register", formData);

      if (data.success) {
        dispatch(fetchUsers());
        close(false);
        setFormData({
          first_name: "",
          last_name: "",
          username: "",
          password: "",
          email: "",
          initial_balance: "",
          is_admin: false,
          is_active: true,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal open={open} close={close}>
      <ModalHeader>
        <div className="user__modal-header">
          <img src={imgLogo} width={150} alt="" />
        </div>
      </ModalHeader>
      <ModalBody>
        <form className="users__form" onSubmit={handleSubmit}>
          <div className="users__form--groups">
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
          </div>

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
            <label className="users__form--label">
              CONTRASEÑA
              <input
                type="text"
                name="password"
                value={formData.password}
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
            <label className="users__form--label">
              SALDO INICIAL
              <input
                type="text"
                name="initial_balance"
                value={formData.initial_balance}
                onChange={handleFormChange}
              />
            </label>
          </div>
          <button type="submit" className="users__form--btn">
            Crear
          </button>
        </form>
      </ModalBody>
    </Modal>
  );
};

export default AddUser;
