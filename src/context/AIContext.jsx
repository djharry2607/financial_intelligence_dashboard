import { createContext, useContext, useState } from "react";

const AIContext = createContext();

export const AIProvider = ({ children }) => {
  const [aiFeed, setAiFeed] = useState([]);
  const [loading, setLoading] = useState(false);

  const pushInsight = (payload) => {
    setAiFeed((prev) => [
      {
        id: Date.now(),
        timestamp: new Date(),
        ...payload,
      },
      ...prev,
    ]);
  };

  return (
    <AIContext.Provider
      value={{
        aiFeed,
        loading,
        setLoading,
        pushInsight,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAIContext = () => useContext(AIContext);
