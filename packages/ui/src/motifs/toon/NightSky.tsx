import { cn } from '../../lib/cn';
import { seededRandom } from '../../lib/seed';
import { CartoonMoon, CartoonPlanet, Cloud, Constellation } from './Celestial';
import { InkStar } from './Stars';
import { color, decorativeStyle, line } from './shared';

export interface NightSkyProps {
  seed?: string;
  scene?: 'home' | 'map' | 'profile' | 'plain';
  horizon?: boolean | 'hills' | 'city';
  className?: string;
}

/** Nền trang trí tối đa 22 sao, vài thiên thể ở mép; không phủ nội dung bằng lớp tối. */
export function NightSky({
  seed = 'jobquest',
  scene = 'plain',
  horizon = false,
  className,
}: NightSkyProps) {
  const rand = seededRandom(seed);
  const stars = Array.from({ length: 22 }, (_, i) => ({
    x: 3 + rand() * 94,
    y: 4 + rand() * 78,
    size: i % 5 === 0 ? 22 + rand() * 10 : 9 + rand() * 7,
    rotation: Math.round(rand() * 24 - 12),
  }));
  const city = horizon === 'city' || (horizon === true && scene === 'home');
  return (
    <div
      aria-hidden="true"
      data-night-scene={scene}
      className={cn(
        'pointer-events-none absolute inset-0 isolate overflow-hidden bg-toon-night',
        className,
      )}
      style={decorativeStyle}
    >
      {stars.map((s, i) => (
        <div
          key={i}
          data-sky-star=""
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            transform: `rotate(${s.rotation}deg)`,
          }}
        >
          <InkStar
            size={s.size}
            fill={color(i % 4 === 0 ? 'star' : 'star-soft')}
            variant={i % 7 === 0 ? 'round5' : 'sparkle'}
          />
        </div>
      ))}
      {scene === 'home' && (
        <>
          <div className="absolute right-[6%] top-[7%] aspect-square w-[clamp(5rem,18%,10rem)] rotate-12">
            <CartoonMoon size="100%" face="sleep" />
          </div>
          <div className="absolute -left-8 top-[20%]">
            <Cloud size={200} />
          </div>
          <div className="absolute right-[14%] top-[32%]">
            <Cloud size={140} />
          </div>
        </>
      )}
      {scene === 'map' && (
        <>
          <div className="absolute -left-6 top-[4%] aspect-square w-[clamp(6rem,20%,11rem)] -rotate-12">
            <CartoonPlanet size="100%" seed={seed} region="cong_nghe" />
          </div>
          <div className="absolute bottom-[4%] right-[4%]">
            <CartoonPlanet size={80} seed={`${seed}-satellite`} ring={false} />
          </div>
          <div className="absolute right-[3%] top-[4%]">
            <Constellation size={135} />
          </div>
        </>
      )}
      {scene === 'profile' && (
        <>
          {/* Điện thoại: bỏ thiên thể lớn để không đè lên tiêu đề trang. */}
          <div className="absolute left-[4%] top-[9%] -rotate-12 max-sm:hidden">
            <CartoonMoon size={110} face="smile" />
          </div>
          <div className="absolute bottom-[8%] right-[3%]">
            <Cloud size={220} />
          </div>
          <div className="absolute right-[4%] top-[6%] max-sm:hidden">
            <CartoonPlanet size={100} seed={seed} />
          </div>
        </>
      )}
      {horizon && (
        <svg
          className="absolute bottom-0 left-0 h-[22%] min-h-16 w-full"
          viewBox="0 0 1200 170"
          preserveAspectRatio="none"
        >
          <path
            {...line}
            fill={color('night-soft')}
            d="M-10 155Q90 38 222 108Q380-8 519 99Q660 10 817 104Q1017 3 1210 116V180H-10Z"
          />
          {city ? (
            <>
              <path
                {...line}
                fill={color('night-deep')}
                d="M-5 172V109H45V67L79 43L113 67V128H155V92H179V64H197V92H241V130H286V82L332 48L379 82V130H432V103H474V50L515 22L554 50V122H610V86H650V116H702V65L738 38L774 65V131H826V95H865V74H894V95H950V129H1007V76L1050 46L1093 76V117H1145V90H1205V180Z"
              />
              <path
                d="M69 77h13v19H69Z M315 87h12v17h-12Z M505 61h13v20h-13Z M723 78h12v17h-12Z M1041 84h13v18h-13Z"
                fill={color('star')}
              />
            </>
          ) : (
            <path
              {...line}
              fill={color('night-deep')}
              d="M-10 165Q171 83 344 144Q510 74 685 144Q871 62 1031 135Q1136 94 1210 145V180H-10Z"
            />
          )}
        </svg>
      )}
    </div>
  );
}
