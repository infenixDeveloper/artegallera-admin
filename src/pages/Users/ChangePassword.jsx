import Modal from "@components/Modal/Modal";
import ModalBody from "@components/Modal/ModalBody";
import ModalHeader from "@components/Modal/ModalHeader";
import { Typography } from "@mui/material";
import api from "@services/api";
import { useState, useEffect } from "react";

const ChangePassword = ({ open, close, user }) => {
  console.log(user);
  
  const [password, setPassword] = useState("");
  const [matchPassword, setMatchPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [errors, setErrors] = useState("");
  const [success, setSuccess] = useState(false);

  // Resetear el estado cuando se abre el modal o cambia el usuario
  useEffect(() => {
    if (open) {
      setCurrentPassword(user?.passwordshow || "********");
      setPassword("");
      setMatchPassword("");
      setErrors("");
      setSuccess(false);
    }
  }, [open, user]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      if (!password || !matchPassword) {
        setErrors("Todos los campos son requeridos");
        return;
      }

      if (password !== matchPassword) {
        setErrors("Las contraseñas no coinciden");
        return;
      }

      const { data } = await api.post("auth/forgot_password", {
        username: user.user,
        password,
      });

      if (data.success) {
        setSuccess(true);
        setCurrentPassword(password); // Actualizar la contraseña mostrada
        setTimeout(() => {
          close(false);
        }, 1500); // Cerrar después de 1.5 segundos
      }
    } catch (error) {
      console.error(error);
      setErrors("Ocurrió un error al cambiar la contraseña");
    }
  };

  return (
    <Modal open={open} close={close}>
      <ModalHeader>
        <Typography sx={{ color: "white", fontSize: "2rem", mb: "1rem" }}>
          Cambiar Contraseña
        </Typography>
      </ModalHeader>
      <ModalBody>
        <form className="users__form">
          {/* Campo para mostrar contraseña actual */}
          <div className="users__form--groups">
            <label className="users__form--label">
              Contraseña Actual
              <input
                type="text"
                className="form-control"
                value={currentPassword}
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                  opacity: 0.8
                }}
              />
              <small className="text-muted">
                Este campo es solo para visualización
              </small>
            </label>
          </div>

          <div className="users__form--groups">
            <label className="users__form--label">
              Nueva Contraseña
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="8"
              />
            </label>
          </div>
          
          <div className="users__form--groups">
            <label className="users__form--label">
              Confirmar Contraseña
              <input
                type="password"
                className="form-control"
                value={matchPassword}
                onChange={(e) => setMatchPassword(e.target.value)}
                required
                minLength="8"
              />
            </label>
          </div>
          
          {errors && <p className="text-danger">{errors}</p>}
          {success && <p className="text-success">¡Contraseña cambiada exitosamente!</p>}
          
          <div className="users__form--btn-group">
            <button
              type="submit"
              className="users__form--btn"
              onClick={handleChangePassword}
              disabled={success}
            >
              {success ? 'Éxito' : 'Cambiar Contraseña'}
            </button>
            <button
              type="button"
              className="users__form--btn"
              onClick={() => close(false)}
              disabled={success}
            >
              Cancelar
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};

export default ChangePassword;