import { Plus } from 'lucide-react'
import HighlightCircle from './HighlightCircle'

export default function ProfileHeader({
  profile,
  highlights,
  onStoryClick,
  onEditProfile,
  onNewHighlight,
}) {
  return (
    <div>
      {/* Profile info */}
      <div className="px-4 pt-6 pb-3 flex flex-col items-center text-center">
        {/* Avatar centrato */}
        <AvatarWithRing url={profile.avatar_url} />

        {/* Username e bio centrati */}
        <div className="mt-3 mb-3.5">
          <p className="font-semibold text-sm leading-[18px]">{profile.username}</p>
          {profile.bio && (
            <p className="text-sm leading-[18px] whitespace-pre-line mt-1 text-black dark:text-white">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Modifica profilo */}
        <button
          onClick={onEditProfile}
          className="w-full py-[7px] bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-semibold active:opacity-60 transition-opacity"
        >
          Modifica profilo
        </button>
      </div>

      {/* Highlights row */}
      <div className="flex gap-4 px-4 py-3 overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-gray-800">
        <NewHighlightButton onClick={onNewHighlight} />
        {highlights.map(h => (
          <HighlightCircle key={h.id} highlight={h} onClick={() => onStoryClick(h)} />
        ))}
      </div>
    </div>
  )
}

function AvatarWithRing({ url }) {
  return (
    <div className="w-[86px] h-[86px] flex-shrink-0 rounded-full border border-gray-300 dark:border-gray-600">
      <AvatarImage url={url} />
    </div>
  )
}

function AvatarImage({ url }) {
  return (
    <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
      {url ? (
        <img src={url} alt="Foto profilo" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-11 h-11 text-gray-400 dark:text-gray-500">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      )}
    </div>
  )
}

function NewHighlightButton({ onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <div className="w-[62px] h-[62px] rounded-full border-[1.5px] border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
        <Plus size={22} className="text-gray-400 dark:text-gray-500" />
      </div>
      <span className="text-[11px] text-gray-600 dark:text-gray-400 w-16 text-center truncate leading-tight">
        Nuova
      </span>
    </button>
  )
}
