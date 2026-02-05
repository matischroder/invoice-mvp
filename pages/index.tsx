import React from "react";
import InvoiceForm from "../components/InvoiceForm";
import Link from "next/link";
import styles from "./index.module.css";

const Home: React.FC = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentBox}>
        <h1 className={styles.mainTitle}>Invoice Generator (Australia)</h1>
        <Link href="/old-invoices" className={styles.navLink}>
          View Old Invoices
        </Link>
        <InvoiceForm />
      </div>
    </div>
  );
};

export default Home;
