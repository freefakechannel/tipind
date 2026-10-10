"use client"

import { Slider } from "@base-ui/react/slider"

interface RangeSliderProps {
  formatValue: (value: number) => string
  max: number
  maximumLabel: string
  min: number
  minimumLabel: string
  step?: number
  value: readonly [number, number]
  onValueChange: (value: [number, number]) => void
}

const thumbClass =
  "relative block size-5 rounded-full border-2 border-primary bg-background shadow-md shadow-primary/25 transition-shadow hover:shadow-lg focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none"

export function RangeSlider({
  formatValue,
  max,
  maximumLabel,
  min,
  minimumLabel,
  onValueChange,
  step = 1,
  value,
}: RangeSliderProps) {
  const thumbs = [
    { index: 0, label: minimumLabel },
    { index: 1, label: maximumLabel },
  ]

  return (
    <Slider.Root<number[]>
      max={max}
      min={min}
      onValueChange={(next) => {
        onValueChange([next[0], next[1]])
      }}
      step={step}
      value={[...value]}
    >
      <Slider.Control className="relative flex h-8 w-full touch-none items-center px-2 select-none">
        <Slider.Track className="relative h-1.5 w-full grow rounded-full bg-muted">
          <Slider.Indicator className="absolute h-full rounded-full bg-linear-to-r from-primary to-highlight-400" />
        </Slider.Track>
        {thumbs.map(({ index, label }) => (
          <Slider.Thumb
            className={thumbClass}
            getAriaLabel={() => label}
            getAriaValueText={(_formatted, current) =>
              `${label}: ${formatValue(current)}`
            }
            index={index}
            key={index}
          />
        ))}
      </Slider.Control>
    </Slider.Root>
  )
}
