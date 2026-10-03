/**
 * Dấu hiệu nhận diện sản phẩm.
 *
 * Trước đây đây là một hình SVG vẽ tay trong mã. Giờ dùng đúng tệp logo của
 * sản phẩm, nên chỉ có một bản duy nhất — sửa logo là thay một tệp, không phải
 * đi vẽ lại đường path.
 *
 * Mặc định là hình trang trí (`alt=""`): ở thanh đầu trang và màn đăng nhập,
 * ngay cạnh nó đã có chữ "Vào Nghề". Chỗ nào logo đứng một mình mà không có
 * chữ thì truyền `alt` vào.
 */

/**
 * Tệp nằm trong `public/` nên Vite phục vụ nguyên trạng ở đúng đường dẫn này —
 * tham chiếu bằng URL chứ không `import`, vì `import` sẽ đi tìm tệp trong
 * `src/` và không thấy.
 */
const LOGO_URL = '/logo.png';

export function Logo({
  className,
  alt = '',
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src={LOGO_URL}
      alt={alt}
      width={184}
      height={184}
      className={className}
      // Logo nằm ngay đầu mọi trang nên nó phải có mặt cùng lúc với phần còn
      // lại, không đợi tới lượt tải sau.
      loading="eager"
      decoding="async"
      draggable={false}
    />
  );
}
