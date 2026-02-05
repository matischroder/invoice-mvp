import React, { useState } from "react";

interface ChatInvoiceProps {
  onResult: (data: any) => void;
}

const ChatInvoice: React.FC<ChatInvoiceProps> = ({ onResult }) => {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async () => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setText("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (data.error) {
        setMessages((m) => [...m, { role: "assistant", content: data.error }]);
        setLoading(false);
        return;
      }

      if (data.items || data.fullName || data.to) {
        onResult(data);
        setMessages((m) => [...m, { role: "assistant", content: "Done — I populated the form. You can review and edit the fields below." }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.message || JSON.stringify(data) }]);
      }
    } catch (err: any) {
      setMessages((m) => [...m, { role: "assistant", content: err?.message || "Error contacting API" }]);
    } finally {
      setLoading(false);
    }
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
      <h3 style={{ color: "#57a3eb", marginBottom: "10px" }}>Chat to create invoice</h3>

      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          marginBottom: "10px",
          padding: "10px",
          backgroundColor: "#1e1e1e",
          borderRadius: "5px",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <strong style={{ color: msg.role === "user" ? "#00d4aa" : "#ffa500" }}>
              {msg.role === "user" ? "You:" : "Assistant:"}
            </strong>{" "}
            {msg.content}
          </div>
        ))}

        {loading && <div style={{ color: "#00d4aa" }}>Thinking...</div>}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          disabled={loading}
          style={{
            flex: 1,
            backgroundColor: "#333",
            color: "#fff",
            border: "1px solid #555",
            padding: "10px",
            borderRadius: "5px",
            fontSize: "16px",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !text.trim()}
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
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInvoice;
import React, { useState } from "react";

interface ChatInvoiceProps {
  onResult: (data: any) => void;
}

const ChatInvoice: React.FC<ChatInvoiceProps> = ({ onResult }) => {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async () => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setText("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (data.error) {
        setMessages((m) => [...m, { role: "assistant", content: data.error }]);
        setLoading(false);
        return;
      }

      if (data.items || data.fullName || data.to) {
        onResult(data);
        setMessages((m) => [...m, { role: "assistant", content: "Done — I populated the form. You can review and edit the fields below." }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.message || JSON.stringify(data) }]);
      }
    } catch (err: any) {
      setMessages((m) => [...m, { role: "assistant", content: err?.message || "Error contacting API" }]);
    } finally {
      setLoading(false);
    }
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
      <h3 style={{ color: "#00d4aa", marginBottom: "10px" }}>Chat to create invoice</h3>

      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          marginBottom: "10px",
          padding: "10px",
          backgroundColor: "#1e1e1e",
          borderRadius: "5px",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <strong style={{ color: msg.role === "user" ? "#00d4aa" : "#ffa500" }}>
              {msg.role === "user" ? "You:" : "Assistant:"}
            </strong>{" "}
            {msg.content}
          </div>
        ))}

        {loading && <div style={{ color: "#00d4aa" }}>Thinking...</div>}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          disabled={loading}
          style={{
            flex: 1,
            backgroundColor: "#333",
            color: "#fff",
            border: "1px solid #555",
            padding: "10px",
            borderRadius: "5px",
            fontSize: "16px",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !text.trim()}
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
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInvoice;
import React, { useState } from "react";

interface ChatInvoiceProps {
  onResult: (data: any) => void;
}

const ChatInvoice: React.FC<ChatInvoiceProps> = ({ onResult }) => {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async () => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setText("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setMessages([...newMessages, { role: 'assistant', content: data.error }]);
      return;
    }

    // If data has items or other fields, it's JSON response
    if (data.items || data.fullName || data.to) {
    if (data.items || data.fullName || data.to) {
      onResult(data);
      setMessages([...newMessages, { role: 'assistant', content: "Done — I populated the form. You can review and edit the fields below." }]);
    } else {
      // Text response
      setMessages([...newMessages, { role: 'assistant', content: data.message || JSON.stringify(data) }]);
    }

  return (
    <div
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
      <h3 style={{ color: "#00d4aa", marginBottom: "10px" }}>Chat to create invoice</h3>

      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          marginBottom: "10px",
          padding: "10px",
          backgroundColor: "#1e1e1e",
          borderRadius: "5px",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <strong style={{ color: msg.role === 'user' ? "#00d4aa" : "#ffa500" }}>
              {msg.role === 'user' ? 'You:' : 'Assistant:'}
            </strong>{' '}
            {msg.content}
          </div>
        ))}

        {loading && <div style={{ color: "#00d4aa" }}>Thinking...</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          style={{
            flex: 1,
            backgroundColor: "#333",
            color: "#fff",
            border: "1px solid #555",
            padding: "10px",
            borderRadius: "5px",
            fontSize: "16px",
          }}
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !text.trim()}
          style={{
            backgroundColor: "#00d4aa",
            color: "#000",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
            marginLeft: "10px",
          }}
        >
          Send
        </button>
      </div>
    </div>
