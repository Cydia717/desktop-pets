export {}
declare global {
  interface Window {
    desktopPet?: {
      ready(): void
      beginDrag(): void
      endDrag(): void
      setMode(mode: 'idle' | 'sleep' | 'holding' | 'reaction'): void
      setInteractive(value: boolean): void
      onPointer(callback: (point: { x: number; y: number; clientX: number; clientY: number; walking: boolean; direction: number; paused: boolean; moved: boolean }) => void): () => void
    }
  }
}
