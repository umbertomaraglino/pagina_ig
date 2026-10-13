import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { RotateCcw, RotateCw, Check, X } from 'lucide-react'

async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const maxSize = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  canvas.width = safeArea
  canvas.height = safeArea

  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-safeArea / 2, -safeArea / 2)
  ctx.drawImage(image, safeArea / 2 - image.width / 2, safeArea / 2 - image.height / 2)

  const data = ctx.getImageData(0, 0, safeArea, safeArea)

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y),
  )

  return new Promise((resolve) => {
    canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.92)
  })
}

export default function ImageEditor({ src, onConfirm, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [confirming, setConfirming] = useState(false)

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels)
  }, [])

  async function confirm() {
    if (!croppedAreaPixels) return
    setConfirming(true)
    try {
      const blob = await getCroppedImg(src, croppedAreaPixels, rotation)
      const file = new File([blob], 'story.jpg', { type: 'image/jpeg' })
      onConfirm(file, URL.createObjectURL(blob))
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Toolbar top */}
      <div className="flex items-center justify-between px-4 h-12 flex-shrink-0 z-10">
        <button onClick={onCancel} className="p-1">
          <X size={24} color="white" />
        </button>
        <span className="text-white text-sm font-semibold">Modifica foto</span>
        <button
          onClick={confirm}
          disabled={confirming}
          className="p-1 disabled:opacity-50"
        >
          <Check size={24} color="white" />
        </button>
      </div>

      {/* Cropper area */}
      <div className="flex-1 relative">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={9 / 16}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { background: '#000' },
            cropAreaStyle: { border: '2px solid rgba(255,255,255,0.7)' },
          }}
        />
      </div>

      {/* Toolbar bottom */}
      <div className="flex-shrink-0 pb-safe">
        {/* Slider zoom */}
        <div className="px-6 pt-4 pb-2 flex items-center gap-3">
          <span className="text-white/50 text-xs w-4">1×</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1 accent-white h-1"
          />
          <span className="text-white/50 text-xs w-4">3×</span>
        </div>

        {/* Rotazione */}
        <div className="flex justify-center gap-8 pb-5">
          <button
            onClick={() => setRotation(r => r - 90)}
            className="flex flex-col items-center gap-1"
          >
            <RotateCcw size={22} color="white" />
            <span className="text-white/60 text-[10px]">-90°</span>
          </button>
          <button
            onClick={() => setRotation(0)}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-white text-base font-semibold">{rotation}°</span>
            <span className="text-white/60 text-[10px]">Reset</span>
          </button>
          <button
            onClick={() => setRotation(r => r + 90)}
            className="flex flex-col items-center gap-1"
          >
            <RotateCw size={22} color="white" />
            <span className="text-white/60 text-[10px]">+90°</span>
          </button>
        </div>
      </div>
    </div>
  )
}
