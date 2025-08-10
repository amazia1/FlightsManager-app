import React from "react";

export function FlightSvg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <mask id="mask0_2104_37724" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="28" height="28">
      <rect width="28" height="28" fill="#D9D9D9"/>
      </mask>
      <g mask="url(#mask0_2104_37724)">
      <path d="M11.5792 24.6458L8.69166 19.2792L3.325 16.3917L5.39583 14.35L9.625 15.0792L12.6 12.1042L3.35416 8.16667L5.80416 5.65833L17.0333 7.64167L20.65 4.025C21.0972 3.57778 21.6514 3.35417 22.3125 3.35417C22.9736 3.35417 23.5278 3.57778 23.975 4.025C24.4222 4.47222 24.6458 5.02153 24.6458 5.67292C24.6458 6.32431 24.4222 6.87361 23.975 7.32083L20.3292 10.9667L22.3125 22.1667L19.8333 24.6458L15.8667 15.4L12.8917 18.375L13.65 22.575L11.5792 24.6458Z" fill="#2563EB"/>
      </g>
    </svg>
  );
}