import * as React from "react"

export type ShapeProps = React.SVGProps<SVGSVGElement>

const defaultProps: React.SVGProps<SVGSVGElement> = {
  viewBox: "0 0 32 32",
  width: 20,
  height: 20,
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
}

export const Shape59 = ({ ...props }: ShapeProps) => (
  <svg {...defaultProps} {...props}>
    <g clipPath="url(#clip0_1_4392)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.0619 14.6965C15.3986 6.4696 8.51199 0 0.114279 0C0.114279 8.35878 6.52404 15.2205 14.6965 15.938C6.46959 16.6013 -7.26232e-06 23.488 -7.62939e-06 31.8858C8.35878 31.8858 15.2205 25.476 15.938 17.3035C16.6013 25.5304 23.488 32 31.8858 32C31.8858 23.6413 25.476 16.7795 17.3035 16.0619C25.5304 15.3987 32 8.512 32 0.114286C23.6413 0.114285 16.7795 6.52405 16.0619 14.6965ZM15.9996 16.0003C15.9998 16.0003 16.0002 16.0005 16.0003 16.0005L16.0005 15.9996C16.0002 15.9996 15.9999 15.9996 15.9996 15.9996C15.9996 15.9999 15.9996 16.0002 15.9996 16.0003Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_1_4392">
        <rect width="32" height="32" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

