import { useState } from "react";
import { useDropzone } from "react-dropzone";
import useAI from "../../hooks/useAI";

export default function AnnouncementSummarizer() {
  const [text, setText] = useState("");
  const { sendToAI } = useAI();

  const onDrop = (acceptedFiles) => {
    console.log(acceptedFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  });

  const handleAnalyze = async () => {
    const result = {
      type: "announcement",
      bullishScore: 82,
      bearishScore: 18,
      risks: [
        "Execution delays",
        "Working capital pressure",
      ],
      keyNumbers: {
        orderValue: "₹2,000 Cr",
        marginImpact: "+120bps",
      },
      summary:
        "Large strategic order with margin accretive profile.",
    };

    await sendToAI(result);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-lg font-semibold mb-4">
        Announcement Summarizer
      </div>

      <div
        {...getRootProps()}
        className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center cursor-pointer"
      >
        <input {...getInputProps()} />

        <p className="text-zinc-400">
          Drag PDFs/Text Here
        </p>
      </div>

      <textarea
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full mt-4 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm"
        placeholder="Paste filing text..."
      />

      <button
        onClick={handleAnalyze}
        className="mt-4 bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg"
      >
        Analyze Filing
      </button>
    </div>
  );
}
