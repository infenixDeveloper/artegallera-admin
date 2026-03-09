import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Box, TextField } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import Table from "@components/Table/Table";
import AppButton from "@components/Button/Button";
import Modal from "@components/Modal/Modal";
import ModalHeader from "@components/Modal/ModalHeader";
import ModalBody from "@components/Modal/ModalBody";
import ModalFooter from "@components/Modal/ModalFooter";

import { getEvents, updateEventSpectators } from "@redux/slice/eventsSlice";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const Eventos = () => {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.results);

  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [spectatorsValue, setSpectatorsValue] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(getEvents());
  }, [dispatch]);

  const rows = useMemo(() => {
    return Array.from(events || [])
      .sort((a, b) => (b?.id || 0) - (a?.id || 0))
      .map((event) => ({
        id: event.id,
        name: event.name,
        date: formatDate(event.date),
        location: event.location,
        status: event.is_active ? "Activo" : "Inactivo",
        base_viewers: event.base_viewers ?? 0,
      }));
  }, [events]);

  const handleOpenSpectatorsModal = (row) => {
    const ev = Array.from(events || []).find((e) => e?.id === row?.id) || null;
    setSelectedEvent(ev);
    setSpectatorsValue(ev?.base_viewers ?? 0);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    if (saving) return;
    setOpenModal(false);
    setSelectedEvent(null);
    setSpectatorsValue(0);
  };

  const handleSave = async () => {
    if (!selectedEvent?.id) return;
    const parsed = Number(spectatorsValue);
    if (!Number.isFinite(parsed) || parsed < 0 || !Number.isInteger(parsed)) return;

    setSaving(true);
    try {
      await dispatch(
        updateEventSpectators({ id: selectedEvent.id, base_viewers: parsed })
      ).unwrap();
      setOpenModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "id", header: "id" },
    { field: "name", header: "nombre" },
    { field: "date", header: "fecha" },
    { field: "location", header: "ubicación" },
    { field: "status", header: "estado" },
    { field: "base_viewers", header: "espectadores" },
    {
      field: "actions",
      header: "acciones",
      cell: (row) => (
        <AppButton
          variant="text"
          onClick={() => handleOpenSpectatorsModal(row)}
          sx={{
            minWidth: "auto",
            padding: 0,
            minHeight: 0,
            borderRadius: 0,
            background: "transparent !important",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white"
          }}
          title="Editar espectadores"
        >
          <EditOutlinedIcon />
        </AppButton>
      ),
    },
  ];

  const modalEventName = selectedEvent?.name ? ` (${selectedEvent.name})` : "";
  const currentValue = selectedEvent?.base_viewers ?? 0;

  return (
    <div className="users__container">
      <Typography variant="h4" color="white">
        Eventos
      </Typography>

      <Table
        searcheable
        columns={columns}
        rows={rows}
        AddButton={
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" color="white">
              {loading ? "Cargando..." : `Total: ${rows.length}`}
            </Typography>
          </Box>
        }
      />

      <Modal open={openModal} close={setOpenModal}>
        <ModalHeader>
          <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
            Actualizar espectadores{modalEventName}
          </Typography>
        </ModalHeader>
        <ModalBody>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Cantidad"
              type="number"
              value={spectatorsValue}
              inputProps={{ min: 0, step: 1 }}
              onChange={(e) => setSpectatorsValue(e.target.value === "" ? "" : Number(e.target.value))}
              helperText={`Valor actual: ${currentValue}. Puede colocar una cantidad menor o mayor.`}
              sx={{
                "& .MuiInputLabel-root": { color: "white" },
                "& .MuiInputLabel-root.Mui-focused": { color: "white" },
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.23)" },
                  "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                  "&.Mui-focused fieldset": { borderColor: "white" },
                },
                "& .MuiFormHelperText-root": { color: "rgba(255, 255, 255, 0.7)" },
              }}
            />
          </Box>
        </ModalBody>
        <ModalFooter style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <AppButton variant="gradient" onClick={handleCloseModal} disabled={saving}>
            Cancelar
          </AppButton>
          <AppButton variant="gradient" onClick={handleSave} disabled={saving}>
            Guardar
          </AppButton>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Eventos;

