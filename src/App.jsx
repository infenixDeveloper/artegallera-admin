import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "@layout/Layout";

import "./App.css";
import ProtectedRoute from "@components/ProtectedRoute/ProtectedRoute";
import Login from "@pages/Login/Login";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
