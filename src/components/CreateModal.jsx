import { useState, useEffect, useRef } from 'react'
import { X, ImageIcon, Plus, Music, Trash2, ChevronRight } from 'lucide-react'
import MusicPicker from './MusicPicker'

const TITLES = {
  post:      'Nuovo post',
  highlight: 'Nuova storia in evidenza',
  profile:   'Modifica profilo',
}

const FILTERS = [
  { id: 'normal',    label: 'Normale',   css: 'none' },
  { id: 'clarendon', label: 'Clarendon', css: 'contrast(1.2) saturate(1.35) brightness(1.05)' },
  { id: 'gingham',   label: 'Gingham',   css: 'brightness(1.05) hue-rotate(-10deg) sepia(0.2)' },
  { id: 'moon',      label: 'Moon',      css: 'grayscale(1) contrast(1.1) brightness(1.1)' },
  { id: 'lark',      label: 'Lark',      css: 'brightness(1.1) contrast(0.9) saturate(1.1)' },
  { id: 'reyes',     label: 'Reyes',     css: 'sepia(0.4) brightness(1.15) contrast(0.85) saturate(0.75)' },
  { id: 'juno',      label: 'Juno',      css: 'saturate(1.4) contrast(1.1) sepia(0.1)' },
  { id: 'slumber',   label: 'Slumber',   css: 'saturate(0.7) brightness(1.05) sepia(0.25)' },
  { id: 'crema',     label: 'Crema',     css: 'sepia(0.2) brightness(1.1) saturate(0.9) hue-rotate(5deg)' },
  { id: 'ludwig',    label: 'Ludwig',    css: 'brightness(1.05) contrast(1.05) saturate(0.9)' },
  { id: 'aden',      label: 'Aden',      css: 'brightness(1.15) contrast(0.9) saturate(0.85) hue-rotate(20deg)' },
  { id: 'perpetua',  label: 'Perpetua',  css: 'brightness(1.05) contrast(1.1) saturate(1.1) sepia(0.1)' },
]

export { FILTERS }

export default function CreateModal({ initialTab = 'post', profile, highlights, onClose, onSubmit }) {
  const mode = initialTab
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  async function handleSubmit(type, payload) {
    setLoading(true)
    setError(null)
    try {
      await onSubmit(type, payload)
    } catch (e) {
      setError(e?.message ?? 'Errore nel salvataggio. Riprova.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-black">
      <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <button onClick={onClose} aria-label="Chiudi"><X size={24} strokeWidth={1.8} /></button>
        <span className="font-semibold text-sm">{TITLES[mode]}</span>
        <div className="w-6" />
      </div>

      {error && (
        <div className="mx-4 mt-3 px-3 py-2.5 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {mode === 'post'      && <PostForm      onSubmit={p => handleSubmit('post', p)}      loading={loading} />}
        {mode === 'highlight' && <HighlightForm highlights={highlights} onSubmit={p => handleSubmit('highlight', p)} loading={loading} />}
        {mode === 'profile'   && <ProfileForm   profile={profile}       onSubmit={p => handleSubmit('profile', p)}   loading={loading} />}
      </div>
    </div>
  )
}

function MusicButton({ song, onOpen, onRemove }) {
  if (song) {
    return (
      <div className="flex items-center gap-3 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5">
        {song.artworkUrl ? (
          <img src={song.artworkUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            <Music size={16} className="text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{song.title}</p>
          <p className="text-xs text-gray-400 truncate">{song.artist}</p>
        </div>
        <button type="button" onClick={onRemove} className="p-1 -mr-1">
          <X size={16} className="text-gray-400" />
        </button>
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full flex items-center gap-3 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 active:opacity-60 transition-opacity"
    >
      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
        <Music size={18} className="text-gray-400" />
      </div>
      <span className="flex-1 text-left text-sm text-gray-400">Aggiungi musica</span>
      <ChevronRight size={16} className="text-gray-300" />
    </button>
  )
}

function PostForm({ onSubmit, loading }) {
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [caption, setCaption] = useState('')
  const [selectedSong, setSelectedSong] = useState(null)
  const [showPicker, setShowPicker] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef(null)

  function addImages(newFiles) {
    const arr = Array.from(newFiles).slice(0, 10 - files.length)
    if (!arr.length) return
    setFiles(prev => [...prev, ...arr])
    setPreviews(prev => [...prev, ...arr.map(f => URL.createObjectURL(f))])
  }

  function removeImage(i) {
    setFiles(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
    setActiveIdx(prev => Math.min(prev, files.length - 2))
  }

  function submit(e) {
    e.preventDefault()
    if (!files.length) return
    onSubmit({
      imageFiles: files,
      caption,
      musicTitle:      selectedSong?.title      ?? null,
      musicArtist:     selectedSong?.artist     ?? null,
      musicPreviewUrl: selectedSong?.previewUrl ?? null,
      musicArtworkUrl: selectedSong?.artworkUrl ?? null,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {previews.length > 0 ? (
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-black relative">
            <img src={previews[activeIdx]} alt="" className="w-full h-full object-contain" />
            {previews.length > 1 && (
              <>
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                  {previews.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeIdx ? 'bg-white' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
                <div className="absolute top-2 right-2 bg-black/50 rounded-full px-2 py-0.5 text-white text-xs">
                  {activeIdx + 1}/{previews.length}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pb-1">
            {previews.map((url, i) => (
              <div key={i} className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden ${i === activeIdx ? 'ring-2 ring-blue-500' : 'opacity-60'}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/70 flex items-center justify-center"
                >
                  <X size={9} color="white" />
                </button>
              </div>
            ))}
            {files.length < 10 && (
              <button
                type="button"
                onClick={() => inputRef.current.click()}
                className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center flex-shrink-0"
              >
                <Plus size={18} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          className="w-full aspect-square rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-3"
        >
          <ImageIcon size={44} className="text-gray-300 dark:text-gray-600" />
          <span className="text-sm text-gray-400 dark:text-gray-500 text-center px-6">
            Tocca per aggiungere fino a 10 foto
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => addImages(e.target.files)}
      />

      <div>
        <FieldLabel>Didascalia</FieldLabel>
        <textarea
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="Scrivi una didascalia..."
          rows={3}
          maxLength={2200}
          className={`${inputBase} resize-none`}
        />
        <p className="text-right text-[11px] text-gray-400 mt-0.5">{caption.length}/2200</p>
      </div>

      <MusicButton song={selectedSong} onOpen={() => setShowPicker(true)} onRemove={() => setSelectedSong(null)} />

      <SubmitButton disabled={!files.length || loading} loading={loading} label="Pubblica" />

      {showPicker && (
        <MusicPicker onSelect={s => { setSelectedSong(s); setShowPicker(false) }} onClose={() => setShowPicker(false)} />
      )}
    </form>
  )
}

function HighlightForm({ highlights, onSubmit, loading }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [hlId, setHlId] = useState('new')
  const [newTitle, setNewTitle] = useState('')
  const [filterName, setFilterName] = useState('normal')
  const [selectedSong, setSelectedSong] = useState(null)
  const [showPicker, setShowPicker] = useState(false)
  const inputRef = useRef(null)

  const activeFilter = FILTERS.find(f => f.id === filterName)

  function pick(f) {
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function submit(e) {
    e.preventDefault()
    if (!file) return
    const title = hlId === 'new'
      ? newTitle.trim()
      : highlights.find(h => h.id === hlId)?.title ?? ''
    onSubmit({
      imageFile: file, title, highlightId: hlId, filterName,
      musicTitle:      selectedSong?.title      ?? null,
      musicArtist:     selectedSong?.artist     ?? null,
      musicPreviewUrl: selectedSong?.previewUrl ?? null,
      musicArtworkUrl: selectedSong?.artworkUrl ?? null,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <FieldLabel>Categoria</FieldLabel>
        <select value={hlId} onChange={e => setHlId(e.target.value)} className={inputBase}>
          <option value="new">+ Nuova categoria...</option>
          {highlights.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
        </select>
      </div>

      {hlId === 'new' && (
        <div>
          <FieldLabel>Nome categoria</FieldLabel>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="es. Viaggi, Estate 2024..."
            required
            className={inputBase}
          />
        </div>
      )}

      <div>
        <FieldLabel>Immagine storia</FieldLabel>
        {preview ? (
          <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black">
            <img
              src={preview}
              alt=""
              className="w-full h-full object-contain"
              style={{ filter: activeFilter?.css ?? 'none' }}
            />
            <button
              type="button"
              onClick={() => { setFile(null); setPreview(null) }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
            >
              <Trash2 size={14} color="white" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current.click()}
            className="w-full aspect-[9/16] rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-3"
          >
            <ImageIcon size={44} className="text-gray-300 dark:text-gray-600" />
            <span className="text-sm text-gray-400 text-center px-6">Tocca per scegliere una foto</span>
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => pick(e.target.files?.[0])} />
      </div>

      {preview && (
        <div>
          <FieldLabel>Filtro</FieldLabel>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {FILTERS.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterName(f.id)}
                className="flex flex-col items-center gap-1 flex-shrink-0"
              >
                <div className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-colors ${filterName === f.id ? 'border-blue-500' : 'border-transparent'}`}>
                  <img src={preview} alt={f.label} className="w-full h-full object-cover" style={{ filter: f.css }} />
                </div>
                <span className={`text-[10px] ${filterName === f.id ? 'text-blue-500 font-semibold' : 'text-gray-400'}`}>
                  {f.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <MusicButton song={selectedSong} onOpen={() => setShowPicker(true)} onRemove={() => setSelectedSong(null)} />

      <SubmitButton
        disabled={!file || loading || (hlId === 'new' && !newTitle.trim())}
        loading={loading}
        label="Aggiungi storia"
      />

      {showPicker && (
        <MusicPicker onSelect={s => { setSelectedSong(s); setShowPicker(false) }} onClose={() => setShowPicker(false)} />
      )}
    </form>
  )
}

function ProfileForm({ profile, onSubmit, loading }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(profile.avatar_url ?? null)
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio ?? '')
  const avatarRef = useRef(null)

  function pickAvatar(f) {
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  return (
    <form onSubmit={e => { e.preventDefault(); if (username.trim()) onSubmit({ imageFile: file, username: username.trim(), bio }) }} className="space-y-5">
      <div className="flex flex-col items-center gap-2 py-2">
        <div className="relative w-24 h-24">
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {preview ? (
              <img src={preview} alt="Foto profilo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-gray-400">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
          </div>
          <button type="button" onClick={() => avatarRef.current?.click()} className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
            <Plus size={16} color="white" strokeWidth={2.5} />
          </button>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={e => pickAvatar(e.target.files?.[0])} />
        </div>
        <button type="button" onClick={() => avatarRef.current?.click()} className="text-blue-500 font-semibold text-sm">
          Cambia foto profilo
        </button>
      </div>

      <div>
        <FieldLabel>Nome utente</FieldLabel>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="nomeutente" required className={inputBase} />
      </div>

      <div>
        <FieldLabel>Bio</FieldLabel>
        <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Parla di te... ✨" rows={3} maxLength={150} className={`${inputBase} resize-none`} />
        <p className="text-right text-[11px] text-gray-400 mt-0.5">{bio.length}/150</p>
      </div>

      <SubmitButton disabled={!username.trim() || loading} loading={loading} label="Salva modifiche" />
    </form>
  )
}

function FieldLabel({ children }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
      {children}
    </label>
  )
}

const inputBase =
  'w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500'

function SubmitButton({ disabled, loading, label }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed active:bg-blue-600 transition-colors"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Salvataggio...
        </span>
      ) : label}
    </button>
  )
}
