interface NotesListProps {
  viewMode: "grid" | "list";
}

export function NotesList({ viewMode }: NotesListProps) {
  const notes = ["Note 1", "Note 2", "Note 3"]; // replace with your data

  return (
    <div
      className={viewMode === "grid" ? "grid grid-cols-3 gap-4" : "flex flex-col gap-2"}
    >
      {notes.map((note, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-lg border ${
            viewMode === "grid" ? "border-gray-200" : "border-gray-300"
          }`}
        >
          {note}
        </div>
      ))}
    </div>
  );
}