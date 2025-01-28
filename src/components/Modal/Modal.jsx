import { useEffect } from "react";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import { Box } from "@mui/material";

const AppModal = ({ open, close, children }) => {
  const handleClose = () => {
    close(false);
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    minWidth: 400,
    maxWidth: "90%",
    maxHeight: "90%",
    background: "linear-gradient(180deg, #494209 0%, #000000 100%)",
    border: "2px solid #fff",
    borderRadius: "20px",
    boxShadow: 24,
    p: 4,
    overflowY: "auto",
  };

  // Efecto para manejar el scroll
  useEffect(() => {
    if (open) {
      document.body.classList.add("no-scroll"); // Agrega clase para ocultar scroll
    } else {
      document.body.classList.remove("no-scroll"); // Remueve clase cuando el modal se cierra
    }
    return () => {
      document.body.classList.remove("no-scroll"); // Limpieza
    };
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
    >
      <Box sx={style}>{children}</Box>
    </Modal>
  );
};

export default AppModal;
