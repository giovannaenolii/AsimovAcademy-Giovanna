import { useEffect, useRef, useState, Suspense, lazy } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import styles from './Hero.module.css'

const Scene3D = lazy(() => import('./Scene3D'))

const bullets = [
  { label: 'Conteúdo prático', detail: '+40 horas de conteúdo direto ao ponto' },
  { label: 'Projetos com IA', detail: 'Projetos com Python + IA desde o módulo 1' },
  { label: 'Comunidade ativa', detail: 'Suporte da comunidade com +20.000 alunos' },
  { label: 'Certificado reconhecido', detail: 'Certificado reconhecido pelo mercado' },
]

const codeSnippets = [
  { lines: ['>>> import intelligence', '>>> model = AI.load("python")', '>>> model.train(you)', '>>> print(your_future)'], duration: 3 },
  { lines: ['>>> data = load_dataset()', '>>> train_model(data)', '>>> accuracy = 0.98', '>>> 🚀 Ready to deploy'], duration: 3 },
  { lines: ['>>> def create_magic():', '...     return genius()', '>>> result = create_magic()', '>>> print(result)'], duration: 3 },
]

function TypingText({ text, isErasing = false }) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    let i = isErasing ? text.length : 0

    const iv = setInterval(() => {
      if (isErasing) {
        i--
        setDisplayed(text.slice(0, i))
        if (i <= 0) clearInterval(iv)
      } else {
        setDisplayed(text.slice(0, i + 1))
        i++
        if (i >= text.length) clearInterval(iv)
      }
    }, 40)

    return () => clearInterval(iv)
  }, [text, isErasing])

  return (
    <span>
      {displayed}
      {displayed.length < text.length && displayed.length > 0 && (
        <span className={styles.blinkCursor}>▋</span>
      )}
    </span>
  )
}

function CountUp({ target, suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        let current = 0
        const step = target / 60
        const iv = setInterval(() => {
          current = Math.min(current + step, target)
          setVal(Math.floor(current))
          if (current >= target) clearInterval(iv)
        }, 16)
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{val}{suffix}</span>
}

function TerminalLoop() {
  const [snippetIndex, setSnippetIndex] = useState(0)
  const [phase, setPhase] = useState('typing')
  const [lineIndex, setLineIndex] = useState(0)
  const currentSnippet = codeSnippets[snippetIndex]

  useEffect(() => {
    if (phase === 'typing' && lineIndex < currentSnippet.lines.length) {
      const timer = setTimeout(() => {
        setLineIndex(prev => prev + 1)
      }, 2500)
      return () => clearTimeout(timer)
    }

    if (phase === 'typing' && lineIndex >= currentSnippet.lines.length) {
      const timer = setTimeout(() => {
        setPhase('erasing')
      }, 2000)
      return () => clearTimeout(timer)
    }

    if (phase === 'erasing') {
      const timer = setTimeout(() => {
        setSnippetIndex((prev) => (prev + 1) % codeSnippets.length)
        setLineIndex(0)
        setPhase('typing')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [phase, lineIndex, currentSnippet.lines.length])

  return (
    <>
      {currentSnippet.lines.map((line, i) => (
        <div key={i} className={styles.termLine}>
          {i < lineIndex ? (
            <span>{line}</span>
          ) : i === lineIndex ? (
            <TypingText text={line} isErasing={false} />
          ) : null}
        </div>
      ))}
      {phase === 'erasing' && lineIndex >= currentSnippet.lines.length && (
        <div className={styles.termLine} style={{ opacity: 0.5 }}>
          <TypingText text="Próximo passo..." isErasing={true} />
        </div>
      )}
    </>
  )
}

export default function Hero() {
  const mousePos = useRef({ x: 0, y: 0 })
  const heroRef = useRef(null)
  const { scrollY } = useScroll()
  const parallaxY = useSpring(useTransform(scrollY, [0, 500], [0, -80]), { stiffness: 100, damping: 30 })
  const opacity = useTransform(scrollY, [0, 400], [1, 0])

  useEffect(() => {
    const onMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }
    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <motion.section ref={heroRef} className={styles.hero} style={{ opacity }}>

      {/* ── Camadas de fundo ── */}
      <div className={styles.bgWave} />
      <div className={styles.bgGlow} />
      <div className={styles.bgGrid} />
      <div className={styles.bgRadial} />
      <div className={styles.scanline} />

      {/* ── Canvas 3D ── */}
      <div className={styles.canvasAbs}>
        <div className={styles.canvasMask}>
          <Suspense fallback={null}>
            <Scene3D mousePos={mousePos} />
          </Suspense>
        </div>
      </div>

      {/* ── Cards flutuantes ── */}
      <motion.div
        className={`${styles.statCard} ${styles.statCard1}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <div className={styles.statValue}><CountUp target={40} suffix="h+" /></div>
        <div className={styles.statLabel}>de conteúdo</div>
      </motion.div>

      <motion.div
        className={`${styles.statCard} ${styles.statCard2}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.7, duration: 0.6 }}
      >
        <div className={styles.statValue}><CountUp target={98} suffix="%" /></div>
        <div className={styles.statLabel}>satisfação</div>
      </motion.div>

      {/* ── Terminal ── */}
      <motion.div
        className={styles.terminal}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.7 }}
      >
        <div className={styles.terminalHeader}>
          <span className={styles.termDot} style={{ background: '#ff5f57' }} />
          <span className={styles.termDot} style={{ background: '#ffbd2e' }} />
          <span className={styles.termDot} style={{ background: '#28ca41' }} />
          <span className={styles.termTitle}>python_ai.py</span>
        </div>
        <div className={styles.terminalBody}>
          <TerminalLoop />
        </div>
      </motion.div>

      {/* ── Nav ── */}
      <motion.nav
        className={styles.nav}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className={styles.logo}>
          <span className={styles.logoDot} />
          <span>PyAI<span className={styles.logoAccent}>.dev</span></span>
        </div>
        <div className={styles.navLinks}>
          <a href="#">Módulos</a>
          <a href="#">Projetos</a>
          <a href="#">Comunidade</a>
          <a href="#" className={styles.navCta}>Entrar</a>
        </div>
      </motion.nav>

      {/* ── Conteúdo na esquerda ── */}
      <div className={styles.content}>
        <motion.div
          className={styles.left}
          style={{ y: parallaxY }}
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          {/* Headline */}
          <motion.h1
            className={styles.headline}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <span className={styles.headlineNormal}>Aprenda Python do </span>
            <br />
            <span className={styles.headlineNormal}>zero e </span>
            <span className={styles.headlinePurple}>construa </span>
            <br />
            <span className={styles.headlinePurple}>projetos reais </span>
            <span className={styles.headlineNormal}>com IA</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className={styles.sub}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            O curso mais prático do Brasil para quem quer entrar em tecnologia sem enrolação.
          </motion.p>

          <motion.ul
            className={styles.bullets}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
          >
            {bullets.map((b, i) => (
              <motion.li
                key={i}
                className={styles.bullet}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.75 + i * 0.1, duration: 0.5 }}
              >
                <span className={styles.bulletMarker} />
                <div className={styles.bulletContent}>
                  <span className={styles.bulletLabel}>{b.detail}</span>
                </div>
              </motion.li>
            ))}
          </motion.ul>

          {/* CTAs */}
          <motion.div
            className={styles.ctas}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            <button className={styles.ctaPrimary}>
              <span className={styles.ctaText}>QUERO COMEÇAR AGORA</span>
              <div className={styles.ctaGlow} />
            </button>
            <button className={styles.ctaSecondary}>
              Ver o que vou aprender
            </button>
          </motion.div>

          <motion.div
            className={styles.proof}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.25, duration: 0.6 }}
          >
            <div className={styles.proofAvatars}>
              <div className={styles.avatar}></div>
              <div className={styles.avatar}></div>
              <div className={styles.avatar}></div>
              <div className={styles.avatar}></div>
              <div className={styles.avatar}></div>
            </div>
            <p className={styles.proofText}>
              <span className={styles.proofCount}>20.000+</span> alunos transformando carreiras
            </p>
            <div className={styles.proofStars}>
              <div className={styles.starGroup}>★ ★ ★ ★ ★</div>
              <span className={styles.ratingScore}>4.9</span>
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className={styles.scrollHint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0, duration: 0.6 }}
      >
        <div className={styles.scrollMouse}>
          <div className={styles.scrollWheel} />
        </div>
        <span>Scroll para explorar</span>
      </motion.div>

    </motion.section>
  )
}