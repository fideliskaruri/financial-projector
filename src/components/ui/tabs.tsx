import { cn } from "@/lib/utils"
import { createContext, useContext, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react"

type TabsContextValue = { value: string; onChange: (v: string) => void }

const TabsContext = createContext<TabsContextValue>({ value: "", onChange: () => {} })

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
  ...props
}: {
  defaultValue?: string
  value?: string
  onValueChange?: (v: string) => void
  children: ReactNode
} & HTMLAttributes<HTMLDivElement>) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? controlledValue ?? "")
  const value = controlledValue ?? internalValue

  const handleChange = (nextValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(nextValue)
    }
    onValueChange?.(nextValue)
  }

  return (
    <TabsContext.Provider value={{ value, onChange: handleChange }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)} {...props} />
}

export function TabsTrigger({ value, className, onClick, ...props }: { value: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = useContext(TabsContext)

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all",
        ctx.value === value ? "bg-background text-foreground shadow-sm" : "hover:text-foreground/80",
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) {
          ctx.onChange(value)
        }
      }}
      {...props}
    />
  )
}

export function TabsContent({ value, className, ...props }: { value: string } & HTMLAttributes<HTMLDivElement>) {
  const ctx = useContext(TabsContext)
  if (ctx.value !== value) return null
  return <div className={cn("mt-4", className)} {...props} />
}
