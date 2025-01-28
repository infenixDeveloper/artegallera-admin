import CreateBet from "./components/CreateBet";

import "./Bets.css";
import { useEffect } from "react";
import DynamicTabs from "./components/TabTanel/TabPanel";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { getAllRounds } from "@redux/slice/roundsSlice";

const Bets = () => {
  const dispatch = useDispatch();
  const round = useSelector((state) => state.rounds.round);

  useEffect(() => {
    dispatch(getAllRounds());
  }, [dispatch]);
  return (
    <>
      <div className="bets">
        <div className="bets__container">
          <CreateBet />
          <div className="bets__btn-panel">
            <DynamicTabs idEvent={round?.id_event} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Bets;
