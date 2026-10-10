type OnlinePlayersIndicatorProps = {
  count: number | null;
  label: string;
};

const OnlinePlayersIndicator = ({ count, label }: OnlinePlayersIndicatorProps) => {
  if (count === null) return null;

  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300" aria-live="polite">
      <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
      {label}
    </p>
  );
};

export default OnlinePlayersIndicator;
