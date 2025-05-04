// frontend/src/context/AdminUpdateContext.js
import React, { createContext, useState } from 'react';

export const AdminUpdateContext = createContext();

export const AdminUpdateProvider = ({ children }) => {
  const [updateCounter, setUpdateCounter] = useState(0);

  const triggerUpdate = () => {
    setUpdateCounter(prev => prev + 1);
  };

  return (
    <AdminUpdateContext.Provider value={{ updateCounter, triggerUpdate }}>
      {children}
    </AdminUpdateContext.Provider>
  );
};
