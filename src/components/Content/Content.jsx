import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import routes from "@services/routes";
import { useDispatch, useSelector } from "react-redux";
import { toggleMenu } from "@redux/slice/menuSlice";
import "./Content.css";

const Content = () => {
  const dispatch = useDispatch();
  const { isOpen } = useSelector((state) => state.menu);

  return (
    <>
      <Suspense fallback={<div>...Cargando</div>}>
        <button
          className="content__btn-menu"
          onClick={() => dispatch(toggleMenu())}
        >
          Menu
        </button>
        <Routes>
          {routes?.map((route, index) => {
            return (
              <Route
                key={index}
                path={route.path}
                exact={route.exact}
                name={route.name}
                element={<route.element />}
              />
            );
          })}
        </Routes>
      </Suspense>
    </>
  );
};

export default Content;
