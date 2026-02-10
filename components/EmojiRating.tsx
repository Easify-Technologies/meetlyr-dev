const EMOJI_OPTIONS = [
  { value: 1, emoji: "😞", text: "Not Present" },
  { value: 2, emoji: "😕", text: "Could have been better" },
  { value: 3, emoji: "😐", text: "It was okay" },
  { value: 4, emoji: "🙂", text: "It was good" },
  { value: 5, emoji: "😍", text: "It was amazing" }
];

export const EmojiRating = ({
  value,
  onSelect
}: {
  value?: number;
  onSelect: (val: number) => void;
}) => {
  const selected = EMOJI_OPTIONS.find(e => e.value === value);

  return (
    <div className="flex flex-col items-center mt-6">
      {/* Emojis */}
      <div className="flex gap-4 justify-center">
        {EMOJI_OPTIONS.map(e => (
          <button
            key={e.value}
            onClick={() => onSelect(e.value)}
            className={`text-3xl transition-all cursor-pointer duration-200 ${
              value === e.value
                ? "scale-125 opacity-100"
                : "opacity-50"
            }`}
          >
            {e.emoji}
          </button>
        ))}
      </div>

      {/* Descriptive Text */}
      {selected && (
        <p className="mt-4 text-sm font-medium text-neutral-600 transition-opacity duration-300">
          {selected.text}
        </p>
      )}
    </div>
  );
};
