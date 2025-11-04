import img from "@assets/images/arte-gallera-logo.png";
import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { toggleMenu } from "@redux/slice/menuSlice";
import Cookies from "js-cookie";
import LogoutIcon from "@mui/icons-material/Logout";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import SensorsIcon from "@mui/icons-material/Sensors";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ChatIcon from '@mui/icons-material/Chat';
import "./Sidebar.css";

const Sidebar = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.menu.isOpen);

  const routes = [
    {
      name: "Transmisión",
      path: "/admin",
      icon: <SensorsIcon />,
    },
    {
      name: "Resultados de Apuestas",
      path: "/admin/apuestas",
      icon: <DashboardIcon />,
    },
    {
      name: "Usuarios",
      path: "/admin/usuarios",
      icon: <PersonIcon />,
    },
    {
      name: "Transacciones",
      path: "/admin/transacciones",
      icon: <AccountBalanceWalletIcon />,
    },
    {
      name: "Videos",
      path: "/admin/videos",
      icon: <OndemandVideoIcon />,
    },
    {
      name: "Evento - Chats",
      path: "/admin/evento-chats",
      icon: <ChatIcon />,
    },
  ];

  const handleLogout = () => {
    Cookies.remove("authToken");
    window.location.reload();
  };

  return (
    <>
      <div
        className={`sidebar__overlay ${isOpen ? "open" : ""}`}
        onClick={() => dispatch(toggleMenu())}
      ></div>
      <div className={`sidebar__container ${isOpen ? "open" : "close"}`}>
        <button
          onClick={() => dispatch(toggleMenu())}
          className="sidebar__btn-close"
        >
          X
        </button>
        <div className="sidebar__header">
          <img src={img} alt="Arte Gallera Logo" />
        </div>

        <ul className="sidebar__links">
          {routes.map((route) => (
            <li className="sidebar__link" key={route.name}>
              <NavLink
                to={route.path}
                end
                className={({ isActive }) =>
                  `sidebar__link--link ${isActive ? "active" : ""}`
                }
              >
                {route.icon}
                {route.name}
              </NavLink>
            </li>
          ))}
        </ul>
        <button className="sidebar__btn-logout" onClick={handleLogout}>
          <LogoutIcon fontSize="small" />
          Salir
        </button>
      </div>
    </>
  );
};

export default Sidebar;
