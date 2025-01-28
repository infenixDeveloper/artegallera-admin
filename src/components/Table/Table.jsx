import React from "react";
import "./Table.css";
import SearchIcon from "@assets/icons/SearchIcon";
import { useState } from "react";
import AppButton from "@components/Button/Button";
import KeyboardArrowLeftOutlinedIcon from "@mui/icons-material/KeyboardArrowLeftOutlined";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";

const Table = ({ columns, rows, AddButton, searcheable }) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const data = rows?.filter((r) =>
    Object.values(r).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentRows = data.slice(indexOfFirstEntry, indexOfLastEntry);

  const totalPages = Math.ceil(data?.length / entriesPerPage);

  const paginate = (pageNumber) => {
    setTimeout(() => {
      window.scroll(0, 0);
    }, 0);
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <div className="table__container">
        {searcheable && (
          <div className="table__nav">
            {AddButton}
            <div className="table__search">
              <input
                type="text"
                className="table__search--input"
                onChange={(e) => setSearch(e.target.value)}
              />
              <button>
                <SearchIcon className="table__search--icon" />
              </button>
            </div>
          </div>
        )}
        <div className="table__content">
          <table className="table">
            <thead className="table__header">
              <tr className="table__row">
                {columns.map((column) => (
                  <th
                    key={column.field}
                    className="table__cell table__cell--header"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRows?.map((row, rowIndex) => (
                <tr key={rowIndex} className="table__row">
                  {columns.map((column) => (
                    <td
                      key={column.field}
                      className="table__cell table__cell--rows"
                    >
                      {column.cell ? column.cell(row) : row[column.field]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
      </div>
    </>
  );
};

export default Table;
