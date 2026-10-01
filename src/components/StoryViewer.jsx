import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Music, Volume2, VolumeX } from 'lucide-react'
import { FILTERS } from './CreateModal'

const STORY_DURATION = 5000

export default function StoryViewer({ highlight, onClose }) {
  const stories = highlight.highlight_stories ?? []
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [muted, setMuted] = useState(false)
  const audioRef = useRef(new Audio())
  const rafRef = useRef(null)
  const startRef = useRef(null)

  const goNext = useCallback(() => {
    if (index < stories.length - 1) { setIndex(i => i + 1); setProgress(0) }
    else onClose()
  }, [index, stories.length, onClose])

  const goPrev = useCallback(() => {
    if (index > 0) { setIndex(i => i - 1); setProgress(0) }
  }, [index])

  useEffect(() => {
    if (!stories.length) return
    startRef.current = performance.now()
    const tick = (now) => {
      const p = Math.min((now - startRef.current) / STORY_DURATION, 1)
      setProgress(p)
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
      else goNext()
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [index, goNext, stories.length])

  useEffect(() => {
    const audio = audioRef.current
    const story = stories[index]
    audio.pause()
    if (story?.music_preview_url) {
      audio.src = story.music_preview_url
      audio.muted = muted
      audio.loop = true
      audio.play().catch(() => {})
    } else {
      audio.src = ''
    }
    return () => audio.pause()
  }, [index, stories])

  useEffect(() => { audioRef.current.muted = muted }, [muted])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      audioRef.current.pause()
    }
  }, [onClose, goNext, goPrev])

  if (!stories.length) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <p className="text-white/60 text-sm">Nessuna storia disponibile</p>
        <button onClick={onClose} className="absolute top-4 right-4"><X size={28} color="white" /></button>
      </div>
    )
  }

  const current = stories[index]
  const filterCss = FILTERS.find(f => f.id === (current.filter_name ?? 'normal'))?.css ?? 'none'
  const hasMusic = !!(current.music_title)

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" style={{ touchAction: 'none' }}>
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-2 pt-2 pb-1">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-[2px] rounded-full overflow-hidden bg-white/25">
            <div
              className="h-full bg-white rounded-full"
              style={{ width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%', transition: 'none' }}
            />
          </div>
        ))}
      </div>

      <div className="absolute top-5 left-0 right-0 z-20 flex items-center px-3 pt-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-600 border border-white/30">
            {highlight.cover_image_url
              ? <img src={highlight.cover_image_url} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{highlight.title?.[0]?.toUpperCase() ?? '?'}</span>
                </div>
            }
          </div>
          <span className="text-white text-sm font-semibold truncate drop-shadow">{highlight.title}</span>
          <span className="text-white/60 text-xs flex-shrink-0">{index + 1}/{stories.length}</span>
        </div>
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {stories[index]?.music_preview_url && (
            <button onClick={() => setMuted(m => !m)} className="p-1">
              {muted ? <VolumeX size={20} color="white" /> : <Volume2 size={20} color="white" />}
            </button>
          )}
          <button onClick={onClose} className="p-1"><X size={24} color="white" /></button>
        </div>
      </div>

      <div className="absolute inset-0">
        <img
          key={current.id}
          src={current.image_url}
          alt={`Storia ${index + 1}`}
          className="w-full h-full object-cover"
          style={{ filter: filterCss }}
          draggable={false}
        />
      </div>

      {hasMusic && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center px-6 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 max-w-[80%]">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Music size={11} color="white" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{current.music_title}</p>
              {current.music_artist && (
                <p className="text-white/70 text-[10px] truncate">{current.music_artist}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-10 flex">
        <div className="w-1/3 h-full cursor-pointer" onClick={goPrev} />
        <div className="w-2/3 h-full cursor-pointer" onClick={goNext} />
      </div>
    </div>
  )
}
