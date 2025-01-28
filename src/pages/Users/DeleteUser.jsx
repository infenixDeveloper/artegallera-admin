import { useDispatch } from "react-redux";
import { fetchUsers } from "@redux/slice/userSlice";

import api from "@services/api";

import Modal from "@components/Modal/Modal";
import ModalBody from "@components/Modal/ModalBody";

const DeleteUser = ({ open, close, user }) => {
  const dispatch = useDispatch();

  const handleDelete = async () => {
    try {
      const { data } = await api.put(`/user/delete/${user.id}`);

      if (data.success) {
        dispatch(fetchUsers());
        close(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    close(false);
  };

  return (
    <>
      <Modal open={open} close={close}>
        <ModalBody>
          <div className="delete">
            <span>¿Esta seguro que desea eliminar este usuario?</span>
            <div className="dalete__buttons">
              <button className="delete__btn" onClick={handleDelete}>
                SI
              </button>
              <button className="delete__btn" onClick={handleClose}>
                NO
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default DeleteUser;
