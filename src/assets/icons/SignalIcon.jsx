import React from "react";

const SignalIcon = ({ className }) => {
  return (
    <svg
      className={className}
      width="27"
      height="27"
      viewBox="0 0 27 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        id="Youtube Live"
        width="27"
        height="27"
        fill="url(#pattern0_23_66)"
      />
      <defs>
        <pattern
          id="pattern0_23_66"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use href="#image0_23_66" transform="scale(0.0104167)" />
        </pattern>
        <image
          id="image0_23_66"
          width="96"
          height="96"
          href="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
};

export default SignalIcon;
