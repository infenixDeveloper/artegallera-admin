import { useState } from "react";
import { useDispatch } from "react-redux";
import Modal from "@components/Modal/Modal";
import ModalBody from "@components/Modal/ModalBody";
import api from "@services/api";
import { fetchUsers } from "@redux/slice/userSlice";
import { Alert, Snackbar } from "@mui/material";

const WithdrawBalance = ({ open, close, user, handleWithdrawBalance }) => {
  const dispatch = useDispatch();
  const [balance, setBalance] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleInputChange = (e) => {
    setBalance(e.target.value);
  };

  const handleBalance = () => {
    handleWithdrawBalance({ user: user.id, balance });
    setBalance("");
    close(false);
    setSnackbarOpen(true);
  };

  return (
    <>
      <Modal open={open} close={close}>
        <ModalBody>
          <div className="balance__container">
            <span className="balance__title">
              INGRESE EL MONTO QUE DESEA RETIRAR
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
              Guardar
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
          Retiro procesado con éxito
        </Alert>
      </Snackbar>
    </>
  );
};

export default WithdrawBalance;
