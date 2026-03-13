import * as React from "react"
import { cn } from "./base"

export const Tabs = ({ className, value, onValueChange, children, ...props }) => {
  return (
    <div className={cn("w-full", className)} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeValue: value, onValueChange })
        }
        return child
      })}
    </div>
  )
}

export const TabsList = ({ className, activeValue, onValueChange, children, ...props }) => {
  return (
    <div
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeValue, onValueChange })
        }
        return child
      })}
    </div>
  )
}

export const TabsTrigger = ({ className, value, activeValue, onValueChange, children, ...props }) => {
  const isActive = value === activeValue
  return (
    <button
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-background text-foreground shadow-md"
          : "hover:bg-background/20 hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export const TabsContent = ({ className, value, activeValue, children, ...props }) => {
  if (value !== activeValue) return null
  return (
    <div
      className={cn(
        "mt-6 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
