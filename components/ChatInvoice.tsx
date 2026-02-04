import React, { useState } from "react";

interface InvoiceItem {
  day: string;
  hours: number;
  rate: number;
  description: string;
}

interface ChatInvoiceProps {
  onResult: (data: { items: InvoiceItem[] }) => void;
}

const ChatInvoice: React.FC<ChatInvoiceProps> = ({ onResult }) => {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setError("Missing info. Please include hours and rate.");
      return;
    }

    onResult(data);
  };

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "20px",
        backgroundColor: "#2a2a2a",
        border: "1px solid #555",
        borderRadius: "5px",
        color: "#fff",
      }}
    >
      <h3 style={{ color: "#00d4aa", marginBottom: "10px" }}>
        Create invoice by chat
      </h3>
      <textarea
        rows="4"
        style={{
          width: "100%",
          backgroundColor: "#333",
          color: "#fff",
          border: "1px solid #555",
          padding: "10px",
          borderRadius: "5px",
          fontSize: "16px",
          marginBottom: "10px",
        }}
        placeholder="e.g. Lun 7.5, Mar 4.5, Jue 4.5, Vie 7.5 a 35 la hora"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          backgroundColor: "#00d4aa",
          color: "#000",
          border: "none",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        {loading ? "Generating..." : "Generate"}
      </button>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
};

export default ChatInvoice;
