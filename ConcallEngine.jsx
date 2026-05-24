import { useState } from "react";
import useAI from "../../hooks/useAI";

export default function ConcallEngine() {
  const [transcript, setTranscript] = useState("");
  const { sendToAI } = useAI();

  const processTranscript = async () => {
    const extracted = {
      type: "concall",
      managementConfidence: 79,
      revenueTrend: "Improving",
      marginTrend: "Stable",
      guidance: [
        "FY27 growth above industry",
        "Margin expansion expected",
      ],
    };

    await sendToAI(extracted);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4">
        Concall Intelligence Engine
      </h2>

      <textarea
        rows={12}
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm"
        placeholder="Paste transcript..."
      />

      <button
        onClick={processTranscript}
        className="mt-4 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg"
      >
        Process Transcript
      </button>
    </div>
  );
}
