/**
 * Registry model: model nào, ở đâu, hỗ trợ gì, giá bao nhiêu, cam kết dữ
 * liệu ra sao.
 *
 * Mọi con số ở đây đều kèm nguồn và trạng thái "đã kiểm hay chưa". Con số
 * chưa kiểm vẫn dùng được để ước chi phí, nhưng bản ghi chi phí sẽ nói rõ là
 * ước lượng — thay vì để một con số sai trông như con số đúng.
 */
import type {
  CacheMode,
  DataPolicy,
  ModelSpec,
  Price,
  ProviderId,
} from './gateway.types';

export type QwenRegion =
  | 'ap-southeast-1'
  | 'ap-northeast-1'
  | 'cn-hongkong'
  | 'eu-central-1'
  | 'us-east-1';

export interface QwenSettings {
  apiKey: string;
  region: QwenRegion;
  workspaceId?: string;
  baseUrl?: string;
  cacheMode: CacheMode;
  /** Đè cách suy theo region, phòng khi Alibaba đổi danh sách region hỗ trợ JSON Schema. */
  jsonMode?: 'schema' | 'object';
}

export interface OpenRouterSettings {
  apiKey: string;
  baseUrl?: string;
}

export interface AiSettings {
  qwen?: QwenSettings;
  openrouter?: OpenRouterSettings;
  deepseek?: { apiKey: string };
  /** Cho gọi nhà cung cấp chưa có cam kết không huấn luyện (chỉ để thử bằng dữ liệu giả). */
  allowUnconfirmedProviders: boolean;
}

/* ── Qwen (Alibaba Cloud Model Studio) ─────────────────────────────── */

const QWEN_DATA_POLICY: DataPolicy = {
  noTraining: 'confirmed',
  source:
    'https://www.alibabacloud.com/help/en/model-studio/faq-about-alibaba-cloud-model-studio (mục 6)',
  checkedAt: '2026-11-06',
  note: '"Alibaba Cloud strictly protects data privacy and never uses your data for model training."',
};

/**
 * Endpoint theo region. Tài liệu (6/11/2026) ghi endpoint dạng
 * `{WorkspaceId}.{region}.maas.aliyuncs.com`; riêng Singapore còn endpoint
 * quốc tế cũ không cần workspace, tài liệu ghi vẫn dùng được. Key gắn với
 * region: key Singapore gọi Frankfurt sẽ bị 401.
 */
export function qwenBaseUrl(settings: QwenSettings): string {
  if (settings.baseUrl) return settings.baseUrl.replace(/\/+$/, '');
  if (settings.workspaceId)
    return `https://${settings.workspaceId}.${settings.region}.maas.aliyuncs.com/compatible-mode/v1`;
  if (settings.region === 'ap-southeast-1')
    return 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
  throw new Error(
    `Qwen region ${settings.region} cần QWEN_WORKSPACE_ID hoặc QWEN_BASE_URL — ` +
      'endpoint của Model Studio có dạng {WorkspaceId}.{region}.maas.aliyuncs.com',
  );
}

export function qwenFlash(settings: QwenSettings): ModelSpec {
  // Tài liệu Structured output (cập nhật 5/11/2026): "Singapore region models
  // are not supported yet" cho JSON Schema.
  const jsonSchema = settings.jsonMode
    ? settings.jsonMode === 'schema'
    : settings.region !== 'ap-southeast-1';

  // Trang giá (5/11/2026): Singapore, Frankfurt, Virginia 0,15 / 0,47; Tokyo và
  // gói Global 0,113 / 0,382 — lấy mức cao hơn. Tỉ lệ cache để null: trang
  // Context cache ghi riêng qwen3.8-flash không theo tỉ lệ chung (20%, 10%,
  // 125%) mà tuỳ region, xem trong console. Chi phí có cache vì thế là cận trên.
  const price: Price = {
    inputPerMTok: 0.15,
    outputPerMTok: 0.47,
    cachedInputRatio: null,
    cacheWriteRatio: null,
    source: 'https://www.alibabacloud.com/help/en/model-studio/model-pricing (5/11/2026)',
    verified: true,
  };

  // Key gói (Coding Plan, Token Plan) có dạng sk-sp-… Cam kết "never uses
  // your data for model training" là của Model Studio trả theo lượng dùng; điều
  // khoản dữ liệu của gói chưa đọc được, nên không mượn cam kết đó.
  const planKey = settings.apiKey.startsWith('sk-sp-');

  return {
    key: `qwen3.8-flash@${settings.region}`,
    provider: 'qwen',
    model: 'qwen3.8-flash',
    family: 'qwen',
    region: settings.region,
    baseUrl: qwenBaseUrl(settings),
    supports: { jsonSchema, explicitCache: true },
    cacheMode: settings.cacheMode,
    price,
    dataPolicy: planKey
      ? {
          noTraining: 'not_found',
          source: 'https://www.alibabacloud.com/help/en/model-studio/token-plan-personal-overview',
          checkedAt: '2026-11-11',
          note: 'Key gói (sk-sp-…): chưa đọc được điều khoản dữ liệu của gói; điều khoản gói cấm dùng cho backend và script',
        }
      : QWEN_DATA_POLICY,
  };
}

/* ── Qwen qua OpenRouter ───────────────────────────────────────────── */

export function openRouterQwenFlash(
  settings: OpenRouterSettings,
  options: { allowDataCollection: boolean },
): ModelSpec {
  return {
    key: 'qwen3.8-flash@openrouter',
    provider: 'openrouter',
    model: 'qwen/qwen3.8-flash',
    family: 'qwen',
    region: 'openrouter',
    baseUrl: (settings.baseUrl ?? 'https://openrouter.ai/api/v1').replace(/\/+$/, ''),
    supports: { jsonSchema: true, explicitCache: false },
    cacheMode: 'implicit',
    price: {
      inputPerMTok: 0.15,
      outputPerMTok: 0.47,
      // 0,016 / 0,15 và 0,2 / 0,15, theo endpoint Alibaba trên OpenRouter.
      cachedInputRatio: 0.016 / 0.15,
      cacheWriteRatio: 0.2 / 0.15,
      source: 'https://openrouter.ai/api/v1/models/qwen/qwen3.8-flash/endpoints (6/11/2026)',
      verified: true,
    },
    routing: {
      only: ['alibaba'],
      dataCollection: options.allowDataCollection ? 'allow' : 'deny',
    },
    dataPolicy: {
      noTraining: 'confirmed',
      source: 'https://openrouter.ai/docs/guides/privacy/data-collection',
      checkedAt: '2026-11-06',
      note:
        'OpenRouter: "does not store your prompts or responses", huấn luyện tắt mặc định. Mỗi request gửi `data_collection: deny`: nếu OpenRouter không xếp Alibaba vào nhóm không thu thập thì request bị từ chối, không gửi đi. Thêm một bên trung gian so với gọi trực tiếp',
    },
  };
}

/* ── DeepSeek ──────────────────────────────────────────────────────── */

export function deepseekFlash(): ModelSpec {
  return {
    key: 'deepseek-flash',
    provider: 'deepseek',
    // "deepseek-flash is now served by DeepSeek-V4.1-Flash-1017" (30/10/2026).
    model: 'deepseek-flash',
    family: 'deepseek',
    region: 'global',
    baseUrl: 'https://api.deepseek.com',
    // Chỉ có `json_object`; cache tự động trên ổ đĩa, không đánh dấu được.
    supports: { jsonSchema: false, explicitCache: false },
    cacheMode: 'implicit',
    price: {
      inputPerMTok: 0.3,
      outputPerMTok: 1.2,
      // Trang giá chính thức không đọc được ngày 30/10/2026; các trang thứ ba
      // ghi số khác nhau. Để null: chi phí tính theo giá đầy đủ (cận trên).
      cachedInputRatio: null,
      cacheWriteRatio: null,
      source: 'Báo cáo §5.2.3 bản 24/10; trang thứ ba ghi 0,14 / 0,28 — mâu thuẫn, chưa kiểm',
      verified: false,
    },
    dataPolicy: {
      noTraining: 'not_found',
      source: 'https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html',
      checkedAt: '2026-10-29',
      note:
        'Privacy Policy (10/02/2026) dùng dữ liệu "to train and improve our technology", từ chối qua privacy@deepseek.com; Open Platform Terms không nói về huấn luyện trên dữ liệu API',
    },
  };
}

/* ── Chuỗi model cho người dẫn truyện ──────────────────────────────── */

export interface ExcludedModel {
  provider: ProviderId;
  reason: string;
}

/**
 * Thứ tự thử: Qwen trực tiếp, Qwen qua OpenRouter, rồi DeepSeek dự phòng (D-107).
 *
 * Model bị loại khi thiếu key, hoặc khi nhà cung cấp chưa có cam kết không
 * huấn luyện trên dữ liệu — theo hướng của cô: chỉ dùng nhà cung cấp trích
 * được cam kết ấy. Lý do loại được trả về để in ra lúc khởi động, không im lặng.
 */
export function narratorChain(settings: AiSettings): {
  chain: ModelSpec[];
  excluded: ExcludedModel[];
} {
  const chain: ModelSpec[] = [];
  const excluded: ExcludedModel[] = [];

  const candidates: Array<[ProviderId, () => ModelSpec | null]> = [
    ['qwen', () => (settings.qwen ? qwenFlash(settings.qwen) : null)],
    [
      'openrouter',
      () =>
        settings.openrouter
          ? openRouterQwenFlash(settings.openrouter, {
              allowDataCollection: settings.allowUnconfirmedProviders,
            })
          : null,
    ],
    ['deepseek', () => (settings.deepseek ? deepseekFlash() : null)],
  ];

  for (const [provider, build] of candidates) {
    // Cấu hình sai (thiếu workspace) không được làm sập cả API lúc khởi động:
    // phần không dùng AI vẫn phải chạy. Loại model đó và nói rõ vì sao.
    let spec: ModelSpec | null;
    try {
      spec = build();
    } catch (err) {
      excluded.push({ provider, reason: err instanceof Error ? err.message : String(err) });
      continue;
    }
    if (!spec) {
      // OpenRouter chỉ là một cách mua khác, không có key không phải điều đáng báo.
      if (provider !== 'openrouter') excluded.push({ provider, reason: 'chưa có API key' });
    } else if (
      spec.dataPolicy.noTraining !== 'confirmed' &&
      !settings.allowUnconfirmedProviders
    ) {
      excluded.push({
        provider,
        reason: `chưa có cam kết không huấn luyện trên dữ liệu (${spec.dataPolicy.source})`,
      });
    } else {
      chain.push(spec);
    }
  }

  return { chain, excluded };
}

/** Key cho gateway. Một nơi duy nhất, để module và script chạy thử không lệch nhau. */
export const gatewayKeys = (settings: AiSettings): Partial<Record<ProviderId, string>> => ({
  qwen: settings.qwen?.apiKey,
  openrouter: settings.openrouter?.apiKey,
  deepseek: settings.deepseek?.apiKey,
});
