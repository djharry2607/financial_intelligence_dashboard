import { useAIContext } from "../context/AIContext";

export default function useAI() {
  const {
    activeInsight,
    aiFeed,
    loading,
    setLoading,
    pushInsight,
  } = useAIContext();

  const sendToAI = async (payload) => {
    setLoading(true);

    try {
      pushInsight(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    activeInsight,
    aiFeed,
    loading,
    sendToAI,
  };
}
