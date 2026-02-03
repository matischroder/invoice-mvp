import { useState, useEffect } from "react";
import Link from "next/link";

export default function OldInvoices() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("invoiceHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const filtered = history.filter(
    (invoice) =>
      invoice.clientName.toLowerCase().includes(search.toLowerCase()) ||
      invoice.invoiceNumber.includes(search),
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        backgroundColor: "#121212",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "#1e1e1e",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#00d4aa",
            marginBottom: "20px",
          }}
        >
          Old Invoices
        </h1>
        <Link
          href="/"
          style={{
            display: "block",
            textAlign: "center",
            color: "#00d4aa",
            textDecoration: "none",
            marginBottom: "20px",
            fontSize: "1.2em",
          }}
        >
          Back to Chat
        </Link>
        <input
          type="text"
          placeholder="Search by client or invoice number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#333",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "5px",
            fontSize: "16px",
            marginBottom: "20px",
          }}
        />
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filtered.map((invoice, index) => (
            <li
              key={index}
              style={{
                backgroundColor: "#2a2a2a",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "5px",
                border: "1px solid #555",
              }}
            >
              <strong style={{ color: "#00d4aa" }}>
                Invoice #{invoice.invoiceNumber}
              </strong>{" "}
              - {invoice.clientName} - {invoice.date}
              <button
                style={{
                  marginLeft: "10px",
                  backgroundColor: "#00d4aa",
                  color: "#000",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  alert("View/regenerate functionality coming soon");
                }}
              >
                View
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
