import React from "react";
import { useSelector } from "react-redux";
import Users from "@pages/Users/Users";
import Sidebar from "@components/Sidebar/Sidebar";
import Chat from "@components/Chat/Chat";

import "./Layout.css";
import Content from "@components/Content/Content";

const Layout = () => {
  const isOpen = useSelector((state) => state.menu.isOpen);

  return (
    <>
      <div className={`layout__container ${isOpen ? "open" : "close"}`}>
        <Sidebar />
        <div className="layout__content">
          <Content />
        </div>
      </div>
      <Chat />
    </>
  );
};

export default Layout;
