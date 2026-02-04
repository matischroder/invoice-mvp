import React, { useState, useEffect } from "react";
import ChatInvoice from "./ChatInvoice";

interface InvoiceItem {
  type: "work" | "purchase";
  // Para work
  day?: string;
  hours?: string;
  rate?: string;
  // Para purchase
  description?: string;
  quantity?: string;
  unitPrice?: string;
}

interface FormData {
  yourName: string;
  abn: string;
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  date: string;
  items: InvoiceItem[];
}

const InvoiceForm: React.FC = () => {
  const inputStyle: React.CSSProperties = {
    backgroundColor: "#333",
    color: "#fff",
    border: "1px solid #555",
    padding: "10px",
    margin: "5px 0",
    borderRadius: "5px",
    width: "100%",
    fontSize: "16px",
  };
  const buttonStyle: React.CSSProperties = {
    backgroundColor: "#00d4aa",
    color: "#000",
    border: "none",
    padding: "10px 20px",
    margin: "10px 5px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  };
  const labelStyle: React.CSSProperties = {
    color: "#00d4aa",
    fontWeight: "bold",
    marginTop: "15px",
  };
  const [form, setForm] = useState<FormData>({
    yourName: "",
    abn: "",
    clientName: "",
    clientEmail: "",
    invoiceNumber: "1",
    date: new Date().toISOString().slice(0, 10),
    items: [{ type: "work", day: "", hours: "", rate: "" }],
  });
  const [synced, setSynced] = useState<boolean>(false);

  useEffect(() => {
    const savedData = localStorage.getItem("invoiceData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setForm((prev) => ({ ...prev, ...parsed }));
      setSynced(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "invoiceData",
      JSON.stringify({
        yourName: form.yourName,
        abn: form.abn,
        clientName: form.clientName,
        clientEmail: form.clientEmail,
      }),
    );
  }, [form.yourName, form.abn, form.clientName, form.clientEmail]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number,
  ) => {
    if (index !== undefined) {
      const newItems = [...form.items];
      const name = e.target.name;
      if (name === "type") {
        const type = e.target.value as "work" | "purchase";
        newItems[index].type = type;
        // Reset fields based on type
        if (type === "work") {
          newItems[index] = { type: "work", day: "", hours: "", rate: "" };
        } else {
          newItems[index] = {
            type: "purchase",
            description: "",
            quantity: "",
            unitPrice: "",
          };
        }
      } else {
        (newItems[index] as any)[name] = e.target.value;
      }
      setForm({ ...form, items: newItems });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { type: "work", day: "", hours: "", rate: "" }],
    });
  };

  const removeItem = (index: number) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${form.invoiceNumber}.pdf`;
    a.click();

    // Save to history
    const history = JSON.parse(localStorage.getItem("invoiceHistory") || "[]");
    history.push({ ...form, generatedAt: new Date().toISOString() });
    localStorage.setItem("invoiceHistory", JSON.stringify(history));

    // Increment invoice number
    setForm((prev) => ({
      ...prev,
      invoiceNumber: (parseInt(prev.invoiceNumber) + 1).toString(),
    }));
  };

  return (
    <>
      <ChatInvoice
        onResult={(data) =>
          setForm((prev) => ({
            ...prev,
            items: data.items.map((item) => ({
              day: item.day,
              hours: item.hours.toString(),
              rate: item.rate.toString(),
              description: item.description,
            })),
          }))
        }
      />
      {synced && (
        <p style={{ color: "green" }}>Sincronizado con sesión anterior</p>
      )}

      <form onSubmit={handleSubmit}>...</form>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: "10px",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <label style={labelStyle}>Your Name</label>
          <input
            style={inputStyle}
            placeholder="Your Name"
            name="yourName"
            value={form.yourName}
            onChange={handleChange}
            required
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: "10px",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <label style={labelStyle}>ABN</label>
          <input
            style={inputStyle}
            placeholder="ABN"
            name="abn"
            value={form.abn}
            onChange={handleChange}
            required
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: "10px",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <label style={labelStyle}>Client Name</label>
          <input
            style={inputStyle}
            placeholder="Client Name"
            name="clientName"
            value={form.clientName}
            onChange={handleChange}
            required
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: "10px",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <label style={labelStyle}>Client Email</label>
          <input
            style={inputStyle}
            placeholder="Client Email"
            name="clientEmail"
            value={form.clientEmail}
            onChange={handleChange}
            required
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: "10px",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <label style={labelStyle}>Invoice Number</label>
          <input
            style={inputStyle}
            placeholder="Invoice #"
            name="invoiceNumber"
            value={form.invoiceNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: "10px",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <label style={labelStyle}>Date</label>
          <input
            style={inputStyle}
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>
        <h3 style={{ color: "#00d4aa", marginTop: "20px" }}>Items</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#2a2a2a",
            color: "#fff",
            marginBottom: "10px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #555",
                  padding: "10px",
                  backgroundColor: "#444",
                }}
              >
                Type
              </th>
              <th
                style={{
                  border: "1px solid #555",
                  padding: "10px",
                  backgroundColor: "#444",
                }}
              >
                Description/Day
              </th>
              <th
                style={{
                  border: "1px solid #555",
                  padding: "10px",
                  backgroundColor: "#444",
                }}
              >
                Hours/Quantity
              </th>
              <th
                style={{
                  border: "1px solid #555",
                  padding: "10px",
                  backgroundColor: "#444",
                }}
              >
                Rate/Unit Price
              </th>
              <th
                style={{
                  border: "1px solid #555",
                  padding: "10px",
                  backgroundColor: "#444",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {form.items.map((item, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid #555", padding: "5px" }}>
                  <select
                    style={{ ...inputStyle, margin: 0, width: "100%" }}
                    name="type"
                    value={item.type}
                    onChange={(e) => handleChange(e, i)}
                  >
                    <option value="work">Work</option>
                    <option value="purchase">Purchase</option>
                  </select>
                </td>
                <td style={{ border: "1px solid #555", padding: "5px" }}>
                  <input
                    style={{ ...inputStyle, margin: 0, width: "100%" }}
                    placeholder={item.type === "work" ? "Day" : "Description"}
                    name={item.type === "work" ? "day" : "description"}
                    value={item.type === "work" ? item.day : item.description}
                    onChange={(e) => handleChange(e, i)}
                    required
                  />
                </td>
                <td style={{ border: "1px solid #555", padding: "5px" }}>
                  <input
                    style={{ ...inputStyle, margin: 0, width: "100%" }}
                    placeholder={item.type === "work" ? "Hours" : "Quantity"}
                    name={item.type === "work" ? "hours" : "quantity"}
                    value={item.type === "work" ? item.hours : item.quantity}
                    onChange={(e) => handleChange(e, i)}
                    required
                  />
                </td>
                <td style={{ border: "1px solid #555", padding: "5px" }}>
                  <input
                    style={{ ...inputStyle, margin: 0, width: "100%" }}
                    placeholder={item.type === "work" ? "Rate" : "Unit Price"}
                    name={item.type === "work" ? "rate" : "unitPrice"}
                    value={item.type === "work" ? item.rate : item.unitPrice}
                    onChange={(e) => handleChange(e, i)}
                    required
                  />
                </td>
                <td
                  style={{
                    border: "1px solid #555",
                    padding: "5px",
                    textAlign: "center",
                  }}
                >
                  <button
                    type="button"
                    style={{
                      backgroundColor: "#ff4444",
                      color: "#fff",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "3px",
                      cursor: "pointer",
                    }}
                    onClick={() => removeItem(i)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" style={buttonStyle} onClick={addItem}>
          Add Row
        </button>
      </form>

      {/* Invoice Preview */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          backgroundColor: "#2a2a2a",
          border: "1px solid #555",
          borderRadius: "5px",
          color: "#fff",
        }}
      >
        <h2 style={{ color: "#00d4aa" }}>Invoice Preview</h2>
        <p>
          <strong>Invoice Number:</strong> {form.invoiceNumber}
        </p>
        <p>
          <strong>Date:</strong> {form.date}
        </p>
        <p>
          <strong>From:</strong> {form.yourName}
        </p>
        <p>
          <strong>ABN:</strong> {form.abn}
        </p>
        <p>
          <strong>To:</strong> {form.clientName}
        </p>
        <p>
          <strong>Email:</strong> {form.clientEmail}
        </p>
        <h3 style={{ color: "#00d4aa" }}>Items</h3>
        {(() => {
          const workItems = form.items.filter((item) => item.type === "work");
          const purchaseItems = form.items.filter(
            (item) => item.type === "purchase",
          );
          return (
            <>
              {workItems.length > 0 && (
                <>
                  <h4 style={{ color: "#00d4aa" }}>Work Hours</h4>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      backgroundColor: "#333",
                      color: "#fff",
                      marginBottom: "20px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            border: "1px solid #555",
                            padding: "5px",
                            backgroundColor: "#444",
                          }}
                        >
                          Day
                        </th>
                        <th
                          style={{
                            border: "1px solid #555",
                            padding: "5px",
                            backgroundColor: "#444",
                          }}
                        >
                          Hours
                        </th>
                        <th
                          style={{
                            border: "1px solid #555",
                            padding: "5px",
                            backgroundColor: "#444",
                          }}
                        >
                          Rate
                        </th>
                        <th
                          style={{
                            border: "1px solid #555",
                            padding: "5px",
                            backgroundColor: "#444",
                          }}
                        >
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {workItems.map((item, i) => (
                        <tr key={i}>
                          <td
                            style={{ border: "1px solid #555", padding: "5px" }}
                          >
                            {item.day}
                          </td>
                          <td
                            style={{ border: "1px solid #555", padding: "5px" }}
                          >
                            {item.hours}
                          </td>
                          <td
                            style={{ border: "1px solid #555", padding: "5px" }}
                          >
                            ${item.rate}
                          </td>
                          <td
                            style={{ border: "1px solid #555", padding: "5px" }}
                          >
                            $
                            {(
                              parseFloat(item.hours || "0") *
                              parseFloat(item.rate || "0")
                            ).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
              {purchaseItems.length > 0 && (
                <>
                  <h4 style={{ color: "#00d4aa" }}>Purchases</h4>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      backgroundColor: "#333",
                      color: "#fff",
                      marginBottom: "20px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            border: "1px solid #555",
                            padding: "5px",
                            backgroundColor: "#444",
                          }}
                        >
                          Description
                        </th>
                        <th
                          style={{
                            border: "1px solid #555",
                            padding: "5px",
                            backgroundColor: "#444",
                          }}
                        >
                          Quantity
                        </th>
                        <th
                          style={{
                            border: "1px solid #555",
                            padding: "5px",
                            backgroundColor: "#444",
                          }}
                        >
                          Unit Price
                        </th>
                        <th
                          style={{
                            border: "1px solid #555",
                            padding: "5px",
                            backgroundColor: "#444",
                          }}
                        >
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseItems.map((item, i) => (
                        <tr key={i}>
                          <td
                            style={{ border: "1px solid #555", padding: "5px" }}
                          >
                            {item.description}
                          </td>
                          <td
                            style={{ border: "1px solid #555", padding: "5px" }}
                          >
                            {item.quantity}
                          </td>
                          <td
                            style={{ border: "1px solid #555", padding: "5px" }}
                          >
                            ${item.unitPrice}
                          </td>
                          <td
                            style={{ border: "1px solid #555", padding: "5px" }}
                          >
                            $
                            {(
                              parseFloat(item.quantity || "0") *
                              parseFloat(item.unitPrice || "0")
                            ).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          );
        })()}
        <p style={{ marginTop: "10px", fontSize: "18px", color: "#00d4aa" }}>
          <strong>
            Total: $
            {form.items
              .reduce((sum, item) => {
                if (item.type === "work") {
                  return (
                    sum +
                    parseFloat(item.hours || "0") * parseFloat(item.rate || "0")
                  );
                } else {
                  return (
                    sum +
                    parseFloat(item.quantity || "0") *
                      parseFloat(item.unitPrice || "0")
                  );
                }
              }, 0)
              .toFixed(2)}
          </strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <button type="submit" style={buttonStyle}>
          Generate PDF
        </button>
      </form>
    </>
  );
};

export default InvoiceForm;
