import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import HighlightCircle from './HighlightCircle'

export default function ProfileHeader({
  profile, highlights, onStoryClick, onEditProfile, onNewHighlight,
}) {
  const [showAvatarZoom, setShowAvatarZoom] = useState(false)

  return (
    <div>
      <div className="px-4 pt-6 pb-3 flex flex-col items-center text-center">
        <AvatarWithRing
          url={profile.avatar_url}
          onClick={() => profile.avatar_url && setShowAvatarZoom(true)}
        />
        <div className="mt-3 mb-3.5">
          <p className="font-semibold text-sm leading-[18px]">{profile.username}</p>
          {profile.bio && (
            <p className="text-sm leading-[18px] whitespace-pre-line mt-1 text-black dark:text-white">{profile.bio}</p>
          )}
        </div>
        <button onClick={onEditProfile}
          className="w-full py-[7px] bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-semibold active:opacity-60 transition-opacity">
          Modifica profilo
        </button>
      </div>

      <div className="flex gap-4 px-4 py-3 overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-gray-800">
        <NewHighlightButton onClick={onNewHighlight} />
        {highlights.map(h => (
          <HighlightCircle key={h.id} highlight={h} onClick={() => onStoryClick(h)} />
        ))}
      </div>

      {showAvatarZoom && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center"
          onClick={() => setShowAvatarZoom(false)}
        >
          <button className="absolute top-4 right-4 text-white/70"><X size={28} /></button>
          <img
            src={profile.avatar_url}
            alt="Foto profilo"
            className="w-72 h-72 rounded-full object-cover shadow-2xl"
          />
        </div>
      )}
    </div>
  )
}

function AvatarWithRing({ url, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-[86px] h-[86px] flex-shrink-0 rounded-full border border-gray-300 dark:border-gray-600 active:opacity-80 transition-opacity"
      style={{ cursor: url ? 'pointer' : 'default' }}
    >
      <AvatarImage url={url} />
    </button>
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
      <span className="text-[11px] text-gray-600 dark:text-gray-400 w-16 text-center truncate leading-tight">Nuova</span>
    </button>
  )
}
