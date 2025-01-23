"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
import PropTypes from 'prop-types'

const Tabs = TabsPrimitive.Root
Tabs.propTypes = {
  children: PropTypes.node.isRequired,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onValueChange: PropTypes.func,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  dir: PropTypes.oneOf(['ltr', 'rtl']),
  activationMode: PropTypes.oneOf(['automatic', 'manual']),
}

const TabsList = React.forwardRef(({ className, children, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}>
    {children}
  </TabsPrimitive.List>
))
TabsList.displayName = TabsPrimitive.List.displayName
TabsList.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  loop: PropTypes.bool,
}
TabsList.defaultProps = {
  className: '',
}

const TabsTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}>
    {children}
  </TabsPrimitive.Trigger>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName
TabsTrigger.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  asChild: PropTypes.bool,
}
TabsTrigger.defaultProps = {
  className: '',
  disabled: false,
  asChild: false,
}

const TabsContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}>
    {children}
  </TabsPrimitive.Content>
))
TabsContent.displayName = TabsPrimitive.Content.displayName
TabsContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  forceMount: PropTypes.bool,
  asChild: PropTypes.bool,
}
TabsContent.defaultProps = {
  className: '',
  forceMount: false,
  asChild: false,
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
