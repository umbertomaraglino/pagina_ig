import { Plus } from 'lucide-react'

export default function PostGrid({ posts, onPostClick, onAddPost }) {
  return (
    <div>
      <div className="flex border-t border-gray-200 dark:border-gray-800">
        <div className="flex-1 flex justify-center py-2.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-[22px] h-[22px]">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
      </div>

      {posts.length === 0 ? (
        <EmptyGrid onAddPost={onAddPost} />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-[1px] bg-white dark:bg-black">
            {posts.map(post => (
              <button
                key={post.id}
                onClick={() => onPostClick(post)}
                className="aspect-square overflow-hidden bg-white dark:bg-black relative group block"
              >
                <img
                  src={post.image_url}
                  alt={post.caption ?? ''}
                  className="absolute inset-0 w-full h-full object-cover active:opacity-80 transition-opacity"
                />
                {post.post_images?.length > 1 && (
                  <div className="absolute top-1.5 right-1.5 pointer-events-none">
                    <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 drop-shadow">
                      <rect x="1" y="5" width="11" height="11" rx="1.5" stroke="white" strokeWidth="1.8"/>
                      <rect x="5" y="1" width="11" height="11" rx="1.5" stroke="white" strokeWidth="1.8" fill="rgba(0,0,0,0.3)"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-center py-6">
            <button
              onClick={onAddPost}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-semibold active:opacity-60 transition-opacity"
            >
              <Plus size={16} strokeWidth={2.5} />
              Aggiungi foto
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function EmptyGrid({ onAddPost }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 px-8">
      <button
        onClick={onAddPost}
        className="w-[62px] h-[62px] rounded-full border-2 border-black dark:border-white flex items-center justify-center active:opacity-60 transition-opacity"
      >
        <Plus size={28} strokeWidth={1.5} />
      </button>
      <div className="text-center">
        <p className="font-bold text-[22px] tracking-tight mb-1">Condividi le foto</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Le foto che condividi appariranno nel tuo profilo.
        </p>
      </div>
    </div>
  )
}
