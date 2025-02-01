import React, { useState, useRef } from "react";

const BetsTable = ({ rows }) => {
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Referencias para almacenar el último usuario/apuesta entre páginas
  const lastRedUserRef = useRef(null);
  const lastRedAmountRef = useRef(null);

  // Calcular el índice inicial y final de los elementos en la página actual
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Filtrar las filas para la página actual
  const paginatedRows = rows.slice(startIndex, endIndex);

  // Calcular el total de páginas
  const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE);

  // Manejar el cambio de página
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
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
          {paginatedRows.map((row, index) => {
            // Determinar si se debe mostrar el usuario rojo o no
            const showRedUser =
              row.idRedBet !== lastRedUserRef.current || row.redAmount !== lastRedAmountRef.current;

            if (showRedUser) {
              lastRedUserRef.current = row.idRedBet;
              lastRedAmountRef.current = row.redAmount;
            }

            return (
              <tr key={index}>
                <td>{showRedUser ? row.redUser : "-"}</td>
                <td>{showRedUser ? row.redAmount : "-"}</td>
                <td>{row.greenUser || "-"}</td>
                <td>{row.greenAmount || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span style={{ margin: "0 10px" }}>
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>
    </>
  );
};

export default BetsTable;
