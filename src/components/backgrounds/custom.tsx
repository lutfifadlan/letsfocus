
import DotPattern from '@/components/ui/dot-pattern'
import { cn } from '@/lib/utils'
import AnimatedGridPattern from '../ui/animated-grid-pattern'
import RetroGrid from '../ui/retro-grid'

const defaultBackground = () => {
  return (
    <DotPattern
      width={20}
      height={20}
      cx={1}
      cy={1}
      cr={1}
      className={cn(
      "mt-1",
        "[mask-image:linear-gradient(to_bottom,white,white,white,white,transparent)]"
      )}
    />
  )
}

export default function CustomBackground({ type }: { type: string }) {
  switch (type) {
    case 'dot':
      return (
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1}
          className={cn(
            "mt-1",
            "[mask-image:linear-gradient(to_bottom,white,white,white,white,transparent)]"
          )}
        />
      )
    case 'animated-grid':
      return (
        <div className="fixed inset-0 h-full w-full skew-y-12 overflow-hidden">
          <AnimatedGridPattern
            numSquares={40}
            maxOpacity={0.1}
            duration={4}
            repeatDelay={2}
            className={cn(
              "[mask-image:radial-gradient(500px_circle_at_center,white,white)]",
            )}
          />
        </div>
      )
    case 'retro-grid':
      return (
        <RetroGrid />
      )
    default:
      return defaultBackground()
  }
}
