import { useEffect, useRef } from 'react'
import animationManifest from '../public/animations/manifest.json'
type Clip = { sheet: string; columns: number; rows: number; indices: number[]; fps: number; loop?: boolean }
type Manifest = { actions?: Record<string, Clip> }
function ClipCanvas({ clip, fixedFrame, facing }: { clip?: Clip; fixedFrame?: number; facing: number }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const image = new Image()
    const abort = new AbortController()
    const runtime = { fallback: false }
    let timer: number | undefined, position = 0
    function draw() {
      if (abort.signal.aborted) return
      const ctx = canvas.current?.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      ctx.clearRect(0, 0, 512, 512)
      ctx.save()
      if (facing < 0) { ctx.translate(512, 0); ctx.scale(-1, 1) }
      if (clip && !runtime.fallback) {
        const index = fixedFrame ?? clip.indices[position]
        const w = image.naturalWidth / clip.columns, h = image.naturalHeight / clip.rows
        ctx.drawImage(image, index % clip.columns * w, Math.floor(index / clip.columns) * h, w, h, 0, 0, 512, 512)
      } else {
        const h = 440, w = image.naturalWidth / image.naturalHeight * h
        ctx.drawImage(image, (512 - w) / 2, 480 - h, w, h)
      }
      ctx.restore()
      window.desktopPet?.ready()
    }
    image.onload = () => {
      draw()
      if (clip && fixedFrame === undefined && clip.indices.length > 1) timer = window.setInterval(() => {
        position = clip.loop === false ? Math.min(position + 1, clip.indices.length - 1) : (position + 1) % clip.indices.length
        draw()
      }, 1000 / clip.fps)
    }
    image.onerror = () => { if (!clip) return; image.onerror = null; runtime.fallback = true; image.src = `${import.meta.env.BASE_URL}blue-dino.png` }
    image.src = `${import.meta.env.BASE_URL}${clip ? `animations/${clip.sheet}` : 'blue-dino.png'}`
    return () => { abort.abort(); window.clearInterval(timer) }
  }, [clip, fixedFrame, facing])
  return <canvas ref={canvas} width={512} height={512} role="img" aria-label="蓝色恐龙毛绒桌宠" />
}
export default function PetVisual({ action, lookFrame, direction }: { action: string; lookFrame: number; direction: number }) {
  const manifest: Manifest = animationManifest
  const clip = manifest.actions?.[action] ?? manifest.actions?.idle
  const valid = !!clip && /^[a-zA-Z0-9_-]+\.png$/.test(clip.sheet) &&
    Number.isInteger(clip.columns) && clip.columns > 0 && Number.isInteger(clip.rows) && clip.rows > 0 &&
    Array.isArray(clip.indices) && clip.indices.length > 0 && clip.indices.every(i => Number.isInteger(i) && i >= 0 && i < clip.columns * clip.rows) &&
    Number.isFinite(clip.fps) && clip.fps > 0 && clip.fps <= 30
  return <ClipCanvas clip={valid ? clip : undefined} fixedFrame={action === 'look' ? lookFrame : undefined} facing={action === 'walk' ? direction : 1} />
}
