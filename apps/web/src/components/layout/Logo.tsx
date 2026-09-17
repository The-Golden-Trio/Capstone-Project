/** Dấu hiệu nhận diện: một hành tinh có vành đai, một ngôi sao, một sao chổi. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <circle
        cx="256"
        cy="256"
        r="246"
        fill="#142B52"
        stroke="#D4B06A"
        strokeWidth="13"
      />
      <circle
        cx="256"
        cy="256"
        r="228"
        fill="none"
        stroke="#D4B06A"
        strokeWidth="2"
        opacity=".45"
      />
      <g fill="#F0D79A" opacity=".8">
        <circle cx="150" cy="130" r="4" />
        <circle cx="372" cy="146" r="3.4" />
        <circle cx="398" cy="330" r="4" />
        <circle cx="132" cy="352" r="3.4" />
        <circle cx="300" cy="96" r="3" />
        <circle cx="196" cy="404" r="3" />
      </g>
      <g stroke="#D4B06A" strokeWidth="7" strokeLinecap="round" opacity=".9">
        <path d="M256 36v26" />
        <path d="M256 450v26" />
        <path d="M36 256h26" />
        <path d="M450 256h26" />
      </g>
      <ellipse
        cx="256"
        cy="256"
        rx="196"
        ry="79"
        fill="none"
        stroke="#D4B06A"
        strokeWidth="7"
        strokeDasharray="13 17"
        strokeLinecap="round"
        transform="rotate(-19 256 256)"
        opacity=".85"
      />
      <circle cx="96" cy="326" r="27" fill="#5D7EA8" />
      <circle cx="88" cy="317" r="10" fill="#8FA6C4" opacity=".75" />
      <path
        d="M339.4 172.6 294 256l45.4 83.4L256 294l-83.4 45.4L218 256l-45.4-83.4L256 218Z"
        fill="#5D7EA8"
      />
      <path d="M256 400 240 286h32Z" fill="#E07A6B" />
      <path
        d="M256 86 285.7 226.3 426 256 285.7 285.7 256 426 226.3 285.7 86 256 226.3 226.3Z"
        fill="#F0D79A"
      />
      <circle cx="256" cy="256" r="21" fill="#0A1026" />
      <circle cx="256" cy="256" r="7" fill="#F8F6EE" />
    </svg>
  );
}
