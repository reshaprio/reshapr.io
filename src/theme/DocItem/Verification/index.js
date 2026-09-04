import React, {createContext, useContext} from 'react';

import styles from './styles.module.css';

const DocVerificationContext = createContext(null);

export function DocVerificationProvider({value, children}) {
  return (
    <DocVerificationContext.Provider value={value ?? null}>
      {children}
    </DocVerificationContext.Provider>
  );
}

export function useDocVerification() {
  return useContext(DocVerificationContext);
}

function normalizeDate(date) {
  const parsedDate = date instanceof Date ? date : new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsedDate.getTime())) {
    return {
      dateTime: String(date),
      label: String(date),
    };
  }

  return {
    dateTime: parsedDate.toISOString().slice(0, 10),
    label: new Intl.DateTimeFormat('en-US', {
      dateStyle: 'long',
      timeZone: 'UTC',
    }).format(parsedDate),
  };
}

export default function DocVerification({verification}) {
  const {product, version, date} = verification;
  const normalizedDate = normalizeDate(date);

  return (
    <aside
      className={`${styles.meta} docs-verification-meta`}
      aria-label="Documentation verification">
      <strong>Verified</strong>
      <span>
        {product} <code>{version}</code>
      </span>
      <time dateTime={normalizedDate.dateTime}>{normalizedDate.label}</time>
    </aside>
  );
}