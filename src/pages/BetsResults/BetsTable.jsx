import AppButton from "@components/Button/Button";
import React, { useState, useEffect } from "react";
import KeyboardArrowLeftOutlinedIcon from "@mui/icons-material/KeyboardArrowLeftOutlined";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";

const BetsTable = ({ rows }) => {
  console.log(rows,"este");
  
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // **Reiniciar la página cuando cambian las filas**
  useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

  // Calcular el índice inicial y final de los elementos en la página actual
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Filtrar las filas para la página actual
  const paginatedRows = rows.slice(startIndex, endIndex);

  // Calcular el total de páginas
  const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE);

  // Manejar el cambio de página
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <table className="bets-table">
        <thead>
          <tr className="bets-table__header">
            <th>USUARIO (ROJO)</th>
            <th>APUESTA</th>
            <th>USUARIO (VERDE)</th>
            <th>APUESTA</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            let lastRedUser = null;
            console.log(paginatedRows);

            return paginatedRows.map((row, index) => {
              // console.log({row});

              // Determinar si se debe mostrar el usuario rojo o no
              const showRedUser = row.idRedBet !== lastRedUser;
              if (showRedUser) {
                lastRedUser = row.idRedBet;
              }

              // Condicionar el renderizado de las celdas según el equipo
              return (
                <tr key={index}>
                  {row.team1 === "red" ? (
                    <>
                      <td>{showRedUser ? row.redUser : "-"}</td>
                      <td>{showRedUser ? row.redAmount : "-"}</td>
                      <td>{row.greenUser || "-"}</td>
                      <td>{row.greenAmount || "-"}</td>
                    </>
                  ) : (
                    <>
                      <td>{row.greenUser || "-"}</td>
                      <td>{row.greenAmount || "-"}</td>
                      <td>{showRedUser ? row.redUser : "-"}</td>
                      <td>{showRedUser ? row.redAmount : "-"}</td>
                    </>
                  )}
                </tr>
              );
            });
          })()}
        </tbody>
      </table>
      <div className="pagination__container">
        <AppButton
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <KeyboardArrowLeftOutlinedIcon sx={{ color: "white" }} />
        </AppButton>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={`pagination__btn ${
              currentPage === index + 1 ? "active" : ""
            }`}
            onClick={() => paginate(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <AppButton
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <KeyboardArrowRightOutlinedIcon sx={{ color: "white" }} />
        </AppButton>
      </div>
    </>
  );
};

export default BetsTable;
