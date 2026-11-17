import { useId } from 'react';
import { seededRandom, pick } from '../lib/seed';
import { cn } from '../lib/cn';
import { EXPRESSION_LABELS, palette, type Expression } from '../tokens';
export interface PortraitProps {
  seed: string;
  expression?: Expression;
  size?: number;
  name?: string;
  framed?: boolean;
  dim?: boolean;
  className?: string;
}

/** Danh tính lấy từ seed; biểu cảm chỉ thay nét mặt và cử chỉ. */
export function Portrait({
  seed,
  expression = 'binh_thuong',
  size = 280,
  name,
  framed = false,
  dim = false,
  className,
}: PortraitProps) {
  const id = useId();
  const random = seededRandom(seed);
  const skin = pick(random, [
    '#efc5a4',
    '#ddb08a',
    '#cf9d76',
    '#ba8762',
    '#f2ceb3',
    '#d5a580',
  ]);
  const hair = pick(random, [
    '#171b28',
    '#24202b',
    '#30272a',
    '#40302e',
    '#202636',
  ]);
  const hairstyle = Math.floor(random() * 6);
  const outfit = Math.floor(random() * 5);
  const cloth = pick(random, [
    '#537c91',
    '#597e78',
    '#80718f',
    '#5978a6',
    '#a06e73',
    '#728784',
  ]);
  const glasses = random() > 0.7;
  const happy = expression === 'vui' || expression === 'cuoi_lon';
  const worried = expression === 'lo_lang' || expression === 'buon';
  const surprised = expression === 'ngac_nhien';
  const angry = expression === 'kho_chiu';
  const thinking = expression === 'suy_nghi';
  return (
    <svg
      role={name ? 'img' : undefined}
      aria-label={
        name ? `${name} — ${EXPRESSION_LABELS[expression]}` : undefined
      }
      aria-hidden={name ? undefined : true}
      viewBox="0 0 240 280"
      width={size}
      height={framed ? size : (size * 280) / 240}
      className={cn(
        'shrink-0 transition-opacity',
        dim && 'opacity-45',
        className,
      )}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2=".5">
          <stop stopColor={skin} />
          <stop offset="1" stopColor={skin} />
        </linearGradient>
        <linearGradient id={`${id}-cloth`} x2="1" y2="1">
          <stop stopColor={cloth} />
          <stop offset="1" stopColor={palette.midnight} />
        </linearGradient>
        <clipPath id={`${id}-frame`}>
          {framed ? (
            <circle cx="120" cy="140" r="111" />
          ) : (
            <rect width="240" height="280" rx="16" />
          )}
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-frame)`}>
        {framed && <circle cx="120" cy="140" r="111" fill={palette.midnight} />}
        {/* Tóc phía sau và búi tóc được vẽ trước khuôn mặt. */}
        {hairstyle === 0 && (
          <path
            d="M62 96Q53 37 118 30q65-2 63 70l12 134q-40 30-151-2Z"
            fill={hair}
          />
        )}
        {hairstyle === 1 && (
          <>
            <circle cx="151" cy="37" r="24" fill={hair} />
            <path d="M65 113Q49 35 118 31q66-4 57 84Z" fill={hair} />
          </>
        )}
        {hairstyle === 4 && (
          <path
            d="M61 95Q51 36 119 30q62 0 62 65l3 70q-14 16-30 9H79q-20-4-22-15Z"
            fill={hair}
          />
        )}
        <path
          d="M37 280v-34q2-39 57-45h52q56 5 58 45v34"
          fill={`url(#${id}-cloth)`}
        />
        <path
          d="m80 213-15 67m98-67 15 67"
          stroke={palette.ivory}
          strokeOpacity=".1"
          strokeWidth="2"
          fill="none"
        />
        <path d="M99 175v29q20 27 42 0v-29" fill={skin} />
        <path
          d="M99 177q20 22 42 0v13q-21 22-42-1Z"
          fill="#754933"
          opacity=".18"
        />
        {outfit === 0 && (
          <>
            <path
              d="m95 200 25 22-15 20-25-30Zm50 0-25 22 15 20 24-30Z"
              fill="#d4dce0"
            />
            <path d="M120 224v56" stroke={palette.mist} strokeOpacity=".5" />
            {[244, 261].map((y) => (
              <circle key={y} cx="125" cy={y} r="1.5" fill={palette.mist} />
            ))}
          </>
        )}
        {outfit === 1 && (
          <path
            d="m87 204 33 23 33-23-11 32h-44Z"
            fill={palette.ivory}
            fillOpacity=".65"
          />
        )}
        {outfit === 2 && (
          <>
            <path
              d="m96 201 24 18-17 13-17-25m58-6-24 18 17 13 17-25"
              fill={palette.deepSpace}
              fillOpacity=".5"
            />
            <path d="M120 219v24" stroke={palette.mist} />
          </>
        )}
        {outfit === 3 && (
          <>
            <path d="m81 206 10-3 7 40h44l7-40 10 3-6 74H87Z" fill="#c1aa86" />
            <path d="M105 248h31v22h-31Z" fill="none" stroke="#7a6a54" />
          </>
        )}
        {outfit === 4 && (
          <>
            <path
              d="m92 201 28 23 28-23-14 35h-28Z"
              fill={palette.deepSpace}
              fillOpacity=".45"
            />
            <rect
              x="151"
              y="236"
              width="25"
              height="19"
              rx="2"
              fill={palette.ivory}
              fillOpacity=".2"
            />
            <path
              d="M157 245h12m-6-6v12"
              stroke={palette.ivory}
              strokeOpacity=".6"
            />
          </>
        )}
        <ellipse cx="70" cy="121" rx="9" ry="15" fill={skin} />
        <ellipse cx="170" cy="121" rx="9" ry="15" fill={skin} />
        <path
          d="M70 87Q71 46 120 46t50 41v45q-2 54-50 64-47-10-50-64Z"
          fill={`url(#${id}-skin)`}
        />
        <path
          d="M161 86q12 66-18 94 29-15 27-52V91"
          fill="#754933"
          opacity=".12"
        />
        <path
          d="M75 119q-7 0-4 10m94-10q7 0 4 10"
          stroke="#9d6a4f"
          strokeOpacity=".5"
          fill="none"
          strokeWidth="2"
        />
        {/* Sáu kiểu tóc: dài, búi, ngắn, rẽ ngôi, bob và mũ. */}
        {hairstyle === 0 && (
          <path
            d="M65 105Q53 36 119 32q62 1 57 75-13-18-19-44-16 31-80 24l-7 44Z"
            fill={hair}
          />
        )}
        {hairstyle === 1 && (
          <path
            d="M66 105Q48 34 118 33q67-2 56 76l-12-29q-51 4-68-18-3 24-24 38Z"
            fill={hair}
          />
        )}
        {hairstyle === 2 && (
          <path
            d="m64 110-5-46 14 3-2-19 19 5 5-20 15 9 20-16 11 13 20-2 1 14 16 10-2 47-13-26-9-12q-39 18-70 6l-12 36Z"
            fill={hair}
          />
        )}
        {hairstyle === 3 && (
          <path
            d="M64 109Q52 38 111 32q63-10 66 52l-5 25-15-37q-31 6-42-10-15 23-40 25l-7 30Z"
            fill={hair}
          />
        )}
        {hairstyle === 4 && (
          <path
            d="M60 112Q50 32 119 31q62-2 61 85l-17-31q-40 8-71-10l-20 31-3 53-10-8Z"
            fill={hair}
          />
        )}
        {hairstyle === 5 && (
          <>
            <path d="M65 106Q54 41 119 37t57 69l-12-28H79l-8 39Z" fill={hair} />
            <path d="M64 74q2-46 54-46 55 0 59 49Z" fill={cloth} />
            <path
              d="M59 76q59-18 122 0l17 12q-69-4-133 4Z"
              fill={palette.midnight}
            />
            <path d="M121 32v34" stroke={palette.ivory} strokeOpacity=".2" />
          </>
        )}
        {hairstyle !== 5 && (
          <path
            d="M78 65q13-22 39-22m18 1q18 2 28 23"
            stroke={palette.ivory}
            strokeOpacity=".09"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        )}
        <g stroke={hair} strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path
            d={
              angry
                ? 'm84 104 20 6m33 0 20-6'
                : worried
                  ? 'm84 106 20-6m33 0 20 6'
                  : surprised
                    ? 'M84 98q10-8 20-2m33 0q10-6 20 2'
                    : thinking
                      ? 'M84 104q10-6 20-2m33-5 20 3'
                      : 'M84 104q10-5 20-1m33 0q10-4 20 1'
            }
          />
          {expression === 'cuoi_lon' || expression === 'vui' ? (
            <path d="M85 121q9-11 18 0m35 0q9-11 18 0" />
          ) : (
            <>
              <ellipse
                cx={thinking ? 97 : 94}
                cy="120"
                rx={surprised ? 4 : 3}
                ry={surprised ? 6 : worried ? 3 : 4}
                fill={hair}
                stroke="none"
              />
              <ellipse
                cx={thinking ? 149 : 147}
                cy="120"
                rx={surprised ? 4 : 3}
                ry={surprised ? 6 : worried ? 3 : 4}
                fill={hair}
                stroke="none"
              />
              <path d="M85 115q9-4 18 0m35 0q9-4 18 0" strokeWidth="1.3" />
            </>
          )}
        </g>
        <path
          d="m120 126-4 14q4 3 9 0"
          stroke="#9d6a4f"
          strokeOpacity=".5"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        {happy && (
          <>
            <ellipse
              cx="87"
              cy="138"
              rx="10"
              ry="4"
              fill="#ca7e72"
              opacity=".25"
            />
            <ellipse
              cx="154"
              cy="138"
              rx="10"
              ry="4"
              fill="#ca7e72"
              opacity=".25"
            />
          </>
        )}
        {expression === 'cuoi_lon' ? (
          <>
            <path d="M103 151q17 6 34 0-1 23-17 23t-17-23" fill="#633b3e" />
            <path d="M105 153q15 5 30 0l-3 6h-24Z" fill={palette.ivory} />
            <path d="M112 169q8-7 16 0" stroke="#c9787b" strokeWidth="4" />
          </>
        ) : surprised ? (
          <ellipse cx="120" cy="158" rx="7" ry="10" fill="#714747" />
        ) : (
          <path
            d={
              happy
                ? 'M105 154q15 14 30 0'
                : worried
                  ? 'M108 163q12-10 24 0'
                  : angry
                    ? 'M107 159h27'
                    : thinking
                      ? 'M114 159q10-4 18-1'
                      : 'M109 156q11 6 22 0'
            }
            stroke="#9a5e57"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        )}
        {glasses && (
          <g fill="none" stroke="#4b494b" strokeWidth="1.8">
            <rect x="80" y="110" width="29" height="22" rx="8" />
            <rect x="132" y="110" width="29" height="22" rx="8" />
            <path d="M109 118q11-6 23 0m-61-5 9 3m81 0 9-3" />
          </g>
        )}
        {expression === 'lo_lang' && (
          <path
            d="M177 108q-10 13-4 17 10 4 4-17Z"
            fill="#9bcfe0"
            stroke={palette.ivory}
            strokeWidth=".7"
          />
        )}
        {thinking && (
          <g>
            <path
              d="m163 280-23-58-12-24q-8-12-4-20l6-21q3-5 6 0l-2 26q7-8 12-4l13 25 21 76"
              fill={skin}
            />
            <path
              d="m132 185 9 18m-1-22 9 18"
              stroke="#9d6a4f"
              strokeOpacity=".45"
              fill="none"
              strokeWidth="1.4"
            />
          </g>
        )}
      </g>
      {framed && (
        <>
          <circle
            cx="120"
            cy="140"
            r="113"
            fill="none"
            stroke={palette.starlight}
            strokeWidth="1.2"
          />
          <circle
            cx="120"
            cy="140"
            r="117"
            fill="none"
            stroke={palette.starlight}
            strokeOpacity=".3"
            strokeWidth=".7"
          />
        </>
      )}
    </svg>
  );
}
