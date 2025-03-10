import * as React from "react"
import { cn } from "../../lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  return <div className="relative inline-block text-left">{children}</div>
}

interface DropdownMenuTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ 
  asChild = false, 
  children 
}) => {
  const [open, setOpen] = React.useState(false)
  
  // Use a ref to track the dropdown content for click outside detection
  const triggerRef = React.useRef<HTMLDivElement>(null)
  
  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])
  
  const handleToggle = () => {
    setOpen(!open)
  }

  // Pass the open state to all DropdownMenuContent children
  const childrenWithProps = React.Children.map(
    React.Children.toArray(children),
    (child) => {
      if (React.isValidElement(child) && (child.type as any)?.displayName === "DropdownMenuContent") {
        return React.cloneElement(child, { open });
      }
      return child;
    }
  );

  return (
    <div ref={triggerRef}>
      <div onClick={handleToggle} className="inline-flex cursor-pointer" data-state={open ? "open" : "closed"}>
        {asChild && React.isValidElement(children) 
          ? React.cloneElement(children as React.ReactElement, {
              "data-state": open ? "open" : "closed"
            })
          : children}
      </div>
      
      {childrenWithProps}
    </div>
  )
}

interface DropdownMenuContentProps {
  align?: "start" | "end" | "center"
  className?: string
  children: React.ReactNode
  open?: boolean
}

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ 
  align = "center", 
  className, 
  children,
  open
}) => {
  const alignmentClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }
  
  if (!open) return null;
  
  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80",
        alignmentClasses[align],
        className
      )}
    >
      {children}
    </div>
  )
}
DropdownMenuContent.displayName = "DropdownMenuContent";

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
}
