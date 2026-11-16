import { profile } from '@datn/game-core';
import {
  ACHIEVEMENT_KINDS,
  EXPRESSIONS,
  EXPRESSION_LABELS,
  HexBadge,
  Island,
  Medal,
  Planet,
  PlayerEmblem,
  Portrait,
  REGION_COLORS,
  TarotCardBack,
  TarotCardFrame,
  ZodiacConstellation,
  type ZodiacId,
} from '@datn/ui';
const regions = {
  ky_thuat: 'Kỹ thuật',
  suc_khoe: 'Sức khoẻ',
  kinh_doanh: 'Kinh doanh',
  cong_nghe: 'Công nghệ',
  sang_tao: 'Sáng tạo',
  dich_vu: 'Dịch vụ',
};
export function ArtGallery() {
  return (
    <div className="space-y-10">
      <div>
        <h3 className="mb-4 text-xl">Hành tinh · sáu vùng, bốn trạng thái</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(REGION_COLORS).map(([region, color]) => (
            <figure
              key={region}
              className="rounded-xl border border-line bg-night-950/40 p-4"
            >
              <figcaption className="mb-3 text-sm" style={{ color }}>
                {regions[region as keyof typeof regions]}
              </figcaption>
              <div className="grid grid-cols-4 gap-2">
                {(['new', 'playing', 'completed', 'locked'] as const).map(
                  (status, index) => (
                    <div
                      key={status}
                      className="flex flex-col items-center gap-3"
                    >
                      <Planet
                        seed={region}
                        color={color}
                        size={48}
                        status={status}
                        label={regions[region as keyof typeof regions]}
                      />
                      <span className="text-center text-[10px] text-ink-faint">
                        {['Chưa thử', 'Đang chơi', 'Đã xong', 'Chưa mở'][index]}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </figure>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-end gap-6">
          {[16, 32, 64, 120].map((size) => (
            <figure key={size}>
              <Planet
                seed="size"
                color={REGION_COLORS.cong_nghe}
                size={size}
                label={`${size} px`}
              />
              <figcaption className="mt-2 text-center text-xs text-ink-faint">
                {size} px
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-xl">Đảo · một cấp nghề</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['locked', 'open', 'current', 'completed'] as const).map(
            (state, index) => (
              <figure key={state} className="min-w-0 text-center">
                <Island
                  seed="island"
                  levelNo={index + 1}
                  state={state}
                  size={135}
                  className="mx-auto max-w-full"
                />
                <figcaption className="text-xs text-ink-faint">
                  {['Chưa mở', 'Đã mở', 'Đang chơi', 'Đã xong'][index]}
                </figcaption>
              </figure>
            ),
          )}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-xl">
          Chân dung · danh tính giữ nguyên qua biểu cảm
        </h3>
        <p className="mb-4 text-sm text-ink-muted">
          Ba seed, mỗi seed tám biểu cảm. Không dùng ảnh thật của người chơi.
        </p>
        {['ha', 'minh', 'an'].map((seed) => (
          <div
            key={seed}
            className="mb-5 grid grid-cols-4 gap-3 lg:grid-cols-8"
          >
            {EXPRESSIONS.map((expression) => (
              <figure
                key={expression}
                className="min-w-0 rounded-lg bg-night-950/50 p-2"
              >
                <Portrait
                  seed={seed}
                  expression={expression}
                  name={`${seed} · ${EXPRESSION_LABELS[expression]}`}
                  size={72}
                  className="mx-auto max-w-full"
                />
                <figcaption className="mt-1 text-center text-[10px] text-ink-faint">
                  {EXPRESSION_LABELS[expression]}
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
        <div className="flex flex-wrap gap-5">
          <Portrait seed="ha" framed size={100} name="Hà · có khung" />
          <Portrait seed="ha" dim size={100} name="Hà · đang ở nền" />
        </div>
      </div>
      <div>
        <h3 className="mb-4 text-xl">Huy hiệu và huy chương</h3>
        <div className="flex flex-wrap gap-5">
          {(
            Object.keys(ACHIEVEMENT_KINDS) as Array<
              keyof typeof ACHIEVEMENT_KINDS
            >
          ).map((kind) => (
            <figure key={kind} className="text-center">
              <HexBadge kind={kind} size={64} />
              <figcaption className="text-xs text-ink-faint">
                {ACHIEVEMENT_KINDS[kind].name}
              </figcaption>
            </figure>
          ))}
          <HexBadge kind="kham_pha" locked size={64} />
        </div>
        <div className="mt-5 flex flex-wrap gap-6">
          {([1, 2, 3] as const).map((level) => (
            <Medal key={level} level={level} size={52} />
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {['ha', 'minh', 'an', 'bao', 'linh', 'nam'].map((seed) => (
            <PlayerEmblem
              key={seed}
              seed={seed}
              size={60}
              label={`Huy hiệu ${seed}`}
            />
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-4 text-xl">Mười hai chòm sao</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {profile.ZODIAC_SIGNS.map((sign) => (
            <figure
              key={sign.id}
              className="rounded-lg border border-line p-2 text-center"
            >
              <ZodiacConstellation
                sign={sign.id as ZodiacId}
                size={70}
                className="mx-auto max-w-full"
              />
              <figcaption className="text-xs text-ink-muted">
                {sign.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-4 text-xl">Thẻ nhân vật · úp và mở</h3>
        <div className="flex flex-wrap gap-6">
          <TarotCardBack size={140} />
          <TarotCardFrame size={140} name="Hà · Đồng nghiệp" numeral="II">
            <Portrait seed="ha" expression="vui" size={110} name="Hà" />
          </TarotCardFrame>
        </div>
      </div>
    </div>
  );
}
