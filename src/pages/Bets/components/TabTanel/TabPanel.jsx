import React, { useState, useEffect, useRef } from "react";
import {
  Tabs,
  Tab,
  Box,
  Button,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import { tabsClasses } from "@mui/material/Tabs";
import Switch from "../Switch/Switch";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import { getLastEvent } from "@redux/slice/eventsSlice";
import { fetchRoundsByEvent } from "@redux/slice/roundsSlice";
import AppModal from "@components/Modal/Modal";
import ModalHeader from "@components/Modal/ModalHeader";
import ModalFooter from "@components/Modal/ModalFooter";
import AppButton from "@components/Button/Button";


const TabPanel = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const DynamicTabs = ({ idEvent }) => {
  const socket = useRef(null);
  const dispatch = useDispatch();
  const event = useSelector((state) => state.results.event);
  const rounds = useSelector((state) => state.rounds.rounds);
  const [redBet, setRedBet] = useState(0);
  const [greenBet, setGreenBet] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    team: "",
    id: null,
  });

  const [value, setValue] = useState(0);
  const [isBettingActive, setIsBettingActive] = useState(null);
  const [selectedRoundId, setSelectedRoundId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_API_URL_WBET);
    socket.current.on("connect", () => {
      console.log("Connected to socket");
    });

    dispatch(getLastEvent());
    dispatch(fetchRoundsByEvent(idEvent));

    return () => {
      socket.current.disconnect();
    };
  }, [idEvent, dispatch]);

  useEffect(() => {
    if (rounds?.length > 0 && selectedRoundId === null) {
      setSelectedRoundId(rounds[0]?.id);
    }
  }, [rounds]);
  useEffect(() => {
    socket.current.on("isBettingActive", (response) => {
      if (response.success) {

        response.data.id === selectedRoundId &&
          setIsBettingActive(response.data.is_betting_active);

        setTimeout(() => {
          socket.current.emit(
            "getBetStats",
            { id_event: idEvent, team: "red", id_round: selectedRoundId },
            (response) => {
              setRedBet(response.totalAmount);
            }
          );

          socket.current.emit(
            "getBetStats",
            { id_event: idEvent, team: "green", id_round: selectedRoundId },
            (response) => {
              setGreenBet(response.totalAmount);
            }
          );
        }, 1000);
      }
    });
  }, [isBettingActive, redBet, greenBet]);

  useEffect(() => {
    socket.current.emit(
      "getBetStats",
      { id_event: idEvent, team: "red", id_round: selectedRoundId },

      (response) => {
        setRedBet(response.totalAmount);
      }
    );

    socket.current.emit(
      "getBetStats",
      { id_event: idEvent, team: "green", id_round: selectedRoundId },
      (response) => {
        setGreenBet(response.totalAmount);
      }
    );

    // socket.current.on("isBettingActive", (response) => {
    //   if (response.success) {
    //     response.data.id === selectedRoundId &&
    //       setIsBettingActive(response.data.is_betting_active);
    //   }
    // });
  }, [event, redBet, greenBet, selectedRoundId]);

  useEffect(() => {
    socket.current.on("newBet", (newBet) => {
      if (newBet.team === "red") {
        setRedBet((prev) => prev + newBet.amount);
      } else if (newBet.team === "green") {
        setGreenBet((prev) => prev + newBet.amount);
      }
    });
  }, [redBet, greenBet, isBettingActive]);

  const handleChange = async (value, newValue) => {
    setValue(newValue);
    setSelectedRoundId(rounds[newValue]?.id);

    socket.current.emit(
      "getRoundStatus",
      { id: rounds[newValue]?.id, id_event: event?.id },
      (response) => {
        if (response.success) {
          setIsBettingActive(
            response.data?.round?.filter((r) => r.id === rounds[newValue]?.id)[0].is_betting_active
          );

        } else {
          console.error(
            "Error al obtener el estado del evento:",
            response.message
          );
        }
      }
    );
  };

  const createRound = () => {
    socket.current.emit("createRound", { id_event: idEvent }, (response) => {
      if (response.success) {
        dispatch(fetchRoundsByEvent(idEvent)).then((action) => {
          const updatedRounds = action.payload;
          const lastIndex = updatedRounds.length - 1;
          setValue(lastIndex);
          setSelectedRoundId(updatedRounds[lastIndex]?.id);
        });
      } else {
        console.error(response)
        console.error("Failed to create round:", response.message);
      }
    });
  };

  const handleOpenModal = (team, id) => {
    if (isBettingActive) {
      setSnackbarOpen(true);
      return;
    }
    setOpenModal(true)
    setSelectedOptions({ team, id })
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedOptions({ team: "", id: null })
  }

  const handleConfirmModal = () => {
    handleWinner(selectedOptions.team, selectedOptions.id)
  }

  const handleWinner = (team, id) => {
    if (isBettingActive) {
      setSnackbarOpen(true);
      return;
    }

    const winner = {
      id_event: event?.id,
      id_round: id,
      team,
    };

    socket.current.emit("selectWinner", winner, (response) => {
      if (response.success) {
        setOpenModal(false)
        dispatch(fetchRoundsByEvent(idEvent));
      }
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const formatDate = (dateString) => {
    // Crear un objeto Date localmente basado en el valor almacenado
    const localDate = new Date(dateString);

    // Formatear la fecha como "DD/MM/YYYY"
    return localDate.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h5" color="white">
        {event?.name} - {formatDate(event?.date)}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={createRound}
        sx={{ marginTop: 2 }}
      >
        Nueva Pelea
      </Button>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          width: "400px",
          mt: 1,
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
          sx={{
            border: "1px solid #e8e8e8",
            "& .MuiTabs-indicator": {
              backgroundColor: "#1890ff",
            },
            [`& .${tabsClasses.scrollButtons}`]: {
              "&.Mui-disabled": { opacity: 0.3 },
              color: "white",
            },
          }}
        >
          {rounds?.map((round, index) => (
            <Tab
              key={round.id}
              label={`Pelea ${round?.round}`}
              sx={{ color: "white" }}
            />
          ))}
        </Tabs>
      </Box>

      {rounds?.map((round, index) => (
        <TabPanel key={round.id} value={value} index={index}>
          <div className="bets__btn-panel">
            <h2>APERTURA Y CIERRE DE APUESTA</h2>
            <Switch
              idEvent={idEvent}
              round={round.id}
            // setIsBettingActive={setIsBettingActive}
            />
            <h3>SELECCIONA AL GANADOR</h3>

            <div className="bets__box-container">
              {/* Red Team */}
              <div className="bets__box red">
                <p className="bets__box-header red">APUESTA AL ROJO</p>
                <div className="bets__box-content">
                  <span>${redBet || 0}</span>
                  <button
                    className="bets__box-btn red"
                    disabled={!!round.id_winner}
                    onClick={() => handleOpenModal("red", round?.id)}
                  >
                    GANADOR
                  </button>
                </div>
              </div>
              {/* Green Team */}
              <div className="bets__box green">
                <p className="bets__box-header green">APUESTA AL VERDE</p>
                <div className="bets__box-content">
                  <span>${greenBet || 0}</span>
                  <button
                    className="bets__box-btn green"
                    disabled={!!round.id_winner}
                    onClick={() => handleOpenModal("green", round?.id)}
                  >
                    GANADOR
                  </button>
                </div>
              </div>
              <div className="bets__box draw">
                <p className="bets__box-header draw">TABLA</p>
                <div className="bets__box-content">
                  <button
                    className="bets__box-btn draw"
                    disabled={!!round.id_winner}
                    onClick={() => handleOpenModal("draw", round?.id)}
                  >
                    TABLA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      ))}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="warning"
          sx={{ width: "100%" }}
        >
          No se puede seleccionar al ganador mientras las apuestas están
          activas.
        </Alert>
      </Snackbar>

      <AppModal open={openModal} close={handleCloseModal}>
        <ModalHeader>
          <Typography variant="h4" color="white" align="center">
            Esta seguro de selecionar al{" "}<Typography variant="h4" color={selectedOptions.team === "red" ? "red" : selectedOptions.team === "green" ? "green" : "white"}>
              {selectedOptions.team === "red" ? "ROJO" : selectedOptions.team === "green" ? "VERDE" : "TABLA"}{" "}
            </Typography> como ganador?
          </Typography>
        </ModalHeader>
        <ModalFooter style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <AppButton variant="gradient" onClick={handleConfirmModal}>SI</AppButton>
          <AppButton variant="gradient" onClick={handleCloseModal}> NO</AppButton>
        </ModalFooter>
      </AppModal>
    </Box >
  );
};

export default DynamicTabs;
