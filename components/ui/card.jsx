import * as React from "react"
import { cn } from "@/lib/utils"
import PropTypes from 'prop-types'

const Card = React.forwardRef(({ className, children, ...props }, ref) => (
  <article
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  >
    {children}
  </article>
))
Card.displayName = "Card"
Card.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
}
Card.defaultProps = {
  className: '',
}

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"
CardHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
}
CardHeader.defaultProps = {
  className: '',
}

const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => {
  if (!children) {
    console.warn('CardTitle must have content for accessibility');
  }
  return (
    <h3
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children || 'Untitled'}
    </h3>
  );
})
CardTitle.displayName = "CardTitle"
CardTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
}
CardTitle.defaultProps = {
  className: '',
}

const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => {
  if (!children) {
    console.warn('CardDescription must have content for accessibility');
  }
  return (
    <footer
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children || 'No description available'}
    </footer>
  );
})
CardDescription.displayName = "CardDescription"
CardDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
}
CardDescription.defaultProps = {
  className: '',
}

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"
CardContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
}
CardContent.defaultProps = {
  className: '',
}

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"
CardFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
}
CardFooter.defaultProps = {
  className: '',
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
