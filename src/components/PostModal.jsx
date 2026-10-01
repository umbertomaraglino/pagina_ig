import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, MoreHorizontal, Heart, MessageCircle, Send, Bookmark, Music, Pause } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function PostModal({ post, profile, onClose, onLike }) {
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isLiked, setIsLiked] = useState(
    () => localStorage.getItem(`liked_${post.id}`) === 'true'
  )
  const [localLikes, setLocalLikes] = useState(post.likes_count)
  const [imgIndex, setImgIndex] = useState(0)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const inputRef = useRef(null)
  const scrollRef = useRef(null)
  const audioRef = useRef(null)

  const images = post.post_images?.length
    ? [...post.post_images].sort((a, b) => a.position - b.position).map(i => i.image_url)
    : [post.image_url]

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    if (post.music_preview_url) {
      const audio = new Audio(post.music_preview_url)
      audio.loop = true
      audio.play().catch(() => {})
      audioRef.current = audio
      setMusicPlaying(true)
    }

    return () => {
      document.body.style.overflow = prev
      audioRef.current?.pause()
    }
  }, [])

  function toggleMusic() {
    if (!audioRef.current) return
    if (musicPlaying) {
      audioRef.current.pause()
      setMusicPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setMusicPlaying(true)
    }
  }

  useEffect(() => {
    supabase
      .from('comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setComments(data) })
  }, [post.id])

  useEffect(() => {
    setLocalLikes(post.likes_count)
  }, [post.likes_count])

  function onScroll() {
    if (!scrollRef.current) return
    const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth)
    setImgIndex(idx)
  }

  function handleLikeClick() {
    const next = !isLiked
    setIsLiked(next)
    setLocalLikes(l => next ? l + 1 : l - 1)
    localStorage.setItem(`liked_${post.id}`, String(next))
    onLike(post.id, next)
  }

  async function handleComment(e) {
    e.preventDefault()
    const text = commentText.trim()
    if (!text) return
    setSubmitting(true)
    const { data } = await supabase
      .from('comments')
      .insert({ post_id: post.id, text, author: profile.username })
      .select().single()
    if (data) setComments(prev => [...prev, data])
    setCommentText('')
    setSubmitting(false)
  }

  const dateStr = new Date(post.created_at).toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="fixed inset-0 z-40 bg-white dark:bg-black flex justify-center">
      <div className="w-full max-w-[468px] flex flex-col h-full">

        <div className="flex items-center justify-between px-3 h-12 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <button onClick={onClose} className="p-1 -ml-1"><ChevronLeft size={26} strokeWidth={1.8} /></button>
          <span className="font-semibold text-sm">Post</span>
          <button className="p-1 -mr-1"><MoreHorizontal size={24} strokeWidth={1.8} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div
            className="relative w-full bg-black"
            style={{ aspectRatio: '1/1' }}
            onClick={post.music_preview_url ? toggleMusic : undefined}
          >
            {post.music_preview_url && (
              <div className="absolute top-2 left-2 z-10 bg-black/40 rounded-full p-1.5 pointer-events-none">
                {musicPlaying
                  ? <Music size={14} color="white" />
                  : <Pause size={14} color="white" />
                }
              </div>
            )}
            <div
              ref={scrollRef}
              onScroll={onScroll}
              className="absolute inset-0 flex overflow-x-auto no-scrollbar"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {images.map((url, i) => (
                <div
                  key={i}
                  className="flex-shrink-0"
                  style={{ width: '100%', height: '100%', minWidth: '100%', scrollSnapAlign: 'center' }}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 pointer-events-none">
                {images.map((_, i) => (
                  <div key={i} className={`rounded-full ${i === imgIndex ? 'w-1.5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`} />
                ))}
              </div>
            )}
            {images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/50 rounded-full px-2 py-0.5 text-white text-xs pointer-events-none">
                {imgIndex + 1}/{images.length}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <MiniAvatar url={profile.avatar_url} />
              <span className="font-semibold text-sm">{profile.username}</span>
            </div>
            <button><MoreHorizontal size={20} strokeWidth={1.8} className="text-gray-500" /></button>
          </div>

          <div className="flex items-center justify-between px-3 pb-2">
            <div className="flex items-center gap-3.5">
              <button onClick={handleLikeClick} className="active:scale-90 transition-transform">
                <Heart size={26} strokeWidth={isLiked ? 0 : 1.5} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
              </button>
              <button onClick={() => inputRef.current?.focus()}>
                <MessageCircle size={26} strokeWidth={1.5} />
              </button>
              <button><Send size={24} strokeWidth={1.5} className="-rotate-[15deg]" /></button>
            </div>
            <button><Bookmark size={26} strokeWidth={1.5} /></button>
          </div>

          {localLikes > 0 && (
            <p className="px-3 text-sm font-semibold mb-1">
              {localLikes.toLocaleString('it-IT')} Mi piace
            </p>
          )}

          {post.music_title && (
            <div className="mx-3 mb-2 flex items-center gap-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl px-3 py-2">
              {post.music_artwork_url ? (
                <img src={post.music_artwork_url} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <Music size={14} className="text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{post.music_title}</p>
                {post.music_artist && <p className="text-[11px] text-gray-400 truncate">{post.music_artist}</p>}
              </div>
            </div>
          )}

          {post.caption && (
            <p className="px-3 text-sm leading-[18px] mb-1">
              <span className="font-semibold mr-1.5">{profile.username}</span>
              {post.caption}
            </p>
          )}

          <p className="px-3 text-[11px] text-gray-400 dark:text-gray-500 mt-1 mb-4 uppercase tracking-wide">{dateStr}</p>

          {comments.length > 0 && (
            <div className="px-3 pb-4 space-y-2.5">
              {comments.map(c => (
                <div key={c.id} className="text-sm leading-[18px]">
                  <span className="font-semibold mr-1.5">{c.author}</span>
                  {c.text}
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleComment} className="flex items-center gap-3 px-3 py-2.5 border-t border-gray-200 dark:border-gray-800 flex-shrink-0 safe-bottom">
          <MiniAvatar url={profile.avatar_url} size={32} />
          <input
            ref={inputRef}
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder={`Commenta come ${profile.username}...`}
            className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500"
          />
          {commentText.trim() && (
            <button type="submit" disabled={submitting} className="text-blue-500 font-semibold text-sm disabled:opacity-50">
              Pubblica
            </button>
          )}
        </form>

      </div>
    </div>
  )
}

function MiniAvatar({ url, size = 36 }) {
  return (
    <div className="rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0" style={{ width: size, height: size }}>
      {url ? (
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4/6 h-4/6 text-gray-400">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      )}
    </div>
  )
}
