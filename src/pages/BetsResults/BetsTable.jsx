import React, { useState } from "react";

const BetsTable = ({ rows }) => {
  const ITEMS_PER_PAGE = 10;

  // Dividir las filas en rojo y verde
  const redRows = rows.filter((row) => row.team === "ROJO");
  const greenRows = rows.filter((row) => row.team === "VERDE");

  // Combinar las filas de ROJO y VERDE, asegurando que todas se muestren
  const maxLength = Math.max(redRows.length, greenRows.length);

  // Generar filas combinadas asegurando que no falten datos
  const combinedRows = Array.from({ length: maxLength }, (_, index) => ({
    red: redRows[index] || {}, // Si no hay más apuestas rojas, se usa un objeto vacío
    green: greenRows[index] || {}, // Si no hay más apuestas verdes, se usa un objeto vacío
  }));

  // Controlar la paginación
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular el índice inicial y final de los elementos en la página actual
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Filtrar las filas combinadas para la página actual
  const paginatedRows = combinedRows.slice(startIndex, endIndex);

  // Calcular el total de páginas
  const totalPages = Math.ceil(combinedRows.length / ITEMS_PER_PAGE);

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
          {paginatedRows.map((row, index) => (
            <tr className="" key={index}>
              <td>{row.red.user || "-"}</td>
              <td>{row.red.amount || "-"}</td>
              <td>{row.green.user || "-"}</td>
              <td>{row.green.amount || "-"}</td>
              <td>{row.red.winner || row.green.winner || ""}</td>
            </tr>
          ))}
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
