import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import PetVisual from './PetVisual'

export default function App() {
  const [sleeping, setSleeping] = useState(false)
  const [message, setMessage] = useState('点我跳一下，长按摸摸，按住拖动～')
  const [dragging, setDragging] = useState(false)
  const [reaction, setReaction] = useState('')
  const [tick, setTick] = useState(0)
  const [lookFrame, setLookFrame] = useState(3)
  const [looking, setLooking] = useState(false)
  const [blinking, setBlinking] = useState(false)
  const [holding, setHolding] = useState(false)
  const [walking, setWalking] = useState(false)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)
  const shell = useRef<HTMLElement>(null)
  const lastLook = useRef(0)
  const pointer = useRef<{ id: number; x: number; y: number; moved: boolean; held: boolean } | undefined>(undefined)
  const longTimer = useRef<number | undefined>(undefined)
  const idleTimer = useRef<number | undefined>(undefined)
  const skipClick = useRef(false)

  function react(action: string, text: string) {
    setSleeping(false); setReaction(action); setMessage(text); setTick(n => n + 1)
  }
  function pet() { react('pet', '好舒服呀～ ♡') }
  function stopPointer() {
    window.clearTimeout(longTimer.current)
    window.desktopPet?.endDrag()
    if (pointer.current?.moved) setMessage('在这里陪你～')
    pointer.current = undefined
    setDragging(false); setHolding(false)
  }
  function down(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return
    skipClick.current = false; setHolding(true); window.desktopPet?.setMode('holding')
    pointer.current = { id: event.pointerId, x: event.screenX, y: event.screenY, moved: false, held: false }
    event.currentTarget.setPointerCapture(event.pointerId)
    longTimer.current = window.setTimeout(() => {
      if (!pointer.current || pointer.current.moved) return
      pointer.current.held = true; skipClick.current = true; pet()
    }, 650)
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    if (!window.desktopPet) {
      const x = (event.clientX - box.left - box.width / 2) / box.width
      const y = (event.clientY - box.top - box.height / 2) / box.height
      setLookFrame(((Math.round(Math.atan2(y, x) / (Math.PI / 4)) + 3) % 8 + 8) % 8)
      setLooking(true); lastLook.current = Date.now()
    }
    const p = pointer.current
    if (!p || p.id !== event.pointerId || p.held) return
    if (!p.moved && Math.hypot(event.screenX - p.x, event.screenY - p.y) > 6) {
      window.clearTimeout(longTimer.current)
      p.moved = true; skipClick.current = true; setDragging(true); setSleeping(false)
      setMessage(window.desktopPet ? '带我去哪里呀？' : '浏览器预览：桌面拖动请在 EXE 中测试')
      window.desktopPet?.beginDrag()
    }
  }
  useEffect(() => {
    if (!reaction) return
    const timer = window.setTimeout(() => setReaction(''), 1400)
    return () => window.clearTimeout(timer)
  }, [reaction, tick])
  useEffect(() => {
    const resetIdle = () => {
      window.clearTimeout(idleTimer.current)
      idleTimer.current = window.setTimeout(() => { setSleeping(true); setMessage('好安静，打个盹……') }, 60000)
    }
    const cancel = () => {
      window.clearTimeout(longTimer.current); window.desktopPet?.endDrag()
      pointer.current = undefined; setDragging(false); setHolding(false)
    }
    resetIdle()
    window.addEventListener('pointerdown', resetIdle)
    window.addEventListener('keydown', resetIdle)
    window.addEventListener('blur', cancel)
    const unsubscribe = window.desktopPet?.onPointer(point => {
      setWalking(point.walking); setDirection(point.direction); setPaused(point.paused)
      if (point.moved) lastLook.current = Date.now()
      setLooking(Date.now() - lastLook.current < 1800)
      setLookFrame(((Math.round(Math.atan2(point.y, point.x) / (Math.PI / 4)) + 3) % 8 + 8) % 8)
      const canvas = shell.current?.querySelector('canvas')
      let hit = false
      if (canvas) {
        const r = canvas.getBoundingClientRect()
        if (point.clientX >= r.left && point.clientX < r.right && point.clientY >= r.top && point.clientY < r.bottom) {
          const alpha = canvas.getContext('2d', { willReadFrequently: true })?.getImageData(Math.floor((point.clientX-r.left)/r.width*512),Math.floor((point.clientY-r.top)/r.height*512),1,1).data[3] ?? 0
          hit = alpha > 32
        }
      }
      const nav = shell.current?.querySelector('nav')
      if (nav && Number(getComputedStyle(nav).opacity) > .5) {
        const r = nav.getBoundingClientRect()
        hit ||= point.clientX >= r.left && point.clientX <= r.right && point.clientY >= r.top && point.clientY <= r.bottom
      }
      window.desktopPet?.setInteractive(hit)
    })
    return () => {
      window.clearTimeout(longTimer.current); window.clearTimeout(idleTimer.current)
      window.removeEventListener('pointerdown', resetIdle); window.removeEventListener('keydown', resetIdle)
      window.removeEventListener('blur', cancel); unsubscribe?.(); window.desktopPet?.endDrag()
    }
  }, [])
  useEffect(() => {
    window.desktopPet?.setMode(holding || dragging ? 'holding' : sleeping ? 'sleep' : reaction ? 'reaction' : 'idle')
  }, [holding, dragging, sleeping, reaction])
  useEffect(() => {
    let next: number, end: number
    const schedule = () => { next = window.setTimeout(() => {
      setBlinking(true)
      end = window.setTimeout(() => { setBlinking(false); schedule() }, 700)
    }, 4000 + Math.random() * 4000) }
    schedule()
    const preview = window.desktopPet ? undefined : window.setInterval(() => {
      setLooking(Date.now() - lastLook.current < 1800)
    }, 250)
    return () => { window.clearTimeout(next); window.clearTimeout(end); window.clearInterval(preview) }
  }, [])
  const action = paused ? 'idle' : sleeping ? 'sleep' : dragging || walking ? 'walk' : reaction ? 'idle' : blinking ? 'blink' : looking ? 'look' : 'idle'
  return (
    <main ref={shell} className="pet-shell" aria-label="蓝色恐龙桌宠">
      <nav className="pet-toolbar" aria-label="互动菜单">
        <button type="button" onClick={pet}>♡ 摸摸</button>
        <button type="button" aria-pressed={sleeping} onClick={() => { setReaction(''); setSleeping(true); setMessage('晚安，呼呼……') }}>☾ 睡觉</button>
        <button type="button" onClick={() => react('happy', '醒啦！陪你待一会儿～')}>☀ 唤醒</button>
      </nav>
      <p className="pet-message" role="status">{message}</p>
      <button type="button" data-action={action} data-holding={holding} className={`pet-character ${sleeping ? 'sleeping' : ''} ${dragging ? 'dragging' : ''}`} aria-label="摸摸蓝色恐龙"
        onPointerDown={down} onPointerMove={move} onPointerUp={stopPointer} onPointerCancel={() => { skipClick.current = true; stopPointer() }}
        onLostPointerCapture={stopPointer} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') skipClick.current = false }} onClick={() => { if (!skipClick.current) react('jump', '嘿咻！') }}>
        <span className="pet-facing"><span key={tick} className={`pet-reaction reaction-${reaction}`}><span className="pet-breathe"><PetVisual action={action} lookFrame={lookFrame} direction={direction}/></span></span></span>
        {reaction === 'pet' && <span key={`hearts-${tick}`} className="pet-hearts" aria-hidden="true"><span>♡</span><span>♡</span><span>♡</span></span>}
        {sleeping && <span className="pet-zzz" aria-hidden="true">Z z z</span>}
      </button>
    </main>
  )
}
