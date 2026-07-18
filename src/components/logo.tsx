import * as React from "react"

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

export function Logo({ size = 24, className, ...props }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Rising Sun Rays */}
      <path d="M12 3V5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5.636 5.636L7.404 7.404" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18.364 5.636L16.596 7.404" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      
      {/* Rising Sun Core */}
      <path d="M8 13.5C8 11.29 9.79 9.5 12 9.5C14.21 9.5 16 11.29 16 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      
      {/* Horizon Line / Ground */}
      <path d="M3 13.5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      
      {/* Minimal Hotel Facade */}
      <path d="M6 13.5V19.5C6 20.33 6.67 21 7.5 21H16.5C17.33 21 18 20.33 18 19.5V13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 17.5H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
