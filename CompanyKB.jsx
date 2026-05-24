import { useState } from "react";

export default function CompanyKB() {
  const [query, setQuery] = useState("");

  const kb = [
    {
      title: "Business Summary",
      content:
        "Leader in EMS manufacturing with export exposure.",
    },
    {
      title: "Management Quality",
      content:
        "High execution credibility with strong ROCE track record.",
    },
    {
      title: "Order Book",
      content:
        "₹4,500 Cr executable over 18-24 months.",
    },
  ];

  return (
    <div className="w-[350px] bg-zinc-900 border-l border-zinc-800 h-full p-4 overflow-auto">
      <h2 className="text-lg font-semibold mb-4">
        Company Knowledge Base
      </h2>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search KB..."
        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 mb-4"
      />

      <div className="space-y-3">
        {kb.map((item, idx) => (
          <div
            key={idx}
            className="bg-zinc-950 border border-zinc-800 rounded-lg p-3"
          >
            <div className="font-semibold text-cyan-400">
              {item.title}
            </div>

            <div className="text-sm text-zinc-300 mt-1">
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
