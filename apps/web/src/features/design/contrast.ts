/** Độ chói tương đối sRGB và tỉ lệ tương phản theo công thức WCAG. */
export function contrastRatio(
  foreground: string,
  background = '#0A1026',
): number {
  const luminance = (hex: string) => {
    if (!/^#[0-9a-f]{6}$/i.test(hex))
      throw new Error('Màu cần có dạng #RRGGBB.');
    const channels = [1, 3, 5].map((index) => {
      const value = parseInt(hex.slice(index, index + 2), 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const a = luminance(foreground),
    b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Pha token alpha trên màu nền đêm trước khi đo tương phản. */
export function compositeOnNight(hex: string, alpha: number): string {
  if (
    !/^#[0-9a-f]{6}$/i.test(hex) ||
    !Number.isFinite(alpha) ||
    alpha < 0 ||
    alpha > 1
  ) {
    throw new Error('Cần màu #RRGGBB và alpha trong khoảng 0–1.');
  }
  const background = '#0a1026';
  const blended = [1, 3, 5].map((index) =>
    Math.round(
      parseInt(hex.slice(index, index + 2), 16) * alpha +
        parseInt(background.slice(index, index + 2), 16) * (1 - alpha),
    )
      .toString(16)
      .padStart(2, '0'),
  );
  return `#${blended.join('')}`;
}
