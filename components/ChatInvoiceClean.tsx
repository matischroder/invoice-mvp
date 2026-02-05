import React, { useState } from "react";
import styles from "./ChatInvoiceClean.module.css";

interface ChatInvoiceProps {
  onResult: (data: any) => void;
}

const ChatInvoice: React.FC<ChatInvoiceProps> = ({ onResult }) => {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
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
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              "Done — I populated the form. You can review and edit the fields below.",
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.message || JSON.stringify(data) },
        ]);
      }
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: err?.message || "Error contacting API" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Chat to create invoice</h3>

      <div className={styles.messagesContainer}>
        {messages.map((msg, i) => (
          <div key={i} className={styles.messageItem}>
            <strong
              className={
                msg.role === "user"
                  ? styles.messageUser
                  : styles.messageAssistant
              }
            >
              {msg.role === "user" ? "You:" : "Assistant:"}
            </strong>{" "}
            {msg.content}
          </div>
        ))}

        {loading && <div className={styles.loadingText}>Thinking...</div>}
      </div>

      <div className={styles.inputWrapper}>
        <input
          type="text"
          className={styles.input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !text.trim()}
          className={styles.button}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInvoice;
