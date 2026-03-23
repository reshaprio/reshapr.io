/**
 * Overrides @docusaurus/theme-classic Icon/SystemColorMode — stroke monitor (variant 154), 1.5 / currentColor.
 */
import React from 'react';

export default function IconSystemColorMode(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M13.3333 2H2.66665C1.93027 2 1.33331 2.59695 1.33331 3.33333V10C1.33331 10.7364 1.93027 11.3333 2.66665 11.3333H13.3333C14.0697 11.3333 14.6666 10.7364 14.6666 10V3.33333C14.6666 2.59695 14.0697 2 13.3333 2Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.33331 14H10.6666"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 11.332V13.9987"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
