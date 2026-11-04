import { useState } from 'react'

export default function App() {
  const [sleeping, setSleeping] = useState(false)
  const [message, setMessage] = useState('你好呀，把鼠标移过来吧～')

  function pet() {
    setMessage(sleeping ? '呼呼……先让我睡一会儿～' : '好舒服呀～')
  }

  return (
    <main className="pet-shell" aria-label="蓝色恐龙桌宠">
      <nav className="pet-toolbar" aria-label="互动菜单">
        <button type="button" onClick={pet}>
          ♡ 摸摸
        </button>
        <button
          type="button"
          aria-pressed={sleeping}
          onClick={() => {
            setSleeping(true)
            setMessage('晚安，呼呼……')
          }}
        >
          ☾ 睡觉
        </button>
        <button
          type="button"
          onClick={() => {
            setSleeping(false)
            setMessage('醒啦！陪你待一会儿～')
          }}
        >
          ☀ 唤醒
        </button>
      </nav>

      <p className="pet-message" role="status">{message}</p>

      <button
        type="button"
        className={`pet-character ${sleeping ? 'sleeping' : ''}`}
        aria-label="摸摸蓝色恐龙"
        onClick={pet}
      >
        <img
          src={`${import.meta.env.BASE_URL}blue-dino.png`}
          alt="蓝色恐龙毛绒桌宠"
          draggable={false}
        />
      </button>
    </main>
  )
}