import React, { useState, useEffect } from "react";
import ChatInvoice from "./ChatInvoiceClean";
import styles from "./InvoiceForm.module.css";
import { colors } from "../utils/colors";

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
  //usuario
  fullName: string;
  abn: string;
  yourEmail?: string;
  yourNumber?: string;
  yourAddress?: string;

  //cliente
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;

  //comunes
  invoiceNumber: string;
  date: Date;
  items: InvoiceItem[];
  notes?: string;
}

const InvoiceForm: React.FC = () => {
  const [form, setForm] = useState<FormData>({
    fullName: "",
    abn: "",
    yourEmail: "",
    yourNumber: "",
    yourAddress: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    invoiceNumber: "",
    date: new Date(),
    items: [{ type: "work", day: "", hours: "", rate: "" }],
    notes: "",
  });

  const [synced, setSynced] = useState<boolean>(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(false);

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
        fullName: form.fullName,
        abn: form.abn,
        yourEmail: form.yourEmail,
        yourNumber: form.yourNumber,
        yourAddress: form.yourAddress,
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientAddress: form.clientAddress,
        invoiceNumber: form.invoiceNumber,
      }),
    );
  }, [
    form.fullName,
    form.abn,
    form.yourEmail,
    form.yourNumber,
    form.yourAddress,
    form.clientName,
    form.clientEmail,
    form.clientAddress,
    form.invoiceNumber,
  ]);

  useEffect(() => {
    const hasEssentialData = form.fullName && form.clientName && form.date;
    setShowAdvancedFields(Boolean(hasEssentialData));
  }, [form.fullName, form.clientName, form.date]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    index?: number,
  ) => {
    if (index !== undefined) {
      const newItems = [...form.items];
      const name = e.target.name;

      if (name === "type") {
        const type = e.target.value as "work" | "purchase";

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

    if (!res.ok) {
      alert("Error generating PDF");
      return;
    }

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
      {synced && (
        <p style={{ color: colors.success }}>Synced with previous session</p>
      )}

      <ChatInvoice
        onResult={(data: any) => {
          setForm((prev) => {
            const updated = { ...prev };

            if (data.fullName) updated.fullName = data.fullName;
            else if (data.yourName && data.lastName)
              updated.fullName = `${data.yourName} ${data.lastName}`;
            else if (data.yourName) updated.fullName = data.yourName;

            if (data.clientName) updated.clientName = data.clientName;
            else if (data.company) updated.clientName = data.company;

            if (data.abn) updated.abn = data.abn;
            if (data.clientName) updated.clientName = data.clientName;
            if (data.clientEmail) updated.clientEmail = data.clientEmail;
            if (data.invoiceNumber) updated.invoiceNumber = data.invoiceNumber;
            if (data.date) updated.date = data.date;

            if (data.rate) {
              updated.items = prev.items.map((item) =>
                item.type === "work"
                  ? { ...item, rate: data.rate.toString() }
                  : item,
              );
            }

            if (data.items) {
              updated.items = data.items.map((item: any) => ({
                type: item.type || "work",
                day: item.day || "",
                hours: item.hours ? item.hours.toString() : "",
                rate: item.rate ? item.rate.toString() : "",
                description: item.description || "",
                quantity: item.quantity ? item.quantity.toString() : "",
                unitPrice: item.unitPrice ? item.unitPrice.toString() : "",
              }));
            }

            if (data.notes) updated.notes = data.notes;

            return updated;
          });
        }}
      />

      <form className={styles.form} onSubmit={handleSubmit}>
        <div style={{ display: "flex" }}>
          {/* Your Details */}

          <div
            style={{
              width: "50%",
              padding: "4px",
              alignItems: "center",
            }}
          >
            <h3 className={styles.sectionTitle}>Your Details</h3>
            <div className={styles.gridField}>
              <label className={styles.label}>Full Name</label>
              <input
                className={styles.input}
                placeholder="Your Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.gridField}>
              <label className={styles.label}>ABN</label>
              <input
                className={styles.input}
                placeholder="ABN"
                name="abn"
                value={form.abn}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.gridField}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                placeholder="Your email"
                name="yourEmail"
                value={form.yourEmail}
                onChange={handleChange}
              />
            </div>

            <div className={styles.gridField}>
              <label className={styles.label}>Phone</label>
              <input
                className={styles.input}
                placeholder="Your phone number"
                name="yourNumber"
                value={form.yourNumber}
                onChange={handleChange}
              />
            </div>

            <div className={styles.gridField}>
              <label className={styles.label}>Address</label>
              <input
                className={styles.input}
                placeholder="Your address"
                name="yourAddress"
                value={form.yourAddress}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Client Data */}
          <div style={{ width: "50%", padding: "4px", alignItems: "center" }}>
            <h3 className={styles.sectionTitle}>Client Data</h3>
            <div className={styles.gridField}>
              <label className={styles.label}>Client Name</label>
              <input
                className={styles.input}
                placeholder="Client Name"
                name="clientName"
                value={form.clientName}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.gridField}>
              <label className={styles.label}>Client Email</label>
              <input
                className={styles.input}
                placeholder="Client Email"
                name="clientEmail"
                value={form.clientEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.gridField}>
              <label className={styles.label}>Client Address</label>
              <input
                className={styles.input}
                placeholder="Client address"
                name="clientAddress"
                value={form.clientAddress}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className={styles.gridField}>
          <label className={styles.label}>Invoice Number</label>
          <input
            className={styles.input}
            placeholder="Invoice #"
            name="invoiceNumber"
            value={form.invoiceNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.gridField}>
          <label className={styles.label}>Date</label>
          <input
            className={styles.input}
            type="date"
            name="date"
            value={form.date.toISOString().split("T")[0]}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginTop: "16px" }}>
          <button
            type="button"
            style={{
              backgroundColor: colors.primary,
              color: colors.textDark,
              border: "none",
              padding: "10px 16px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              width: "100%",
            }}
            onClick={() => setShowNotes((s) => !s)}
          >
            {showNotes ? "▼ Hide Notes" : "▶ Add Notes to Invoice"}
          </button>

          {showNotes && (
            <div style={{ marginTop: "12px" }}>
              <textarea
                style={{
                  backgroundColor: colors.bgInput,
                  color: colors.textPrimary,
                  border: `2px solid ${colors.primary}`,
                  padding: "12px",
                  borderRadius: "5px",
                  fontSize: "14px",
                  width: "100%",
                  height: "120px",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
                placeholder="Add notes that will appear in the invoice..."
                name="notes"
                value={form.notes || ""}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        {showAdvancedFields && (
          <>
            <h3 className={styles.sectionTitle}>Items</h3>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th
                    style={{
                      border: `1px solid ${colors.border}`,
                      padding: "10px",
                      backgroundColor: colors.bgRow,
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      border: `1px solid ${colors.border}`,
                      padding: "10px",
                      backgroundColor: colors.bgRow,
                    }}
                  >
                    Description/Day
                  </th>
                  <th
                    style={{
                      border: `1px solid ${colors.border}`,
                      padding: "10px",
                      backgroundColor: colors.bgRow,
                    }}
                  >
                    Hours/Quantity
                  </th>
                  <th
                    style={{
                      border: `1px solid ${colors.border}`,
                      padding: "10px",
                      backgroundColor: colors.bgRow,
                    }}
                  >
                    Rate/Unit Price
                  </th>
                  <th
                    style={{
                      border: `1px solid ${colors.border}`,
                      padding: "10px",
                      backgroundColor: colors.bgRow,
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {form.items.map((item, i) => (
                  <tr key={i}>
                    <td
                      style={{
                        border: `1px solid ${colors.border}`,
                        padding: "5px",
                      }}
                    >
                      <select
                        style={{
                          backgroundColor: colors.bgInput,
                          color: colors.textPrimary,
                          border: `1px solid ${colors.border}`,
                          padding: "10px",
                          margin: 0,
                          borderRadius: "5px",
                          width: "100%",
                          fontSize: "16px",
                        }}
                        name="type"
                        value={item.type}
                        onChange={(e) => handleChange(e, i)}
                      >
                        <option value="work">Work</option>
                        <option value="purchase">Purchase</option>
                      </select>
                    </td>

                    <td
                      style={{
                        border: `1px solid ${colors.border}`,
                        padding: "5px",
                      }}
                    >
                      <input
                        style={{
                          backgroundColor: colors.bgInput,
                          color: colors.textPrimary,
                          border: `1px solid ${colors.border}`,
                          padding: "10px",
                          margin: 0,
                          borderRadius: "5px",
                          width: "100%",
                          fontSize: "16px",
                        }}
                        placeholder={
                          item.type === "work" ? "Day" : "Description"
                        }
                        name={item.type === "work" ? "day" : "description"}
                        value={
                          item.type === "work" ? item.day : item.description
                        }
                        onChange={(e) => handleChange(e, i)}
                        required
                      />
                    </td>

                    <td
                      style={{
                        border: `1px solid ${colors.border}`,
                        padding: "5px",
                      }}
                    >
                      <input
                        style={{
                          backgroundColor: colors.bgInput,
                          color: colors.textPrimary,
                          border: `1px solid ${colors.border}`,
                          padding: "10px",
                          margin: 0,
                          borderRadius: "5px",
                          width: "100%",
                          fontSize: "16px",
                        }}
                        placeholder={
                          item.type === "work" ? "Hours" : "Quantity"
                        }
                        name={item.type === "work" ? "hours" : "quantity"}
                        value={
                          item.type === "work" ? item.hours : item.quantity
                        }
                        onChange={(e) => handleChange(e, i)}
                        required
                      />
                    </td>

                    <td
                      style={{
                        border: `1px solid ${colors.border}`,
                        padding: "5px",
                      }}
                    >
                      <input
                        style={{
                          backgroundColor: colors.bgInput,
                          color: colors.textPrimary,
                          border: `1px solid ${colors.border}`,
                          padding: "10px",
                          margin: 0,
                          borderRadius: "5px",
                          width: "100%",
                          fontSize: "16px",
                        }}
                        placeholder={
                          item.type === "work" ? "Rate" : "Unit Price"
                        }
                        name={item.type === "work" ? "rate" : "unitPrice"}
                        value={
                          item.type === "work" ? item.rate : item.unitPrice
                        }
                        onChange={(e) => handleChange(e, i)}
                        required
                      />
                    </td>

                    <td
                      style={{
                        border: `1px solid ${colors.border}`,
                        padding: "5px",
                        textAlign: "center",
                      }}
                    >
                      <button
                        type="button"
                        style={{
                          backgroundColor: colors.error,
                          color: colors.textPrimary,
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

            <button
              type="button"
              style={{
                backgroundColor: colors.primary,
                color: colors.textDark,
                border: "none",
                padding: "10px 20px",
                margin: "10px 5px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
              }}
              onClick={addItem}
            >
              Add Row
            </button>
          </>
        )}

        {/* Invoice Preview */}
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            backgroundColor: colors.bgSurface,
            border: `1px solid ${colors.border}`,
            borderRadius: "5px",
            color: colors.textPrimary,
          }}
        >
          <h2 style={{ color: colors.primary }}>Invoice Preview</h2>

          <p>
            <strong>Invoice Number:</strong> {form.invoiceNumber}
          </p>
          <p>
            <strong>Date:</strong> {form.date.toISOString().split("T")[0]}
          </p>
          <p>
            <strong>From:</strong> {form.fullName}
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

          <h3 style={{ color: colors.primary }}>Items</h3>

          {(() => {
            const workItems = form.items.filter((item) => item.type === "work");
            const purchaseItems = form.items.filter(
              (item) => item.type === "purchase",
            );

            return (
              <>
                {workItems.length > 0 && (
                  <>
                    <h4 style={{ color: colors.primary }}>Work Hours</h4>

                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        backgroundColor: colors.bgInput,
                        color: colors.textPrimary,
                        marginBottom: "20px",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              border: `1px solid ${colors.border}`,
                              padding: "5px",
                              backgroundColor: colors.bgRow,
                            }}
                          >
                            Day
                          </th>
                          <th
                            style={{
                              border: `1px solid ${colors.border}`,
                              padding: "5px",
                              backgroundColor: colors.bgRow,
                            }}
                          >
                            Hours
                          </th>
                          <th
                            style={{
                              border: `1px solid ${colors.border}`,
                              padding: "5px",
                              backgroundColor: colors.bgRow,
                            }}
                          >
                            Rate
                          </th>
                          <th
                            style={{
                              border: `1px solid ${colors.border}`,
                              padding: "5px",
                              backgroundColor: colors.bgRow,
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
                              style={{
                                border: `1px solid ${colors.border}`,
                                padding: "5px",
                              }}
                            >
                              {item.day}
                            </td>
                            <td
                              style={{
                                border: `1px solid ${colors.border}`,
                                padding: "5px",
                              }}
                            >
                              {item.hours}
                            </td>
                            <td
                              style={{
                                border: `1px solid ${colors.border}`,
                                padding: "5px",
                              }}
                            >
                              ${item.rate}
                            </td>
                            <td
                              style={{
                                border: `1px solid ${colors.border}`,
                                padding: "5px",
                              }}
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
                    <h4 style={{ color: colors.primary }}>Purchases</h4>

                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        backgroundColor: colors.bgInput,
                        color: colors.textPrimary,
                        marginBottom: "20px",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              border: `1px solid ${colors.border}`,
                              padding: "5px",
                              backgroundColor: colors.bgRow,
                            }}
                          >
                            Description
                          </th>
                          <th
                            style={{
                              border: `1px solid ${colors.border}`,
                              padding: "5px",
                              backgroundColor: colors.bgRow,
                            }}
                          >
                            Quantity
                          </th>
                          <th
                            style={{
                              border: `1px solid ${colors.border}`,
                              padding: "5px",
                              backgroundColor: colors.bgRow,
                            }}
                          >
                            Unit Price
                          </th>
                          <th
                            style={{
                              border: `1px solid ${colors.border}`,
                              padding: "5px",
                              backgroundColor: colors.bgRow,
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
                              style={{
                                border: `1px solid ${colors.border}`,
                                padding: "5px",
                              }}
                            >
                              {item.description}
                            </td>
                            <td
                              style={{
                                border: `1px solid ${colors.border}`,
                                padding: "5px",
                              }}
                            >
                              {item.quantity}
                            </td>
                            <td
                              style={{
                                border: `1px solid ${colors.border}`,
                                padding: "5px",
                              }}
                            >
                              ${item.unitPrice}
                            </td>
                            <td
                              style={{
                                border: `1px solid ${colors.border}`,
                                padding: "5px",
                              }}
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

          <p
            style={{
              marginTop: "10px",
              fontSize: "18px",
              color: colors.primary,
            }}
          >
            <strong>
              Total: $
              {form.items
                .reduce((sum, item) => {
                  if (item.type === "work") {
                    return (
                      sum +
                      parseFloat(item.hours || "0") *
                        parseFloat(item.rate || "0")
                    );
                  }

                  return (
                    sum +
                    parseFloat(item.quantity || "0") *
                      parseFloat(item.unitPrice || "0")
                  );
                }, 0)
                .toFixed(2)}
            </strong>
          </p>

          {form.notes && (
            <div
              style={{
                marginTop: "20px",
                borderTop: `2px solid ${colors.border}`,
                paddingTop: "12px",
              }}
            >
              <h4 style={{ color: colors.primary, marginBottom: "8px" }}>
                Notes
              </h4>
              <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{form.notes}</p>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          style={{
            backgroundColor: colors.success,
            color: colors.textDark,
            border: "none",
            padding: "12px 20px",
            marginTop: "20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            width: "100%",
          }}
        >
          Generate PDF
        </button>
      </form>
    </>
  );
};

export default InvoiceForm;
