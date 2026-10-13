import { useState, useRef } from 'react'
import { X, Plus, Music, Trash2, ChevronRight } from 'lucide-react'
import MusicPicker from './MusicPicker'

export default function EditPostModal({ post, onClose, onSave }) {
  const images = post.post_images?.length
    ? [...post.post_images].sort((a, b) => a.position - b.position)
    : [{ id: null, image_url: post.image_url, position: 0 }]

  const [existingImages, setExistingImages] = useState(images)
  const [removedIds, setRemovedIds] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [newPreviews, setNewPreviews] = useState([])
  const [caption, setCaption] = useState(post.caption ?? '')
  const [selectedSong, setSelectedSong] = useState(
    post.music_title
      ? { title: post.music_title, artist: post.music_artist, previewUrl: post.music_preview_url, artworkUrl: post.music_artwork_url }
      : null
  )
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef(null)

  const allPreviews = [
    ...existingImages.map(i => i.image_url),
    ...newPreviews,
  ]
  const totalCount = allPreviews.length

  function removeExisting(img) {
    if (existingImages.length + newFiles.length <= 1) return
    if (img.id) setRemovedIds(prev => [...prev, img.id])
    setExistingImages(prev => prev.filter(i => i.id !== img.id || (i.id === null && i.image_url !== img.image_url)))
    setActiveIdx(prev => Math.min(prev, existingImages.length + newFiles.length - 2))
  }

  function removeNew(i) {
    if (existingImages.length + newFiles.length <= 1) return
    setNewFiles(prev => prev.filter((_, idx) => idx !== i))
    setNewPreviews(prev => prev.filter((_, idx) => idx !== i))
    setActiveIdx(prev => Math.min(prev, existingImages.length + newFiles.length - 2))
  }

  function addFiles(files) {
    const arr = Array.from(files).slice(0, 10 - totalCount)
    if (!arr.length) return
    setNewFiles(prev => [...prev, ...arr])
    setNewPreviews(prev => [...prev, ...arr.map(f => URL.createObjectURL(f))])
  }

  async function handleSave() {
    setSaving(true)
    await onSave({
      postId: post.id,
      existingImages,
      removedIds,
      newFiles,
      caption,
      musicTitle:      selectedSong?.title      ?? null,
      musicArtist:     selectedSong?.artist     ?? null,
      musicPreviewUrl: selectedSong?.previewUrl ?? null,
      musicArtworkUrl: selectedSong?.artworkUrl ?? null,
    })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <button onClick={onClose}><X size={24} strokeWidth={1.8} /></button>
        <span className="font-semibold text-sm">Modifica post</span>
        <button
          onClick={handleSave}
          disabled={saving || totalCount === 0}
          className="text-blue-500 font-semibold text-sm disabled:opacity-40"
        >
          {saving ? 'Salvo...' : 'Salva'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Preview principale */}
        {allPreviews.length > 0 && (
          <div className="aspect-square rounded-2xl overflow-hidden bg-black relative">
            <img src={allPreviews[Math.min(activeIdx, allPreviews.length - 1)]} alt="" className="w-full h-full object-contain" />
            {allPreviews.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/50 rounded-full px-2 py-0.5 text-white text-xs">
                {Math.min(activeIdx, allPreviews.length - 1) + 1}/{allPreviews.length}
              </div>
            )}
          </div>
        )}

        {/* Miniature foto */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Foto</label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {existingImages.map((img, i) => (
              <div key={img.id ?? img.image_url} className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden ${activeIdx === i ? 'ring-2 ring-blue-500' : 'opacity-70'}`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
                <button
                  type="button"
                  onClick={() => removeExisting(img)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center"
                >
                  <X size={10} color="white" />
                </button>
              </div>
            ))}
            {newPreviews.map((url, i) => (
              <div key={`new-${i}`} className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveIdx(existingImages.length + i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden ${activeIdx === existingImages.length + i ? 'ring-2 ring-blue-500' : 'opacity-70'}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center"
                >
                  <X size={10} color="white" />
                </button>
              </div>
            ))}
            {totalCount < 10 && (
              <button
                type="button"
                onClick={() => inputRef.current.click()}
                className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center flex-shrink-0"
              >
                <Plus size={20} className="text-gray-400" />
              </button>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
        </div>

        {/* Didascalia */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Didascalia</label>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Scrivi una didascalia..."
            rows={3}
            maxLength={2200}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors text-black dark:text-white placeholder-gray-400 resize-none"
          />
          <p className="text-right text-[11px] text-gray-400 mt-0.5">{caption.length}/2200</p>
        </div>

        {/* Musica */}
        {selectedSong ? (
          <div className="flex items-center gap-3 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5">
            {selectedSong.artworkUrl ? (
              <img src={selectedSong.artworkUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <Music size={16} className="text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{selectedSong.title}</p>
              <p className="text-xs text-gray-400 truncate">{selectedSong.artist}</p>
            </div>
            <button type="button" onClick={() => setSelectedSong(null)} className="p-1 -mr-1">
              <X size={16} className="text-gray-400" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="w-full flex items-center gap-3 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <Music size={18} className="text-gray-400" />
            </div>
            <span className="flex-1 text-left text-sm text-gray-400">Aggiungi musica</span>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        )}
      </div>

      {showPicker && (
        <MusicPicker onSelect={s => { setSelectedSong(s); setShowPicker(false) }} onClose={() => setShowPicker(false)} />
      )}
    </div>
  )
}
