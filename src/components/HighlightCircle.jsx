export default function HighlightCircle({ highlight, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 flex-shrink-0"
    >
      <div className="w-[62px] h-[62px] rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700">
        {highlight.cover_image_url ? (
          <img
            src={highlight.cover_image_url}
            alt={highlight.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <span className="text-gray-500 dark:text-gray-400 text-lg font-bold">
              {highlight.title?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
        )}
      </div>

      <span className="text-[11px] text-gray-800 dark:text-gray-200 w-16 text-center truncate leading-tight">
        {highlight.title}
      </span>
    </button>
  )
}
