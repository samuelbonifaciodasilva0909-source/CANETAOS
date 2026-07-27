"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import Script from "next/script"
import { pixelTrack } from "@/lib/analytics/meta-pixel"

export function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (!pixelId) return
    // The inline snippet below already fires the initial PageView — this
    // effect only covers subsequent client-side route changes (App Router
    // navigations don't reload the page, so fbq needs a manual nudge).
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    pixelTrack("PageView")
  }, [pixelId, pathname])

  if (!pixelId) return null

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  )
}
