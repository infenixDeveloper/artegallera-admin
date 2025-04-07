// import React, { useState, useEffect, useRef } from "react";
// import { io } from "socket.io-client";
// import "./Switch.css";
// import { useDispatch, useSelector } from "react-redux";
// import { getLastEvent } from "@redux/slice/eventsSlice";

// const Switch = ({ idEvent, round, setIsBettingActive }) => {
//   const dispatch = useDispatch();
//   const event = useSelector((state) => state.results.event);
//   const [isOpen, setIsOpen] = useState(null);
//   const socket = useRef(null);

//   useEffect(() => {
//     dispatch(getLastEvent());
//   }, [dispatch]);

//   useEffect(() => {
//     socket.current = io(import.meta.env.VITE_API_URL_WBET);

//     socket.current.on("connect", () => {
//       console.log("Conectado al servidor");
//     });

//     socket.current.on("connect_error", (err) => {
//       console.error("Error al conectar al servidor de sockets:", err);
//     });

//     return () => {
//       if (socket.current) {
//         socket.current.disconnect();
//       }
//     };
//   }, []);

//   useEffect(() => {
//     socket.current.emit(
//       "getRoundStatus",
//       { id_event: idEvent, id: round },
//       (response) => {
//         if (response.success) {
//           setIsOpen(
//             response.data.round?.filter((r) => r.id === round)[0]
//               .is_betting_active
//           );

//           // setIsBettingActive(
//           //   response.data.round?.filter((r) => r.id === round)[0]
//           //     .is_betting_active
//           // );
//         } else {
//           console.error(
//             "Error al obtener el estado del evento:",
//             response.message
//           );
//         }
//       }
//     );
//   }, [idEvent]);

//   const handleToggleChange = () => {
//     const newState = {
//       id_event: idEvent,
//       isOpen: !isOpen,
//       id_round: round,
//     };
//     setIsOpen((prevValue) => (!prevValue));

//     // setIsBettingActive(newState.isOpen);

//     socket.current.emit("toggleEvent", newState, (response) => {
//       if (response.success) {
//         console.log("Estado enviado correctamente");
//       } else {
//         console.error("Error al enviar el estado del toggle.");
//       }
//     });
//   };

//   return (
//     <div className="switch-wrapper">
//       <input
//         type="checkbox"
//         id="toggle"
//         className="toggle-input"
//         checked={isOpen}
//         onChange={handleToggleChange}
//       />
//       <label htmlFor="toggle" className="button">
//         <span className="slider"></span>
//       </label>
//     </div>
//   );
// };

// export default Switch;
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./Switch.css";
import { useDispatch, useSelector } from "react-redux";
import { getLastEvent } from "@redux/slice/eventsSlice";

const Switch = ({ idEvent, round, setIsBettingActive }) => {
  const dispatch = useDispatch();
  const event = useSelector((state) => state.results.event);
  const [isOpen, setIsOpen] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar la carga
  const socket = useRef(null);

  useEffect(() => {
    dispatch(getLastEvent());
  }, [dispatch]);

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_API_URL_WBET);

    socket.current.on("connect", () => {
      console.log("Conectado al servidor");
    });

    socket.current.on("connect_error", (err) => {
      console.error("Error al conectar al servidor de sockets:", err);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    socket.current.emit(
      "getRoundStatus",
      { id_event: idEvent, id: round },
      (response) => {
        if (response.success) {
          const roundStatus = response.data.round?.filter((r) => r.id === round)[0];
          setIsOpen(roundStatus.is_betting_active);
          setIsLoading(false); // Termina de cargar el estado
        } else {
          console.error("Error al obtener el estado del evento:", response.message);
          setIsLoading(false); // Termina de cargar el estado aún si hay error
        }
      }
    );
  }, [idEvent, round]);

  const handleToggleChange = () => {
    const newState = {
      id_event: idEvent,
      isOpen: !isOpen,
      id_round: round,
    };
    setIsOpen((prevValue) => !prevValue);

    socket.current.emit("toggleEvent", newState, (response) => {
      if (response.success) {
        console.log("Estado enviado correctamente");
      } else {
        console.error("Error al enviar el estado del toggle.");
      }
    });
  };

  return (
    <div className="switch-wrapper">
      {isLoading ? (
        <div className="loading-text">Cargando...</div> // Indicador de carga
      ) : (
        <input
          type="checkbox"
          id="toggle"
          className="toggle-input"
          checked={isOpen}
          onChange={handleToggleChange}
          disabled={isLoading} // Desactiva el checkbox mientras se está cargando
        />
      )}
      <label
        htmlFor="toggle"
        className={`button ${isLoading ? "loading" : ""}`} // Cambia el estilo cuando esté cargando
      >
        <span className="slider"></span>
      </label>
    </div>
  );
};

export default Switch;
