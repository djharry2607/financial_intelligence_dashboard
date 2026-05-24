import { createContext, useContext, useState } from "react";

const AIContext = createContext();

export const AIProvider = ({ children }) => {
  const [activeInsight, setActiveInsight] = useState(null);
  const [aiFeed, setAIFeed] = useState([]);
  const [loading, setLoading] = useState(false);

  const pushInsight = (payload) => {
    setActiveInsight(payload);

    setAIFeed((prev) => [
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
        activeInsight,
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
