"use client";

export default function FilterBar({
  activeFilter,
  setFilter,
}: {
  activeFilter: string;
  setFilter: (f: string) => void;
}) {
  const filters = ["All", "Work", "Reading"];

  return (
    <div className="flex gap-2 mb-6">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-3 py-1 rounded-full text-xs ${
            activeFilter === f
              ? "bg-[#e8a44a] text-black"
              : "bg-gray-200 dark:bg-white/10"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}