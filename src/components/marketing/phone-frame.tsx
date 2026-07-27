import Image from "next/image"
import { cn } from "@/lib/utils"

interface PhoneFrameProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  width?: number
}

const NATIVE_WIDTH = 390
const NATIVE_HEIGHT = 844

export function PhoneFrame({ src, alt, className, priority, width = 260 }: PhoneFrameProps) {
  const height = Math.round((width / NATIVE_WIDTH) * NATIVE_HEIGHT)

  return (
    <div
      className={cn(
        "relative rounded-[2.2rem] border border-mkt-line bg-mkt-bg-soft p-2 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)]",
        className
      )}
      style={{ width }}
    >
      <div className="absolute left-1/2 top-3.5 z-10 h-1.5 w-14 -translate-x-1/2 rounded-full bg-mkt-bg" />
      <div className="overflow-hidden rounded-[1.6rem] border border-mkt-line/60">
        <Image
          src={src}
          alt={alt}
          width={NATIVE_WIDTH}
          height={NATIVE_HEIGHT}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes={`${width}px`}
          className="block h-auto w-full"
        />
      </div>
    </div>
  )
}
