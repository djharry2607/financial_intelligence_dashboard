export default function DailyMarketWrap() {
  const sections = [
    {
      title: "Key Announcements",
      items: [
        "MTAR wins ₹2,000 Cr strategic order",
        "Dixon expands capacity",
      ],
    },
    {
      title: "Sector Rotation",
      items: [
        "Defence outperforming",
        "EMS seeing accumulation",
      ],
    },
    {
      title: "Promoter Activity",
      items: [
        "Promoter buying in smallcaps rising",
      ],
    },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">
          Daily Market Wrap
        </h2>

        <div className="text-sm text-zinc-400">
          Automated Intelligence Feed
        </div>
      </div>

      <div className="space-y-5">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-cyan-400 font-semibold mb-2">
              {section.title}
            </h3>

            <ul className="space-y-2">
              {section.items.map((item, i) => (
                <li
                  key={i}
                  className="text-sm text-zinc-300"
                >
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
