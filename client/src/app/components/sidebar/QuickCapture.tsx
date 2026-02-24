export default function QuickCapture({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="border border-dashed p-6 rounded-2xl text-center cursor-pointer hover:border-[#e8a44a]"
    >
      Quick Capture
    </div>
  );
}