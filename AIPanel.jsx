import useAI from "../../hooks/useAI";

export default function AIPanel() {
  const { aiFeed, loading } = useAI();

  return (
    <div className="w-[350px] bg-zinc-950 border-l border-zinc-800 p-4 overflow-auto">
      <h2 className="text-lg font-semibold mb-4">
        AI Intelligence Feed
      </h2>

      {loading && (
        <div className="text-cyan-400 text-sm mb-4">
          Generating intelligence...
        </div>
      )}

      <div className="space-y-4">
        {aiFeed.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"
          >
            <div className="text-xs text-zinc-500 mb-2">
              {item.type.toUpperCase()}
            </div>

            <pre className="text-xs whitespace-pre-wrap text-zinc-300">
              {JSON.stringify(item, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
