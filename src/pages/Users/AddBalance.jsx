import Modal from "@components/Modal/Modal";
import ModalBody from "@components/Modal/ModalBody";
import ModalHeader from "@components/Modal/ModalHeader";
import { Alert, Snackbar } from "@mui/material";
import { addBalance, fetchUsers } from "@redux/slice/userSlice";
import api from "@services/api";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";

const AddBalance = ({ open, close, user, handleAddBalance }) => {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.users);

  const [balance, setBalance] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleInputChange = (e) => {
    setBalance(e.target.value);
  };

  const handleBalance = () => {
    handleAddBalance({ user: user.id, balance });
    setBalance("");
    close(false);
    setSnackbarOpen(true);
  };

  return (
    <div>
      <Modal open={open} close={close}>
        <ModalBody>
          <div className="balance__container">
            <span className="balance__title">
              INGRESE EL MONTO QUE DESEA RECARGAR
            </span>
            <div className="balance">
              <span className="balance__currency">$</span>
              <input
                className="balance__input"
                type="number"
                value={balance}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
            <button className="balance__button" onClick={handleBalance}>
              RECARGAR
            </button>
          </div>
        </ModalBody>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Saldo Actualizado con éxito
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AddBalance;
