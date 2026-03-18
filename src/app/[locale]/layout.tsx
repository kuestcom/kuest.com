import type { Metadata, Viewport } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { geistMono, openSauceOne } from '@/lib/fonts'
import Script from 'next/script'

export async function generateViewport(): Promise<Viewport> {
  return {
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#CDFF00' },
      { media: '(prefers-color-scheme: dark)', color: '#CDFF00' },
    ],
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      template: `%s | Kuest`,
      default: `Kuest | Create Your Own White-Label Prediction Market`,
    },
    description: 'Create your own white-label prediction market in 15 minutes. Launch under your brand, set your fees, use your domain, and start with shared liquidity from day one.',
    icons: {
      icon: '/images/kuest-logo.svg',
      apple: '/images/kuest-logo.svg',
      shortcut: '/images/kuest-logo.svg',
    },
  }
}

export async function generateStaticParams() {
  return [{ locale: 'en' }]
}

export default async function LocaleLayout({ params, children }: LayoutProps<'/[locale]'>) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return (
      <html
          lang={locale}
          className={`${openSauceOne.variable} ${geistMono.variable}`}
          suppressHydrationWarning
      >
        <body className="flex min-h-screen flex-col font-sans">
          <NextIntlClientProvider locale={locale}>
            {children}
          </NextIntlClientProvider>
        </body>
        <Script
            id="timeline"
            dangerouslySetInnerHTML={{
              __html: `const panels=[...document.querySelectorAll('.panel-wrap')].map(el=>el.id).filter(Boolean);
                        const dots=document.querySelectorAll('.tl-dot');
                        function updateSpine(){
                          const mid=window.innerHeight/2+scrollY;
                          let active=0;
                          panels.forEach((id,i)=>{
                            const el=document.getElementById(id);
                            if(!el)return;
                            const top=el.offsetTop,bot=top+el.offsetHeight;
                            if(mid>=top&&mid<bot)active=i;
                          });
                          dots.forEach(d=>d.classList.toggle('a',Number(d.dataset.p)===active));
                        }
                        window.addEventListener('scroll',updateSpine,{passive:true});
                        dots.forEach(d=>d.addEventListener('click',()=>{
                          const id=panels[Number(d.dataset.p)];
                          const el=id?document.getElementById(id):null;
                          if(el)el.scrollIntoView({behavior:'smooth'});
                        }));`,
            }}
        />
      </html>
  )
}
