import React from "react";
import InvoiceForm from "../components/InvoiceForm";
import Link from "next/link";

const Home: React.FC = () => {
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
            fontSize: "2.5em",
          }}
        >
          Invoice Generator (Australia)
        </h1>
        <Link
          href="/old-invoices"
          style={{
            display: "block",
            textAlign: "center",
            color: "#00d4aa",
            textDecoration: "none",
            marginBottom: "20px",
            fontSize: "1.2em",
          }}
        >
          View Old Invoices
        </Link>
        <InvoiceForm />
      </div>
    </div>
  );
};

export default Home;
