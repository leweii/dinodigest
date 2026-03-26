export function SummaryRenderer({ data }: { data: Record<string, unknown> }) {
  const title = String(data.title ?? "");
  const content = String(data.content ?? "");
  const bulletPoints = (data.bulletPoints ?? []) as string[];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      {title && (
        <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
      )}

      <p className="text-gray-700 leading-relaxed mb-4">{content}</p>

      {bulletPoints.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            核心要点
          </h4>
          <ul className="space-y-2">
            {bulletPoints.map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-gray-700 text-sm"
              >
                <span className="text-green-500 mt-0.5 font-bold">-</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
