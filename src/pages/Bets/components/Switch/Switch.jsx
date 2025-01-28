import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./Switch.css";
import { useDispatch, useSelector } from "react-redux";
import { getLastEvent } from "@redux/slice/eventsSlice";

const Switch = ({ idEvent, round, setIsBettingActive }) => {
  const dispatch = useDispatch();
  const event = useSelector((state) => state.results.event);
  const [isOpen, setIsOpen] = useState(null);
  const socket = useRef(null);

  useEffect(() => {
    dispatch(getLastEvent());
  }, [dispatch]);

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_API_URL_WBET);

    socket.current.on("connect", () => {
      console.log("Conectado al servidor");
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
          setIsOpen(
            response.data.round?.filter((r) => r.id === round)[0]
              .is_betting_active
          );

          // setIsBettingActive(
          //   response.data.round?.filter((r) => r.id === round)[0]
          //     .is_betting_active
          // );
        } else {
          console.error(
            "Error al obtener el estado del evento:",
            response.message
          );
        }
      }
    );
  }, [idEvent]);

  const handleToggleChange = () => {
    const newState = {
      id_event: idEvent,
      isOpen: !isOpen,
      id_round: round,
    };
    setIsOpen(newState.isOpen);

    // setIsBettingActive(newState.isOpen);

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
      <input
        type="checkbox"
        id="toggle"
        className="toggle-input"
        checked={isOpen}
        onChange={handleToggleChange}
      />
      <label htmlFor="toggle" className="button">
        <span className="slider"></span>
      </label>
    </div>
  );
};

export default Switch;
