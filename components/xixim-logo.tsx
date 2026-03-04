export function XiximLogo({
  className = "",
  size = "default",
}: { className?: string; size?: "small" | "default" | "large" }) {
  const sizes = {
    small: { width: 32, height: 32, textSize: "text-sm" },
    default: { width: 40, height: 40, textSize: "text-lg" },
    large: { width: 56, height: 56, textSize: "text-2xl" },
  }

  const { width, height, textSize } = sizes[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img src="/images/xixim-1.webp" alt="XIXIM Logo" width={width} height={height} className="object-contain" />
      <div className="flex flex-col">
        <span className={`font-bold tracking-wide ${textSize}`}>XIXIM</span>
        <span className="text-xs text-muted-foreground hidden sm:block">Clúster de Innovación y Tecnología</span>
      </div>
    </div>
  )
}

export function XiximLogoIcon({ className = "", size = 32 }: { className?: string; size?: number }) {
  return (
    <img src="/images/xixim-1.webp" alt="XIXIM" width={size} height={size} className={`object-contain ${className}`} />
  )
}
