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

export type QwenRegion = 'ap-southeast-1' | 'eu-central-1' | 'us-east-1';

export interface QwenSettings {
  apiKey: string;
  region: QwenRegion;
  workspaceId?: string;
  baseUrl?: string;
  cacheMode: CacheMode;
}

export interface AiSettings {
  qwen?: QwenSettings;
  deepseek?: { apiKey: string };
  /** Cho gọi nhà cung cấp chưa có cam kết không huấn luyện (chỉ để thử bằng dữ liệu giả). */
  allowUnconfirmedProviders: boolean;
}

/* ── Qwen (Alibaba Cloud Model Studio) ─────────────────────────────── */

const QWEN_DATA_POLICY: DataPolicy = {
  noTraining: 'confirmed',
  source:
    'https://www.alibabacloud.com/help/en/model-studio/faq-about-alibaba-cloud-model-studio (mục 6)',
  checkedAt: '2026-10-29',
  note: '"Alibaba Cloud strictly protects data privacy and never uses your data for model training."',
};

/**
 * Endpoint theo region. Tài liệu (30/10/2026) ghi endpoint dạng
 * `{WorkspaceId}.{region}.maas.aliyuncs.com`; riêng Singapore còn endpoint
 * quốc tế cũ không cần workspace.
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
  // Tài liệu Structured output (cập nhật 29/10/2026): "Singapore region
  // models are not supported yet" cho JSON Schema.
  const jsonSchema = settings.region !== 'ap-southeast-1';

  // Implicit: trúng cache tính 20% giá vào, không phí tạo. Explicit: tạo
  // 125%, trúng 10% — nhưng tài liệu ghi riêng qwen3.8-flash "uses different
  // creation and hit ratios that vary by region", nên chưa coi là đã kiểm.
  const price: Price = {
    inputPerMTok: 0.15,
    outputPerMTok: 0.47,
    cachedInputRatio: settings.cacheMode === 'explicit' ? 0.1 : 0.2,
    cacheWriteRatio: settings.cacheMode === 'explicit' ? 1.25 : null,
    source:
      'Giá: báo cáo §5.2.3 bản 24/10. Tỉ lệ cache: trang Context cache của Model Studio (30/10/2026), tỉ lệ chung — qwen3.8-flash khác theo region',
    verified: false,
  };

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
    dataPolicy: QWEN_DATA_POLICY,
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
 * Thứ tự thử: Qwen trước, DeepSeek dự phòng (D-107).
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
    ['deepseek', () => (settings.deepseek ? deepseekFlash() : null)],
  ];

  for (const [provider, build] of candidates) {
    const spec = build();
    if (!spec) {
      excluded.push({ provider, reason: 'chưa có API key' });
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
