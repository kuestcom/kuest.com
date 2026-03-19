import Image from 'next/image'
import KuestMark from '@/components/KuestMark'

export default function SiteFooter({
  note,
  docsLabel,
  contactLabel,
  xLabel,
  discordLabel,
}: {
  note: string
  docsLabel: string
  contactLabel: string
  xLabel: string
  discordLabel: string
}) {
  return (
    <footer>
      <div className="foot-brand">
        <div className="nav-logo gap-2 font-sans text-[15px] font-bold text-muted">
          <KuestMark />
          Kuest
        </div>
        <div className="foot-note">{note}</div>
      </div>
      <div className="foot-links">
        <a
          id="footerDocsLink"
          className="foot-link-icon"
          href="https://kuest.com/docs/owners"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={docsLabel}
          title={docsLabel}
        >
          <Image src="/assets/images/docs.svg" alt="" width={21} height={21} />
        </a>
        <a
          id="footerMailLink"
          className="foot-link-icon"
          href="mailto:hello@kuest.com"
          aria-label={contactLabel}
          title={contactLabel}
        >
          <Image src="/assets/images/mail.svg" alt="" width={20} height={20} />
        </a>
        <a
          id="footerXLink"
          className="foot-link-icon"
          href="https://x.com/kuest"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={xLabel}
          title={xLabel}
        >
          <Image src="/assets/images/x.svg" alt="" width={20} height={20} />
        </a>
        <a
          id="footerDiscordLink"
          className="foot-link-icon"
          href="https://discord.gg/kuest"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={discordLabel}
          title={discordLabel}
        >
          <Image src="/assets/images/discord.svg" alt="" width={20} height={20} />
        </a>
      </div>
    </footer>
  )
}
