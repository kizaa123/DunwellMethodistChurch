interface LiveViewerBadgeProps {
  count: number;
  className?: string;
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1 1 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function LiveViewerBadge({ count, className = "" }: LiveViewerBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold ${className}`}
      title={`${count} ${count === 1 ? "viewer" : "viewers"}`}
      aria-label={`${count} active viewers`}
    >
      <EyeIcon className="h-4 w-4 shrink-0" />
      <span>{count.toLocaleString()}</span>
    </span>
  );
}
