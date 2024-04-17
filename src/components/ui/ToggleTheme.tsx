import { useEffect, useState } from 'react'
import { cn } from '../../utils/utils'

export function useMounted() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}

const SunIcon = ({ className }: { className: string }) => (
  <>
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('sun-icon', className)}
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  </>
)

const MoonIcon = ({ className }: { className: string }) => (
  <>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      className={cn('moon-icon', className)}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3h.393a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992z"
      ></path>
    </svg>
  </>
)

export function ToggleTheme({ classes }: { classes: { button?: string; icon?: string } }) {
  const [theme, setTheme] = useState(() => {
    if (import.meta.env.SSR) {
      return undefined
    }

    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme')
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }

    return 'light'
  })

  const toggleTheme = () => {
    const t = theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', t)
    setTheme(t)
  }

  const mounted = useMounted()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
    }
  }, [theme])

  const buttonClass =
    classes?.button ??
    `
      text-heading

      inline-flex
      items-center
      justify-center
      rounded-md
      text-sm
      font-medium
      transition-colors

      disabled:opacity-50
      disabled:pointer-events-none
      size-10

      sine
      hover:bg-primary
      hover:text-white
    `

  const iconClass = classes?.icon ?? 'size-4'

  return mounted ? (
    <button role="button" onClick={toggleTheme} className={buttonClass}>
      <span className="sr-only">Toggle mode</span>

      {theme !== 'dark' ? <SunIcon className={iconClass} /> : <MoonIcon className={iconClass} />}
    </button>
  ) : (
    <div />
  )
}
