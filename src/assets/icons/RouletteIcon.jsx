import React from "react";

const RouletteIcon = ({ className }) => {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" fill="url(#pattern0_23_68)" />
      <defs>
        <pattern
          id="pattern0_23_68"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use href="#image0_23_68" transform="scale(0.0104167)" />
        </pattern>
        <image
          id="image0_23_68"
          width="96"
          height="96"
          href="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
};

export default RouletteIcon;
