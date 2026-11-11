/**
 * Đọc lỗi cấu hình thành việc phải làm, cho lệnh `narrator-try --mode=check`.
 *
 * Lần đầu gắn key, lỗi hay gặp không nằm ở code mà ở tài khoản: key sai region,
 * chưa kích hoạt model, chưa nạp tiền. Mã lỗi của hãng không nói phải bấm vào
 * đâu, nên viết sẵn ra đây. Theo trang Error codes của Model Studio và Errors
 * của OpenRouter, đọc ngày 6/11/2026.
 */
import type { GatewayError } from './gateway.types';
import type { AiSettings } from './models';

/** Key dán nhầm chỗ, thừa khoảng trắng: bắt trước khi tốn một lượt gọi. */
export function keyWarnings(settings: AiSettings): string[] {
  const warnings: string[] = [];
  const qwen = settings.qwen?.apiKey;
  const openrouter = settings.openrouter?.apiKey;

  // Key gói (Coding Plan, Token Plan) có dạng sk-sp-… và chỉ chạy ở endpoint
  // riêng của gói. Điều khoản của cả hai gói cấm dùng cho backend và script
  // (trang overview, 4/11 và 11/11/2026).
  for (const [name, key] of [['QWEN_API_KEY', qwen], ['OPENROUTER_API_KEY', openrouter]] as const)
    if (key?.startsWith('sk-sp-'))
      warnings.push(
        `${name} là key gói của Alibaba (sk-sp-…): điều khoản gói cấm dùng cho backend và script, có thể bị khoá key. Chỉ chạy ở endpoint của gói, ví dụ Token Plan: QWEN_BASE_URL=https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1.`,
      );
  if (qwen?.startsWith('sk-or-'))
    warnings.push('QWEN_API_KEY có dạng key OpenRouter (sk-or-…). Chuyển sang OPENROUTER_API_KEY.');
  if (openrouter && !openrouter.startsWith('sk-or-'))
    warnings.push('OPENROUTER_API_KEY không có dạng sk-or-…. Key mua trực tiếp từ Alibaba đặt ở QWEN_API_KEY.');
  for (const [name, key] of [['QWEN_API_KEY', qwen], ['OPENROUTER_API_KEY', openrouter]] as const)
    if (key && /\s/.test(key)) warnings.push(`${name} có khoảng trắng ở giữa, kiểm lại lúc dán.`);

  return warnings;
}

const QWEN_HINTS: Array<[RegExp, string]> = [
  [
    /invalid_?api_?key/i,
    'Key không hợp lệ ở endpoint này. Key gắn với region: kiểm QWEN_REGION có đúng region lúc tạo key không; nếu vẫn sai, dán nguyên "API Host" trong hộp thoại tạo key vào QWEN_BASE_URL.',
  ],
  [/workspacenotfound|not authorized/i, 'Sai workspace: kiểm QWEN_WORKSPACE_ID, và tài khoản phải thuộc workspace đó.'],
  [/arrearage|out_of_service/i, 'Tài khoản đang nợ hoặc hết tiền: nạp thêm trong Expenses and Costs của Alibaba Cloud, số dư có thể cập nhật chậm vài phút.'],
  [/freetier/i, 'Hết phần miễn phí và đang bật "chỉ dùng miễn phí": tắt chế độ đó trong console Model Studio.'],
  [/free allocated quota/i, 'Hết phần miễn phí của model: bật trả theo lượng dùng trong console.'],
  [/unpurchased|not activated/i, 'Model Studio hoặc model chưa được kích hoạt: kích hoạt trong console.'],
  [/access_?denied/i, 'Key không có quyền gọi model này: kiểm phạm vi model của key và workspace trong console.'],
  [/model_?not_?found/i, 'Region này không có qwen3.8-flash, hoặc model chưa kích hoạt: kiểm Model Marketplace của đúng region.'],
  [/insufficient_quota|allocationquota|throttling|limit_/i, 'Chạm trần lượt gọi. Chờ một phút rồi chạy lại; vẫn bị thì xem Rate Limiting trong console.'],
  [
    /json_schema|response_format|schema/i,
    'Region này không nhận JSON Schema. Đặt QWEN_JSON_MODE=object rồi chạy lại: R4 vẫn kiểm khuôn bằng code.',
  ],
  [/data_?inspection/i, 'Bộ lọc nội dung của Alibaba chặn câu mẫu. Đây không phải lỗi cấu hình, thử --answer=dung_kich_ban.'],
];

const OPENROUTER_HINTS: Array<[RegExp, string]> = [
  [/\b401\b/, 'Key OpenRouter không hợp lệ hoặc đã bị tắt: tạo lại ở openrouter.ai/keys.'],
  [/\b402\b/, 'Hết credit: nạp thêm ở openrouter.ai/credits.'],
  [
    /no endpoints|no allowed providers|\b404\b|\b503\b/i,
    'Không có endpoint Alibaba nào thoả điều kiện, thường do `data_collection: deny` hoặc cài đặt privacy của tài khoản. Đó là chính sách dữ liệu, cần nhóm quyết. Chỉ khi thử bằng dữ liệu giả mới đặt AI_ALLOW_UNCONFIRMED_PROVIDERS=true.',
  ],
  [/\b429\b/, 'Chạm trần lượt gọi. Chờ một phút rồi chạy lại.'],
  [/\b400\b/, 'OpenRouter từ chối tham số. Gửi nguyên dòng lỗi này để sửa `openRouterAdapter`.'],
];

/** Một dòng tiếng Việt nói phải làm gì. Không nhận ra lỗi thì nói chung theo loại. */
export function explainGatewayError(error: GatewayError): string {
  const hints = error.provider === 'openrouter' ? OPENROUTER_HINTS : QWEN_HINTS;
  const hit = hints.find(([pattern]) => pattern.test(error.message));
  if (hit && error.provider !== 'deepseek') return hit[1];

  switch (error.kind) {
    case 'timeout':
      return 'Quá giờ. Chạy lại một lần; vẫn bị thì kiểm mạng, hoặc thử region khác.';
    case 'network':
      return 'Không nối được tới endpoint. Kiểm mạng, proxy, và URL in ở trên.';
    case 'auth':
      return 'Lỗi quyền truy cập: kiểm lại key.';
    case 'quota':
      return 'Hết tiền hoặc hết hạn mức: kiểm tài khoản.';
    case 'bad_request':
      return 'Hãng từ chối request. Dòng lỗi phía trên nói tham số nào sai; gửi nguyên dòng đó để sửa adapter.';
    default:
      return 'Lỗi phía nhà cung cấp, thường tạm thời. Chờ một lúc rồi chạy lại.';
  }
}
