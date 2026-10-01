import { useState, useEffect, useRef } from 'react'
import { X, Search, Music, Play, Pause, Check } from 'lucide-react'

const TRENDING_TERM = 'pop hits 2024'

export default function MusicPicker({ onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [playingId, setPlayingId] = useState(null)
  const audioRef = useRef(new Audio())

  useEffect(() => {
    loadSongs(TRENDING_TERM)
    return () => { audioRef.current.pause() }
  }, [])

  useEffect(() => {
    if (!query.trim()) { loadSongs(TRENDING_TERM); return }
    const t = setTimeout(() => loadSongs(query), 450)
    return () => clearTimeout(t)
  }, [query])

  async function loadSongs(term) {
    setLoading(true)
    try {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&limit=25`
      let json
      try {
        const res = await fetch(itunesUrl)
        if (!res.ok) throw new Error('not ok')
        json = await res.json()
      } catch {
        const proxyRes = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(itunesUrl)}`)
        json = await proxyRes.json()
      }
      setResults((json.results ?? []).filter(s => s.previewUrl))
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  function togglePlay(song) {
    const audio = audioRef.current
    if (playingId === song.trackId) {
      audio.pause()
      setPlayingId(null)
    } else {
      audio.src = song.previewUrl
      audio.play().catch(() => {})
      setPlayingId(song.trackId)
    }
  }

  audioRef.current.onended = () => setPlayingId(null)

  function handleSelect(song) {
    audioRef.current.pause()
    onSelect({
      title:      song.trackName,
      artist:     song.artistName,
      previewUrl: song.previewUrl,
      artworkUrl: song.artworkUrl60 ?? song.artworkUrl100 ?? null,
    })
  }

  function handleClose() {
    audioRef.current.pause()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-black">
      <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <button onClick={handleClose} aria-label="Chiudi"><X size={24} strokeWidth={1.8} /></button>
        <span className="font-semibold text-sm">Scegli musica</span>
        <div className="w-6" />
      </div>

      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-900 flex-shrink-0">
        <div className="flex items-center gap-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cerca artista o canzone..."
            className="flex-1 text-sm bg-transparent outline-none text-black dark:text-white placeholder-gray-400"
            autoComplete="off"
          />
          {query.length > 0 && (
            <button onClick={() => setQuery('')}>
              <X size={13} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pt-3 pb-1 flex-shrink-0">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {query.trim() ? 'Risultati' : 'Suggeriti'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-14">
            <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-300 dark:text-gray-600">
            <Music size={36} />
            <p className="text-sm">Nessun risultato</p>
          </div>
        ) : (
          results.map(song => (
            <SongRow
              key={song.trackId}
              song={song}
              playing={playingId === song.trackId}
              onPlay={() => togglePlay(song)}
              onSelect={() => handleSelect(song)}
            />
          ))
        )}
      </div>

      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-900 flex-shrink-0">
        <p className="text-[10px] text-gray-400 text-center">Anteprime 30s · iTunes / Apple Music</p>
      </div>
    </div>
  )
}

function SongRow({ song, playing, onPlay, onSelect }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 dark:border-gray-900">
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
        {song.artworkUrl60 ? (
          <img src={song.artworkUrl60} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music size={18} className="text-gray-400" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight truncate">{song.trackName}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{song.artistName}</p>
      </div>

      <button
        onClick={onPlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
          playing ? 'bg-black dark:bg-white' : 'bg-gray-100 dark:bg-gray-800'
        }`}
        aria-label={playing ? 'Pausa' : 'Ascolta anteprima'}
      >
        {playing
          ? <Pause size={14} className="text-white dark:text-black" strokeWidth={2} />
          : <Play  size={14} className="text-black dark:text-white ml-0.5" strokeWidth={2} />
        }
      </button>

      <button
        onClick={onSelect}
        className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"
        aria-label="Scegli"
      >
        <Check size={16} color="white" strokeWidth={2.5} />
      </button>
    </div>
  )
}
