import { useState, useEffect, useCallback } from 'react'
import { Sun, Moon } from 'lucide-react'
import { supabase } from './supabaseClient'
import ProfileHeader from './components/ProfileHeader'
import PostGrid from './components/PostGrid'
import StoryViewer from './components/StoryViewer'
import PostModal from './components/PostModal'
import CreateModal from './components/CreateModal'
import LoginScreen from './components/LoginScreen'

const FALLBACK_PROFILE = {
  id: null,
  username: 'myprofile',
  avatar_url: null,
  bio: '',
  posts_count: 0,
  followers_count: 0,
  following_count: 0,
}

export default function App() {
  const [authed, setAuthed] = useState(
    () => !import.meta.env.VITE_APP_PASSWORD || localStorage.getItem('ig_auth') === '1'
  )
  const [profile, setProfile] = useState(FALLBACK_PROFILE)
  const [posts, setPosts] = useState([])
  const [highlights, setHighlights] = useState([])
  const [activeStory, setActiveStory] = useState(null)
  const [activePost, setActivePost] = useState(null)
  const [createModal, setCreateModal] = useState({ show: false, tab: 'post' })
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [darkMode, setDarkMode] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />

  const fetchProfile = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*').limit(1).maybeSingle()
    if (error) throw error
    if (data) setProfile(data)
  }, [])

  const fetchPosts = useCallback(async () => {
    let { data, error } = await supabase
      .from('posts')
      .select('*, post_images(*)')
      .order('created_at', { ascending: false })
    if (error) {
      const fallback = await supabase.from('posts').select('*').order('created_at', { ascending: false })
      if (fallback.error) throw fallback.error
      data = fallback.data
    }
    if (data) setPosts(data.map(p => ({
      ...p,
      post_images: (p.post_images ?? []).sort((a, b) => a.position - b.position),
    })))
  }, [])

  const fetchHighlights = useCallback(async () => {
    const { data, error } = await supabase
      .from('highlights')
      .select('*, highlight_stories(*)')
      .order('created_at', { ascending: true })
    if (error) throw error
    if (data) {
      setHighlights(
        data.map(h => ({
          ...h,
          highlight_stories: (h.highlight_stories ?? []).sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          ),
        }))
      )
    }
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      await Promise.all([fetchProfile(), fetchPosts(), fetchHighlights()])
    } catch (e) {
      setFetchError(`Errore Supabase: ${e?.message ?? 'sconosciuto'}. Controlla il file .env e riprova.`)
    } finally {
      setLoading(false)
    }
  }, [fetchProfile, fetchPosts, fetchHighlights])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function handleLike(postId, nowLiked) {
    const post = posts.find(p => p.id === postId)
    if (!post) return
    const newCount = nowLiked ? post.likes_count + 1 : post.likes_count - 1
    await supabase.from('posts').update({ likes_count: newCount }).eq('id', postId)
    const updated = { ...post, likes_count: newCount }
    setPosts(prev => prev.map(p => (p.id === postId ? updated : p)))
    if (activePost?.id === postId) setActivePost(updated)
  }

  async function handleCreate(type, payload) {
    if (type === 'post') {
      const { imageFiles, caption } = payload

      const uploadedUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
          const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`
          const { error } = await supabase.storage.from('posts').upload(path, file)
          if (error) throw error
          return supabase.storage.from('posts').getPublicUrl(path).data.publicUrl
        })
      )

      const { data: post, error: dbErr } = await supabase
        .from('posts')
        .insert({
          image_url:         uploadedUrls[0],
          caption,
          music_title:       payload.musicTitle       || null,
          music_artist:      payload.musicArtist      || null,
          music_preview_url: payload.musicPreviewUrl  || null,
          music_artwork_url: payload.musicArtworkUrl  || null,
        })
        .select().single()
      if (dbErr) throw dbErr

      if (uploadedUrls.length > 0) {
        await supabase.from('post_images').insert(
          uploadedUrls.map((url, i) => ({ post_id: post.id, image_url: url, position: i }))
        )
      }

      const fullPost = {
        ...post,
        post_images: uploadedUrls.map((url, i) => ({ image_url: url, position: i })),
      }
      setPosts(prev => [fullPost, ...prev])
      const newCount = profile.posts_count + 1
      if (profile.id) {
        await supabase.from('profiles').update({ posts_count: newCount }).eq('id', profile.id)
      }
      setProfile(prev => ({ ...prev, posts_count: newCount }))

    } else if (type === 'highlight') {
      const { imageFile, title, highlightId, filterName, musicTitle, musicArtist } = payload
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `stories/${Date.now()}-${safeName}`
      const { error: upErr } = await supabase.storage.from('highlights').upload(path, imageFile)
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('highlights').getPublicUrl(path)

      let hId = highlightId
      if (!hId || hId === 'new') {
        const { data: hl, error: hlErr } = await supabase
          .from('highlights')
          .insert({ title, cover_image_url: publicUrl })
          .select()
          .single()
        if (hlErr) throw hlErr
        hId = hl.id
      }
      await supabase.from('highlight_stories').insert({
        highlight_id:      hId,
        image_url:         publicUrl,
        filter_name:       filterName       ?? 'normal',
        music_title:       musicTitle       || null,
        music_artist:      musicArtist      || null,
        music_preview_url: payload.musicPreviewUrl || null,
        music_artwork_url: payload.musicArtworkUrl || null,
      })
      await fetchHighlights()

    } else if (type === 'profile') {
      const { imageFile, bio, username } = payload
      let avatarUrl = profile.avatar_url
      if (imageFile) {
        const path = `${Date.now()}-${imageFile.name}`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, imageFile)
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = publicUrl
      }
      const updates = { bio, username, avatar_url: avatarUrl }
      if (profile.id) {
        await supabase.from('profiles').update(updates).eq('id', profile.id)
      }
      setProfile(prev => ({ ...prev, ...updates }))
    }

    setCreateModal({ show: false, tab: 'post' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-10 h-10 border-2 border-gray-200 dark:border-gray-700 border-t-gray-700 dark:border-t-gray-300 rounded-full animate-spin" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black p-6 text-center gap-4">
        <p className="text-red-500 text-sm">{fetchError}</p>
        <button
          onClick={fetchAll}
          className="px-5 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold"
        >
          Riprova
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="max-w-[468px] mx-auto">
        <header className="sticky top-0 z-10 bg-white/95 dark:bg-black/95 backdrop-blur-sm flex items-center justify-between px-4 h-11 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h1 className="font-bold text-base">{profile.username}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(d => !d)} aria-label="Cambia tema" className="opacity-60">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <ProfileHeader
          profile={profile}
          highlights={highlights}
          onStoryClick={setActiveStory}
          onEditProfile={() => setCreateModal({ show: true, tab: 'profile' })}
          onNewHighlight={() => setCreateModal({ show: true, tab: 'highlight' })}
        />

        <PostGrid
          posts={posts}
          onPostClick={setActivePost}
          onAddPost={() => setCreateModal({ show: true, tab: 'post' })}
        />
      </div>

      {activeStory && (
        <StoryViewer highlight={activeStory} onClose={() => setActiveStory(null)} />
      )}

      {activePost && (
        <PostModal
          post={activePost}
          profile={profile}
          onClose={() => setActivePost(null)}
          onLike={handleLike}
        />
      )}

      {createModal.show && (
        <CreateModal
          initialTab={createModal.tab}
          profile={profile}
          highlights={highlights}
          onClose={() => setCreateModal({ show: false, tab: 'post' })}
          onSubmit={handleCreate}
        />
      )}
    </div>
  )
}
