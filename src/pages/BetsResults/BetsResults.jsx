import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table from "@components/Table/Table";
import { getEvents } from "@redux/slice/eventsSlice";

import { IconButton, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AppModal from "@components/Modal/Modal";
import api from "@services/api";
import Cookies from "js-cookie";
import BetsTable from "./BetsTable";
import "./BetsResults.css";
import { fetchWinnersByEvent } from "@redux/slice/winnersSlice";

const BetsResults = () => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.results);
  // const rounds = useSelector((state) => state.rounds.rounds);

  const [openModal, setOpenModal] = useState(false);
  const [openBets, setOpenBets] = useState(false);
  const [rounds, setRounds] = useState([]);
  const [bets, setBets] = useState([]);
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [earnings, setEarnings] = useState({});
  const [totalBets, setTotalBets] = useState({});
  const [totalBetting, setTotalBetting] = useState({});


  useEffect(() => {
    dispatch(getEvents());
  }, [dispatch]);

  useEffect(() => {
    const fetchTotalAmount = async () => {
      try {
        const { data } = await api.get("/user/total-amount");
        setTotalAmount(data.total);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTotalAmount();
  }, []);

  const formatedDate = (date) => {
    const newDate = new Date(date);

    const day = newDate.getDate();
    const month = newDate.getMonth() + 1;
    const year = newDate.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const formatTime = (time) => {
    const date = new Date(`1970-01-01T${time}`);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleModal = async (row) => {
    setTitle(row.name);
    setOpenModal(true);

    const token = Cookies.get("authToken");
    try {
      const { data } = await api.get(`/rounds/event/${row.actions.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setRounds(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBetsModal = async (row) => {
    setOpenBets(true);

    const token = Cookies.get("authToken");

    try {
      const { data } = await api.get(`/betting/married/${row.actions.id_event}/${row.actions.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setBets(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEarnings = async (id) => {
    try {
      const { data } = await api.get(`/winners/total-earnings/${id}`);
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchAllEarnings = async () => {
      const earningsMap = {};
      const betsMap = {};
      for (const event of events?.events || []) {
        const earningsAmount = await fetchEarnings(event.id);

        earningsMap[event.id] = earningsAmount.earnings;
        betsMap[event.id] = earningsAmount.bets;
      }
      setEarnings(earningsMap); // Guardar las ganancias por evento en el estado
      setTotalBets(betsMap);
    };

    fetchAllEarnings();
  }, [events]);

  const fetchTotalBettings = async (id) => {
    try {
      const { data } = await api.get(`/winners/total-amount/${id}`);
      return data.data;
    } catch (error) {
      console.error(error);
      return { total_amount: 0 };
    }
  };

  useEffect(() => {
    const fetchTotalBetting = async () => {
      const bettingMap = {};

      for (const event of events?.events || []) {
        try {
          const data = await fetchTotalBettings(event.id);

          bettingMap[event.id] = data;
        } catch (error) {
          console.error("Error fetching total betting:", error);
          bettingMap[event.id] = 0;

        }
      }
      setTotalBetting(bettingMap);
    };

    fetchTotalBetting();
  }, [events]);


  const columns = [
    { field: "name", header: "Nombre" },
    { field: "date", header: "Fecha" },
    { field: "time", header: "Horario" },
    { field: "location", header: "Lugar" },
    { field: "totalAmount", header: "M. Total" },
    { field: "totalBetting", header: "Saldo Total Apostado" },
    {
      field: "totalBalance",
      header: "Saldo Casado",
    },
    { field: "earnings", header: "Corretage" },
    {
      field: "actions",
      header: "Acciones",
      cell: (row) => {
        return (
          <IconButton onClick={() => handleModal(row)}>
            <VisibilityIcon fontSize="small" sx={{ color: "white" }} />
          </IconButton>
        );
      },
    },
  ];

  const rows = [...(events?.events || [])]
    ?.sort((a, b) => b.id - a.id)
    ?.map((event) => ({
      name: event.name,
      location: event.location,
      time: formatTime(event.time),
      date: formatedDate(event.date),
      totalAmount: event.total_amount,
      totalBalance: totalBets[event.id] || 0,
      totalBetting: totalBetting[event.id] || 0,
      earnings: earnings[event.id] || 0,
      actions: event,
    }));

  const roundsColumns = [
    { field: "round", header: "Pelea" },
    { field: "result", header: "Resultado" },
    {
      field: "redAmount",
      header: (
        <Typography fontWeight="bold" fontSize={".9rem"}>
          Monto{" "}
          <Typography fontWeight="bold" color="red">
            Rojo
          </Typography>
        </Typography>
      ),
    },
    {
      field: "greenAmount",
      header: (
        <Typography fontWeight="bold" fontSize={".9rem"}>
          Monto{" "}
          <Typography fontWeight="bold" color="green">
            Verde
          </Typography>
        </Typography>
      ),
    },
    { field: "totalAmount", header: "Monto Total" },
    { field: "earnings", header: "Ganancias" },
    {
      field: "actions",
      header: "Acciones",
      cell: (row) => {
        return (
          <IconButton onClick={() => handleBetsModal(row)}>
            <VisibilityIcon fontSize="small" sx={{ color: "white" }} />
          </IconButton>
        );
      },
    },
    ,
  ];

  const roundsRows = rounds
    ?.sort((a, b) => a.id - b.id)
    .map((round) => {
      return {
        round: round.round,
        result:
          round.winners[0]?.team_winner === "draw" ? (
            "TABLA"
          ) : round.winners[0]?.team_winner === "red" ? (
            <Typography color="red">ROJO</Typography>
          ) : round.winners[0]?.team_winner === "green" ? (
            <Typography color="green">VERDE</Typography>
          ) : (
            "-"
          ),
        redAmount: round.winners[0]?.red_team_amount,
        greenAmount: round.winners[0]?.green_team_amount,
        totalAmount: round.winners[0]?.total_amount,
        earnings: round.winners[0]?.earnings,
        actions: round,
      };
    });

  const betsColumns = [
    {
      field: "redUser",
      header: (
        <>
          Usuario <span style={{ color: "red" }}>Rojo</span>
        </>
      ),
    },
    { field: "redAmount", header: "Apuesta" },
    { field: "greenUser", header: "Usuario Verde" },
    { field: "greenAmount", header: "Apuesta" },
  ];

  const betsRows = bets
    .flatMap((bet) => {
      return [
        {
          redUser: bet.bettingOne?.user?.username,
          idRedBet: bet.id_betting_one,
          redAmount: bet.bettingOne?.amount,
          greenUser: bet.bettingTwo?.user?.username,
          idGreenBet: bet.id_betting_two,
          greenAmount: bet.bettingTwo?.amount,
        },
      ];
    });

  return (
    <div className="results__container">
      <Typography variant="h4" color="white">
        Resultados de Apuestas
      </Typography>
      <Table columns={columns} rows={rows} searcheable />

      <AppModal open={openModal} close={() => setOpenModal(false)}>
        <Table columns={roundsColumns} rows={roundsRows} />
      </AppModal>

      <AppModal open={openBets} close={() => setOpenBets(false)}>
        <BetsTable columns={betsColumns} rows={betsRows} />
      </AppModal>
    </div>
  );
};

export default BetsResults;
