import { Controller, Get, Param, Res } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { Response } from 'express';
import { ContentService } from './content.service';

/**
 * Nội dung game, chỉ đọc.
 *
 * Không có endpoint ghi: nội dung vào database bằng script seed và chỉ bằng
 * script ấy. Cửa này mở ra thì cần phân quyền và kiểm dữ liệu lúc ghi — việc
 * đó để dành cho lúc thật sự có trang quản trị.
 *
 * Chia làm ba đường vì ba nhịp tải khác nhau: thứ mọi màn đều cần, thứ chỉ
 * bản đồ 3D cần, và thứ chỉ cần lúc vào một màn chơi cụ thể.
 */
@Controller('content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  /** Nghề, sự kiện chung, bài tự vấn, lời đào sâu — tải một lần lúc vào app. */
  @Get('bootstrap')
  async bootstrap(@Res() res: Response): Promise<void> {
    send(res, await this.content.bootstrap());
  }

  /** Nhóm, hành tinh, đường nối — chỉ trang bản đồ ngân hà cần. */
  @Get('galaxy')
  async galaxy(@Res() res: Response): Promise<void> {
    send(res, await this.content.galaxy());
  }

  /** Một kịch bản kèm lời đào sâu của nó — chỉ cần lúc mở màn chơi. */
  @Get('scenarios/:key')
  async scenario(
    @Param('key') key: string,
    @Res() res: Response,
  ): Promise<void> {
    send(res, await this.content.scenario(key));
  }
}

/**
 * Gửi phản hồi kèm ETag tính từ CHÍNH nội dung phản hồi.
 *
 * Bản đầu đặt ETag theo số phiên bản nội dung (`W/"content-v2"`). Nghe thì
 * hợp lý — nội dung chỉ đổi khi seed — nhưng nó bỏ sót một nguồn thay đổi
 * nữa: hình dạng phản hồi. Thêm một trường vào payload mà phiên bản nội dung
 * không đổi thì ETag cũng không đổi, trình duyệt giữ nguyên bản cũ, và máy
 * khách mới nói chuyện với dữ liệu cũ. Chuyện đó đã xảy ra thật khi trường
 * `followups` được thêm vào.
 *
 * Băm nội dung thì không còn chỗ nào để quên: ETag đổi khi và chỉ khi có gì
 * đó thật sự khác. Băm một lần cho mỗi phản hồi, mà phản hồi thì đã nằm sẵn
 * trong cache bộ nhớ của `ContentService`, nên không tốn thêm vòng đọc nào.
 *
 * `no-cache` không có nghĩa là "đừng lưu" — nó là "lưu được, nhưng phải hỏi
 * lại trước mỗi lần dùng". Kết hợp với ETag chuẩn thì lần hỏi lại rẻ (304,
 * không thân) mà không bao giờ phục vụ đồ ôi.
 */
function send(res: Response, payload: unknown): void {
  const body = JSON.stringify(payload);
  const etag = `"${createHash('sha1').update(body).digest('base64')}"`;

  res.setHeader('ETag', etag);
  res.setHeader('Cache-Control', 'private, no-cache');

  if (res.req.headers['if-none-match'] === etag) {
    res.status(304).end();
    return;
  }

  res.type('application/json').send(body);
}
