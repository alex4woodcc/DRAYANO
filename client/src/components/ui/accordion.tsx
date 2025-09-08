/**
 * Accessible accordion primitives with explicit ARIA links and
 * dark-mode friendly focus management.
 */
import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

// Share a generated id between trigger and content so ARIA attributes align
const AccordionItemContext = React.createContext<string | null>(null)

const Accordion = AccordionPrimitive.Root

/**
 * Wraps a Radix Accordion item and provides an id to descendant components.
 */
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => {
  const id = React.useId()
  return (
    <AccordionItemContext.Provider value={id}>
      <AccordionPrimitive.Item
        ref={ref}
        id={id}
        className={cn("border-b", className)}
        {...props}
      />
    </AccordionItemContext.Provider>
  )
})
AccordionItem.displayName = "AccordionItem"

/**
 * Header button that toggles its associated accordion panel.
 */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const itemId = React.useContext(AccordionItemContext)
  const triggerId = itemId ? `${itemId}-trigger` : undefined
  const contentId = itemId ? `${itemId}-content` : undefined

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        id={triggerId}
        aria-controls={contentId}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
})
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

/**
 * Collapsible region controlled by AccordionTrigger.
 */
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const itemId = React.useContext(AccordionItemContext)
  const triggerId = itemId ? `${itemId}-trigger` : undefined
  const contentId = itemId ? `${itemId}-content` : undefined
  return (
    <AccordionPrimitive.Content
      ref={ref}
      id={contentId}
      aria-labelledby={triggerId}
      className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
})

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
