import { cn } from "@/lib/utils"
import { CheckCircle } from "lucide-react"

interface StepProps {
  title: string
  description?: string
  completed: boolean
  isLast?: boolean
}

const Step = ({ title, description, completed, isLast = false }: StepProps) => {
  return (
    <div className="flex flex-col items-center relative">
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full",
          completed ? "bg-black text-white" : "bg-gray-200 text-gray-500",
        )}
      >
        {completed && <CheckCircle className="w-5 h-5" />}
      </div>
      <div className="mt-2 text-center">
        <p className="text-xs font-medium">{title}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      {!isLast && (
        <div className="absolute top-4 left-[50%] w-full h-0.5 bg-gray-200 -z-10">
          <div className={cn("h-full bg-black", completed ? "w-full" : "w-0")} />
        </div>
      )}
    </div>
  )
}

interface StepperProps {
  steps: {
    title: string
    description?: string
    completed: boolean
  }[]
  className?: string
}

export function Stepper({ steps = [], className }: StepperProps) {
  // Add a default empty array to prevent the error when steps is undefined
  const safeSteps = steps || []

  return (
    <div className={cn("relative flex justify-between w-full", className)}>
      {safeSteps.map((step, index) => (
        <Step
          key={index}
          title={step.title}
          description={step.description}
          completed={step.completed}
          isLast={index === safeSteps.length - 1}
        />
      ))}
      {safeSteps.length > 0 && <div className="absolute top-4 left-[4%] right-[4%] h-0.5 bg-gray-200 -z-10" />}
    </div>
  )
}

