import React, { useEffect, useState } from "react";
import "./Dropdown.css";
import { Menu } from "@mui/material";

const Dropdown = ({ open, anchorEl, id, children, onClose, ...rest }) => {
  return (
    <Menu
      id={id}
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      sx={{
        "& .MuiPaper-root": {
          background:
            "linear-gradient(180.26deg, #bdbd02 -43.16%, #1c1502 99.77%)",
          color: "#fff",
        },
      }}
    >
      {children}
    </Menu>
  );
};

export default Dropdown;
