import api from "@services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import AppButton from "@components/Button/Button";

import "./Login.css";
import { Typography } from "@mui/material";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [dataForm, setDataForm] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState("");

  const handleShowPassword = (e) => {
    const { checked } = e.currentTarget;
    setShowPassword(checked);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setDataForm(() => {
      return {
        ...dataForm,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", dataForm);

      if (response?.data?.success && response?.data?.data?.token) {
        Cookies.set("authToken", response?.data?.data?.token);

        if (Cookies.get("authToken") && response.data.data.user.is_admin) {
          navigate("/admin");
        } else {
          setErrors("No tienes permiso para ingresar a este sitio");
        }
      }
    } catch (error) {
      console.error(error);
      setErrors(error.response.data.message);
    }
  };

  return (
    <>
      <div>
        <div className="login__container">
          <form className="login__form" onSubmit={handleSubmit}>
            <h2>Iniciar Sesion</h2>
            <label className="login__label">
              Usuario
              <input
                type="text"
                name="username"
                className="login__input"
                onChange={handleFormChange}
              />
            </label>
            <label className="login__label">
              Contraseña
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="login__input login__input-pass"
                onChange={handleFormChange}
              />
              <label className="login__btn-pass">
                <input type="checkbox" onChange={handleShowPassword} />
                <span>Mostrar Contraseña</span>
              </label>
            </label>
            {errors && <Typography color="error">{errors}</Typography>}
            <AppButton variant="gradient-square" type="submit">
              Ingresar
            </AppButton>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
