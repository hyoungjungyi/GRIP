import React from "react";
import Navbar from "../components/Navbar/Navbar";

const SheetList: React.FC = () => {
  const sheets = [
    { id: 1, title: "Canon in D", description: "A classic piece by Pachelbel" },
    {
      id: 2,
      title: "Fly Me to the Moon",
      description: "Jazz standard by Bart Howard",
    },
    { id: 3, title: "Tears in Heaven", description: "By Eric Clapton" },
  ];
  return (
    <>
      <div style={{ padding: "20px" }}>
        <h1>📄 Sheet Music List</h1>
        <ul>
          {sheets.map((sheet) => (
            <li key={sheet.id} style={{ margin: "10px 0" }}>
              <strong>{sheet.title}</strong>
              <p>{sheet.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default SheetList;
