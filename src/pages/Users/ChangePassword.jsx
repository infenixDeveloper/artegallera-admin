import Modal from "@components/Modal/Modal";
import ModalBody from "@components/Modal/ModalBody";
import ModalHeader from "@components/Modal/ModalHeader";
import { Typography } from "@mui/material";
import api from "@services/api";
import { useState } from "react";

const ChangePassword = ({ open, close, user }) => {
  const [password, setPassword] = useState("");
  const [matchPassword, setMatchPassword] = useState("");
  const [errors, setErrors] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      if (!password || !matchPassword) {
        setErrors("Todos los campos son requeridos");
        return;
      }

      if (password === matchPassword) {
        const { data } = await api.post("auth/forgot_password", {
          username: user.user,
          password,
        });
        if (data.success) {
          setErrors("");
          setPassword("");
          setMatchPassword("");
          close(false);
        }
      } else {
        setErrors("Las contraseñas no coinciden");
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <Modal open={open} close={close}>
        <ModalHeader>
          <Typography sx={{ color: "white", fontSize: "2rem", mb: "1rem" }}>
            Cambiar Contraseña
          </Typography>
        </ModalHeader>
        <ModalBody>
          <form className="users__form">
            <div className="users__form--groups">
              <label className="users__form--label">
                Nueva Contraseña
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </div>
            <div className="users__form--groups">
              <label className="users__form--label">
                Confirmar Contraseña
                <input
                  type="password"
                  className="form-control"
                  id="matchPassword"
                  value={matchPassword}
                  onChange={(e) => setMatchPassword(e.target.value)}
                />
              </label>
            </div>
            {errors && <p className="text-danger">{errors}</p>}
            <button
              type="submit"
              className="users__form--btn"
              onClick={handleChangePassword}
            >
              Cambiar Contraseña
            </button>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
};

export default ChangePassword;
