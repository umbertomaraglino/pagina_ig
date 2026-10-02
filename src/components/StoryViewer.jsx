import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Music, Volume2, VolumeX, MoreVertical, Trash2, PenLine } from 'lucide-react'
import { FILTERS } from './CreateModal'
import { supabase } from '../supabaseClient'
import MusicPicker from './MusicPicker'

const STORY_DURATION = 5000

export default function StoryViewer({ highlight, onClose, onDeleteStory, onUpdateStory }) {
  const stories = highlight.highlight_stories ?? []
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [muted, setMuted] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editFilter, setEditFilter] = useState('normal')
  const [editSong, setEditSong] = useState(null)
  const [showMusicPicker, setShowMusicPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const audioRef = useRef(new Audio())
  const rafRef = useRef(null)
  const startRef = useRef(null)

  const paused = showMenu || showEdit || showMusicPicker

  const goNext = useCallback(() => {
    if (index < stories.length - 1) { setIndex(i => i + 1); setProgress(0) }
    else onClose()
  }, [index, stories.length, onClose])

  const goPrev = useCallback(() => {
    if (index > 0) { setIndex(i => i - 1); setProgress(0) }
  }, [index])

  useEffect(() => {
    if (!stories.length || paused) return
    startRef.current = performance.now()
    const tick = (now) => {
      const p = Math.min((now - startRef.current) / STORY_DURATION, 1)
      setProgress(p)
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
      else goNext()
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [index, goNext, stories.length, paused])

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

  function openEdit() {
    setEditFilter(current.filter_name ?? 'normal')
    setEditSong(current.music_title ? {
      title: current.music_title,
      artist: current.music_artist,
      previewUrl: current.music_preview_url,
      artworkUrl: current.music_artwork_url,
    } : null)
    setShowMenu(false)
    setShowEdit(true)
  }

  async function handleDeleteCurrent() {
    setShowMenu(false)
    if (!confirm('Vuoi eliminare questa storia?')) return
    await supabase.from('highlight_stories').delete().eq('id', current.id)
    onDeleteStory?.(highlight.id, current.id, stories.length <= 1)
  }

  async function handleSaveEdit() {
    setSaving(true)
    const updates = {
      filter_name: editFilter,
      music_title: editSong?.title ?? null,
      music_artist: editSong?.artist ?? null,
      music_preview_url: editSong?.previewUrl ?? null,
      music_artwork_url: editSong?.artworkUrl ?? null,
    }
    await supabase.from('highlight_stories').update(updates).eq('id', current.id)
    onUpdateStory?.(highlight.id, current.id, updates)
    setSaving(false)
    setShowEdit(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" style={{ touchAction: 'none' }}>
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-2 pt-2 pb-1">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-[2px] rounded-full overflow-hidden bg-white/25">
            <div className="h-full bg-white rounded-full"
              style={{ width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%', transition: 'none' }} />
          </div>
        ))}
      </div>

      {/* Header */}
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
        <div className="flex items-center gap-0.5 ml-2 flex-shrink-0">
          {stories[index]?.music_preview_url && (
            <button onClick={() => setMuted(m => !m)} className="p-1.5">
              {muted ? <VolumeX size={20} color="white" /> : <Volume2 size={20} color="white" />}
            </button>
          )}
          <button onClick={() => setShowMenu(true)} className="p-1.5">
            <MoreVertical size={20} color="white" />
          </button>
          <button onClick={onClose} className="p-1.5"><X size={22} color="white" /></button>
        </div>
      </div>

      {/* Immagine */}
      <div className="absolute inset-0">
        <img key={current.id} src={current.image_url} alt={`Storia ${index + 1}`}
          className="w-full h-full object-cover" style={{ filter: filterCss }} draggable={false} />
      </div>

      {/* Musica */}
      {current.music_title && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center px-6 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 max-w-[80%]">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Music size={11} color="white" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{current.music_title}</p>
              {current.music_artist && <p className="text-white/70 text-[10px] truncate">{current.music_artist}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Zone tap */}
      <div className="absolute inset-0 z-10 flex">
        <div className="w-1/3 h-full cursor-pointer" onClick={goPrev} />
        <div className="w-2/3 h-full cursor-pointer" onClick={goNext} />
      </div>

      {/* Menu */}
      {showMenu && (
        <div className="fixed inset-0 z-30 bg-black/60 flex flex-col justify-end" onClick={() => setShowMenu(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mx-auto mt-3 mb-1" />
            <button onClick={openEdit}
              className="flex items-center gap-3 w-full px-5 py-4 text-sm text-black dark:text-white">
              <PenLine size={18} className="text-gray-500" /> Modifica storia
            </button>
            <button onClick={handleDeleteCurrent}
              className="flex items-center gap-3 w-full px-5 py-4 text-sm text-red-500 border-t border-gray-100 dark:border-gray-800">
              <Trash2 size={18} /> Elimina storia
            </button>
            <button onClick={() => setShowMenu(false)}
              className="w-full py-4 text-sm font-semibold text-gray-500 border-t border-gray-100 dark:border-gray-800">
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Edit panel */}
      {showEdit && (
        <div className="fixed inset-0 z-30 bg-black flex flex-col">
          <div className="flex items-center justify-between px-3 h-12 flex-shrink-0">
            <button onClick={() => setShowEdit(false)} className="text-white"><X size={24} strokeWidth={1.8} /></button>
            <span className="text-white font-semibold text-sm">Modifica storia</span>
            <button onClick={handleSaveEdit} disabled={saving} className="text-blue-400 font-semibold text-sm disabled:opacity-50">
              {saving ? 'Salvo...' : 'Salva'}
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <img src={current.image_url} alt="" className="w-full h-full object-cover"
              style={{ filter: FILTERS.find(f => f.id === editFilter)?.css ?? 'none' }} />
          </div>

          <div className="bg-black/90 px-3 py-3 flex-shrink-0">
            <p className="text-white/50 text-xs uppercase tracking-wide mb-2">Filtro</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {FILTERS.map(f => (
                <button key={f.id} onClick={() => setEditFilter(f.id)}
                  className={`flex flex-col items-center gap-1 flex-shrink-0 ${editFilter === f.id ? 'opacity-100' : 'opacity-50'}`}>
                  <div className="w-14 h-14 rounded-xl overflow-hidden border-2 transition-colors"
                    style={{ borderColor: editFilter === f.id ? 'white' : 'transparent' }}>
                    <img src={current.image_url} alt="" className="w-full h-full object-cover" style={{ filter: f.css }} />
                  </div>
                  <span className="text-white text-[10px]">{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/90 px-3 py-3 border-t border-white/10 flex-shrink-0">
            <p className="text-white/50 text-xs uppercase tracking-wide mb-2">Musica</p>
            {editSong ? (
              <div className="flex items-center gap-3">
                {editSong.artworkUrl
                  ? <img src={editSong.artworkUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  : <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0"><Music size={16} color="white" /></div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{editSong.title}</p>
                  {editSong.artist && <p className="text-white/60 text-xs truncate">{editSong.artist}</p>}
                </div>
                <button onClick={() => setEditSong(null)} className="text-white/50 p-1"><X size={16} /></button>
              </div>
            ) : (
              <button onClick={() => setShowMusicPicker(true)} className="flex items-center gap-2 text-white/50 text-sm">
                <Music size={16} /> Aggiungi musica
              </button>
            )}
          </div>
        </div>
      )}

      {showMusicPicker && (
        <MusicPicker onSelect={s => { setEditSong(s); setShowMusicPicker(false) }} onClose={() => setShowMusicPicker(false)} />
      )}
    </div>
  )
}
