'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface AttentionScrollNode<T extends HTMLElement> {
  node: T
  offsetTop: number
}

type AttentionScrollStep
  = | {
    type: 'brands'
    brands: AttentionScrollNode<HTMLElement>[]
  }
  | {
    type: 'line'
    words: AttentionScrollNode<HTMLSpanElement>[]
  }

const ATTENTION_PUNCTUATION_TOKEN_RE = /^[.,!?;:…%]+$/u
const ATTENTION_SCROLL_TRAVEL_FACTOR = 0.74
const ATTENTION_SCROLL_MIN_TRAVEL_FACTOR = 0.3
const ATTENTION_SCROLL_MAX_TRAVEL_FACTOR = 0.58
const ATTENTION_SCROLL_HOLD_FACTOR = 0.012
const ENTERPRISE_ATTENTION_SCROLL_TRAVEL_FACTOR = 0.66
const ENTERPRISE_ATTENTION_SCROLL_MIN_TRAVEL_FACTOR = 0.24
const ENTERPRISE_ATTENTION_SCROLL_MAX_TRAVEL_FACTOR = 0.44
const ENTERPRISE_ATTENTION_SCROLL_HOLD_FACTOR = 0.006

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export default function MarketingPageRuntime({
  nextSectionId,
  finalSectionId,
}: {
  nextSectionId: string
  finalSectionId?: string
}) {
  const pathname = usePathname()

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.r'))

    if (!elements.length) {
      return
    }

    if (typeof IntersectionObserver !== 'function') {
      elements.forEach(element => element.classList.add('v'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('v')
          }
        })
      },
      { threshold: 0.07, rootMargin: '0px 0px -40px 0px' },
    )

    elements.forEach(element => observer.observe(element))

    return () => {
      observer.disconnect()
    }
  }, [pathname])

  useEffect(() => {
    const timelines = Array.from(document.querySelectorAll<HTMLElement>('.solution-timeline'))

    if (!timelines.length) {
      return
    }

    const prefersReducedMotion
      = typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion || typeof IntersectionObserver !== 'function') {
      timelines.forEach(timeline => timeline.classList.add('is-revealed'))
      return
    }

    function revealTimeline(timeline: HTMLElement, observer: IntersectionObserver) {
      timeline.classList.add('is-revealed')
      observer.unobserve(timeline)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealTimeline(entry.target as HTMLElement, observer)
          }
        })
      },
      { threshold: 0.56, rootMargin: '0px 0px -4% 0px' },
    )

    timelines.forEach(timeline => observer.observe(timeline))

    return () => {
      observer.disconnect()
    }
  }, [pathname])

  useEffect(() => {
    const panels = Array.from(document.querySelectorAll<HTMLElement>('.panel-wrap')).filter(panel => Boolean(panel.id))
    const dots = Array.from(document.querySelectorAll<HTMLElement>('.tl-dot'))

    if (!panels.length || !dots.length) {
      return
    }

    let ticking = false

    function update() {
      ticking = false

      const midpoint = window.scrollY + window.innerHeight / 2
      let activeIndex = panels.findIndex((panel) => {
        const top = panel.offsetTop
        const bottom = top + panel.offsetHeight

        return midpoint >= top && midpoint < bottom
      })

      if (activeIndex === -1) {
        activeIndex = midpoint < panels[0].offsetTop ? 0 : panels.length - 1
      }

      dots.forEach((dot, index) => {
        dot.classList.toggle('a', index === activeIndex)
      })
    }

    function queueUpdate() {
      if (ticking) {
        return
      }

      ticking = true
      window.requestAnimationFrame(update)
    }

    const clickHandlers = dots.map((dot, index) => {
      function handleClick() {
        panels[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }

      dot.addEventListener('click', handleClick)
      return { dot, handleClick }
    })

    update()
    window.addEventListener('scroll', queueUpdate, { passive: true })
    window.addEventListener('resize', queueUpdate)

    return () => {
      clickHandlers.forEach(({ dot, handleClick }) => {
        dot.removeEventListener('click', handleClick)
      })
      window.removeEventListener('scroll', queueUpdate)
      window.removeEventListener('resize', queueUpdate)
    }
  }, [pathname])

  useEffect(() => {
    const section = document.getElementById('p1-scroll')
    const steps = section
      ? Array.from(section.querySelectorAll<HTMLElement>('[data-attention-step]'))
      : []
    const sticky = section?.querySelector<HTMLElement>('.panel-sticky')

    if (!section || !sticky || !steps.length) {
      return
    }

    const locale = document.documentElement.lang || 'en'
    const segmenter
      = typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
        ? new Intl.Segmenter(locale, { granularity: 'word' })
        : null
    const blocks = Array.from(section.querySelectorAll<HTMLElement>('.attention-scroll-block'))
    const copy = section.querySelector<HTMLElement>('.attention-scroll-copy')
    const dockNav = document.getElementById('dockNav')
    const isEnterprisePage = Boolean(section.closest('.enterprise-page'))

    if (!copy || !blocks.length) {
      return
    }

    let ticking = false
    let palette = {
      bg: [14, 17, 23] as [number, number, number],
      text: [232, 234, 240] as [number, number, number],
    }

    function parseRgbTriplet(value: string, fallback: [number, number, number]) {
      const parts = String(value)
        .trim()
        .split(/\s+/)
        .map(Number)
        .filter(Number.isFinite)

      return parts.length === 3
        ? ([parts[0], parts[1], parts[2]] as [number, number, number])
        : fallback
    }

    function readPalette() {
      const styles = getComputedStyle(document.documentElement)
      palette = {
        bg: parseRgbTriplet(styles.getPropertyValue('--bg-rgb'), [14, 17, 23]),
        text: parseRgbTriplet(styles.getPropertyValue('--text-rgb'), [232, 234, 240]),
      }
    }

    function splitLine(line: HTMLElement) {
      const text = line.textContent ?? ''
      line.setAttribute('aria-label', text)
      line.textContent = ''

      const segments = segmenter
        ? Array.from(segmenter.segment(text), part => part.segment)
        : text.split(/(\s+)/)
      const words: AttentionScrollNode<HTMLSpanElement>[] = []
      let previousWasWhitespace = false

      segments.forEach((segment) => {
        if (!segment) {
          return
        }

        if (/^\s+$/.test(segment)) {
          line.append(document.createTextNode(segment))
          previousWasWhitespace = true
          return
        }

        if (ATTENTION_PUNCTUATION_TOKEN_RE.test(segment) && !previousWasWhitespace && words.length) {
          // @ts-expect-error ignore
          words.at(-1).node.textContent += segment
          previousWasWhitespace = false
          return
        }

        const word = document.createElement('span')
        word.className = 'attention-scroll-word'
        word.textContent = segment
        line.append(word)
        words.push({ node: word, offsetTop: 0 })
        previousWasWhitespace = false
      })

      return words
    }

    const stepData: AttentionScrollStep[] = steps.map((step) => {
      if (step.dataset.attentionStep === 'brands') {
        return {
          type: 'brands',
          brands: Array.from(step.querySelectorAll<HTMLElement>('.attention-scroll-brand'), brand => ({
            node: brand,
            offsetTop: 0,
          })),
        }
      }

      return {
        type: 'line',
        words: splitLine(step),
      }
    })

    const layout = {
      sectionTop: section.offsetTop,
      firstCenter: 0,
      lastCenter: 0,
      travel: 1,
      copyOffsetTop: 0,
    }

    function applyColor(target: HTMLElement, progress: number) {
      const eased = progress * progress * (3 - 2 * progress)
      const alpha = clamp((progress - 0.05) / 0.22, 0, 1)
      const red = Math.round(palette.bg[0] + (palette.text[0] - palette.bg[0]) * eased)
      const green = Math.round(palette.bg[1] + (palette.text[1] - palette.bg[1]) * eased)
      const blue = Math.round(palette.bg[2] + (palette.text[2] - palette.bg[2]) * eased)
      const strokeAlpha = alpha === 0 ? '0' : ((1 - eased) * 0.08 * alpha).toFixed(3)
      const strokeColor = `rgba(${palette.text[0]}, ${palette.text[1]}, ${palette.text[2]}, ${strokeAlpha})`

      target.style.color = `rgb(${red} ${green} ${blue})`
      target.style.opacity = String(alpha)
      target.style.setProperty('-webkit-text-stroke-color', strokeColor)
      target.style.setProperty('text-stroke-color', strokeColor)
    }

    function remeasure() {
      if (!copy || !section || !sticky) {
        return
      }

      readPalette()
      const previousTransform = copy.style.transform
      copy.style.transform = 'translate3d(0, 0, 0)'
      const firstBlock = blocks[0]
      const lastBlock = blocks.at(-1)
      if (!lastBlock) {
        return
      }
      const firstCenter = firstBlock.offsetTop + firstBlock.offsetHeight / 2
      const lastCenter = lastBlock.offsetTop + lastBlock.offsetHeight / 2
      const contentTravel = Math.max(lastCenter - firstCenter, 1)
      const travelFactor = isEnterprisePage ? ENTERPRISE_ATTENTION_SCROLL_TRAVEL_FACTOR : ATTENTION_SCROLL_TRAVEL_FACTOR
      const minTravelFactor = isEnterprisePage ? ENTERPRISE_ATTENTION_SCROLL_MIN_TRAVEL_FACTOR : ATTENTION_SCROLL_MIN_TRAVEL_FACTOR
      const maxTravelFactor = isEnterprisePage ? ENTERPRISE_ATTENTION_SCROLL_MAX_TRAVEL_FACTOR : ATTENTION_SCROLL_MAX_TRAVEL_FACTOR
      const holdFactor = isEnterprisePage ? ENTERPRISE_ATTENTION_SCROLL_HOLD_FACTOR : ATTENTION_SCROLL_HOLD_FACTOR
      const travel = clamp(
        contentTravel * travelFactor,
        window.innerHeight * minTravelFactor,
        window.innerHeight * maxTravelFactor,
      )
      const hold = window.innerHeight * holdFactor

      section.style.height = `${Math.ceil(window.innerHeight + travel + hold)}px`
      layout.sectionTop = section.offsetTop
      layout.firstCenter = firstCenter
      layout.lastCenter = lastCenter
      layout.travel = travel

      const copyRect = copy.getBoundingClientRect()
      const stickyTop = sticky.getBoundingClientRect().top
      layout.copyOffsetTop = copyRect.top - stickyTop

      stepData.forEach((step) => {
        if (step.type === 'brands') {
          step.brands.forEach((brand) => {
            brand.offsetTop = brand.node.getBoundingClientRect().top - copyRect.top
          })
          return
        }

        step.words.forEach((word) => {
          word.offsetTop = word.node.getBoundingClientRect().top - copyRect.top
        })
      })

      copy.style.transform = previousTransform
    }

    function render() {
      if (!copy || !sticky) {
        return
      }

      ticking = false
      const trackProgress = clamp((window.scrollY - layout.sectionTop) / layout.travel, 0, 1)
      const dockRect
        = dockNav && dockNav.classList.contains('is-visible') ? dockNav.getBoundingClientRect() : null
      const stickyTop = sticky.getBoundingClientRect().top
      const copyBaseTop = stickyTop + layout.copyOffsetTop
      const anchorY = dockRect ? dockRect.top - 16 : window.innerHeight * 0.8
      const fadeRange = Math.max(84, window.innerHeight * 0.14)
      const startShift = window.innerHeight * 0.5 - layout.firstCenter
      const endShift = window.innerHeight * 0.5 - layout.lastCenter
      const shift = startShift + (endShift - startShift) * trackProgress

      copy.style.transform = `translate3d(0, ${shift}px, 0)`

      stepData.forEach((step) => {
        if (step.type === 'brands') {
          step.brands.forEach((brand, brandIndex) => {
            const brandTop = copyBaseTop + shift + brand.offsetTop
            const brandProgress = clamp((anchorY - (brandTop + brandIndex * 12)) / fadeRange, 0, 1)
            brand.node.style.opacity = String(0.12 + brandProgress * 0.88)
          })
          return
        }

        step.words.forEach((word, wordIndex) => {
          const wordTop = copyBaseTop + shift + word.offsetTop
          const wordProgress = clamp((anchorY - (wordTop + wordIndex * 3)) / fadeRange, 0, 1)
          applyColor(word.node, wordProgress)
        })
      })
    }

    function queue() {
      if (ticking) {
        return
      }

      ticking = true
      window.requestAnimationFrame(render)
    }

    function remeasureAndQueue() {
      remeasure()
      queue()
    }

    const rootObserver = new MutationObserver(() => {
      readPalette()
      queue()
    })
    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme-mode'],
    })

    remeasure()
    render()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', remeasureAndQueue)

    let isDisposed = false

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!isDisposed) {
          remeasureAndQueue()
        }
      })
    }

    return () => {
      isDisposed = true
      rootObserver.disconnect()
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', remeasureAndQueue)
    }
  }, [pathname])

  useEffect(() => {
    const heroNav = document.getElementById('heroNav')
    const dockNav = document.getElementById('dockNav')
    const nextSection = document.getElementById(nextSectionId)
    const finalSection = finalSectionId ? document.getElementById(finalSectionId) : null

    function sync() {
      if (!heroNav || !dockNav || !nextSection) {
        return
      }

      const reachedContent = nextSection.getBoundingClientRect().top <= window.innerHeight * 0.72
      const reachedFinal = finalSection
        ? finalSection.getBoundingClientRect().top <= window.innerHeight * 0.9
        : false
      const showDock = reachedContent && !reachedFinal

      heroNav.classList.toggle('is-hidden', reachedContent)
      dockNav.classList.toggle('is-visible', showDock)
      dockNav.setAttribute('aria-hidden', String(!showDock))
    }

    sync()
    window.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)

    return () => {
      window.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [finalSectionId, nextSectionId, pathname])

  useEffect(() => {
    const controls = Array.from(document.querySelectorAll<HTMLElement>('.site-language-control')).filter(
      control =>
        Boolean(control.querySelector('.site-language-trigger'))
        && Boolean(control.querySelector('.site-language-menu')),
    )

    if (!controls.length) {
      return
    }

    function setOpen(control: HTMLElement, open: boolean) {
      control.dataset.open = open ? 'true' : 'false'
      const button = control.querySelector<HTMLElement>('.site-language-trigger')
      if (button) {
        button.setAttribute('aria-expanded', String(open))
      }
    }

    function closeOtherControls(activeControl: HTMLElement) {
      controls.forEach((control) => {
        if (control === activeControl) {
          return
        }

        setOpen(control, false)

        const activeElement = document.activeElement
        if (activeElement instanceof HTMLElement && control.contains(activeElement)) {
          activeElement.blur()
        }
      })
    }

    const buttonHandlers = controls
      .map((control) => {
        const button = control.querySelector<HTMLElement>('.site-language-trigger')
        if (!button) {
          return null
        }

        setOpen(control, false)

        function handler(event: Event) {
          if (!button) {
            return null
          }

          event.preventDefault()
          event.stopPropagation()
          const nextOpen = control.dataset.open !== 'true'

          if (nextOpen) {
            closeOtherControls(control)
          }

          setOpen(control, nextOpen)

          if (!nextOpen && document.activeElement === button) {
            button.blur()
          }
        }

        button.addEventListener('click', handler)
        return { button, handler }
      })
      .filter(Boolean) as Array<{ button: HTMLElement, handler: EventListener }>

    const menuHandlers = controls
      .map((control) => {
        const menu = control.querySelector<HTMLElement>('.site-language-menu')
        if (!menu) {
          return null
        }

        function handler() {
          return setOpen(control, false)
        }
        menu.addEventListener('click', handler)
        return { menu, handler }
      })
      .filter(Boolean) as Array<{ menu: HTMLElement, handler: EventListener }>

    function handleDocumentClick(event: MouseEvent) {
      controls.forEach((control) => {
        if (!control.contains(event.target as Node)) {
          setOpen(control, false)
        }
      })
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return
      }

      const activeElement = document.activeElement

      controls.forEach((control) => {
        setOpen(control, false)

        if (activeElement instanceof HTMLElement && control.contains(activeElement)) {
          activeElement.blur()
        }
      })
    }

    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      buttonHandlers.forEach(({ button, handler }) => {
        button.removeEventListener('click', handler)
      })
      menuHandlers.forEach(({ menu, handler }) => {
        menu.removeEventListener('click', handler)
      })
      document.removeEventListener('click', handleDocumentClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [pathname])

  return null
}
