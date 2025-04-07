import React from "react";

const Users = React.lazy(() => import("@pages/Users/Users"));
const Bets = React.lazy(() => import("@pages/Bets/Bets"));
const BetsResults = React.lazy(() => import("@pages/BetsResults/BetsResults"));
const Videos = React.lazy(() => import("@pages/Videos/Videos"));
const Transactions = React.lazy(() => import("@pages/Transactions/Transaction"));

const routes = [
  {
    path: "/admin",
    name: "Resultados de Apuestas",
    element: Bets,
  },
  {
    path: "/admin/usuarios",
    name: "Usuarios",
    element: Users,
  },
  {
    path: "/admin/apuestas",
    name: "Resultados de Apuestas",
    element: BetsResults,
  },
  {
    path: "/admin/videos",
    name: "Videos",
    element: Videos,
  },
  {
    path: "/admin/transacciones",
    name: "Transactions",
    element: Transactions,
  },


];

export default routes;