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
    source:
      'https://www.alibabacloud.com/help/en/model-studio/model-pricing (5/11/2026)',
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
          source:
            'https://www.alibabacloud.com/help/en/model-studio/token-plan-personal-overview',
          checkedAt: '2026-11-11',
          note: 'Key gói (sk-sp-…): chưa đọc được điều khoản dữ liệu của gói',
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
    baseUrl: (settings.baseUrl ?? 'https://openrouter.ai/api/v1').replace(
      /\/+$/,
      '',
    ),
    supports: { jsonSchema: true, explicitCache: false },
    cacheMode: 'implicit',
    price: {
      inputPerMTok: 0.15,
      outputPerMTok: 0.47,
      // 0,016 / 0,15 và 0,2 / 0,15, theo endpoint Alibaba trên OpenRouter.
      cachedInputRatio: 0.016 / 0.15,
      cacheWriteRatio: 0.2 / 0.15,
      source:
        'https://openrouter.ai/api/v1/models/qwen/qwen3.8-flash/endpoints (6/11/2026)',
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
      note: 'OpenRouter: "does not store your prompts or responses", huấn luyện tắt mặc định. Mỗi request gửi `data_collection: deny`: nếu OpenRouter không xếp Alibaba vào nhóm không thu thập thì request bị từ chối, không gửi đi. Thêm một bên trung gian so với gọi trực tiếp',
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
      source:
        'Báo cáo §5.2.3 bản 24/10; trang thứ ba ghi 0,14 / 0,28 — mâu thuẫn, chưa kiểm',
      verified: false,
    },
    dataPolicy: {
      noTraining: 'not_found',
      source:
        'https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html',
      checkedAt: '2026-10-29',
      note: 'Privacy Policy (10/02/2026) dùng dữ liệu "to train and improve our technology", từ chối qua privacy@deepseek.com; Open Platform Terms không nói về huấn luyện trên dữ liệu API',
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
      excluded.push({
        provider,
        reason: err instanceof Error ? err.message : String(err),
      });
      continue;
    }
    if (!spec) {
      // OpenRouter chỉ là một cách mua khác, không có key không phải điều đáng báo.
      if (provider !== 'openrouter')
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

/* ── Judge của AI-5, qua OpenRouter ────────────────────────────────── */

/**
 * Ba họ judge (D-107, §5.2.3): ba họ có điểm tiếng Việt SEA-HELM cao nhất.
 * Mỗi họ hai bậc: `small` rẻ, `mid` mạnh hơn. Bậc nào làm chính chốt bằng phép
 * thử §7.3 — giữ bậc rẻ trừ khi nó kém rõ rệt; bậc còn lại làm dự phòng cùng
 * họ, để panel luôn đủ ba họ (DC-01).
 *
 * Gọi qua OpenRouter (D-131): một key cho cả ba họ. Mỗi request đòi endpoint
 * không lưu dữ liệu (`zdr: true`) và chỉ một endpoint ghi sẵn (`only`), nên
 * OpenRouter không tự đổi sang nơi khác. Endpoint ZDR của Claude chạy trên
 * Google Vertex, của GPT trên Azure, của Gemini trên Google Vertex — cùng
 * model, cùng giá niêm yết với API gốc.
 */
export type JudgeFamily = 'anthropic' | 'openai' | 'google';
export type JudgeTier = 'small' | 'mid';

export const JUDGE_FAMILIES: readonly JudgeFamily[] = [
  'anthropic',
  'openai',
  'google',
];

interface JudgeModelRow {
  model: string;
  /** Tag endpoint ZDR trên OpenRouter (`provider.only`) — một nơi phục vụ, ghi được vào bản ghi. */
  host: string;
  input: number;
  output: number;
  cachedRead: number;
  temperature: boolean;
  /** Mức suy nghĩ thấp nhất endpoint nhận; thiếu là tắt hẳn (`none`). */
  minReasoning?: 'minimal';
}

/**
 * Giá và tham số đọc từ `GET /api/v1/endpoints/zdr` của OpenRouter ngày
 * 12/11/2026 (dòng `google-vertex/global` và `azure`: cùng giá niêm yết với
 * hãng gốc). Không endpoint ZDR nào nhận `temperature`. Thử thật 12/11/2026:
 * Haiku 5.5, GPT-6 Luna nhận `reasoning.effort: none`; Sonnet 5.5, GPT-6.1 Sol
 * và Gemini 3.x báo "Reasoning is mandatory", `minimal` thì chạy.
 */
const JUDGE_MODELS: Record<JudgeFamily, Record<JudgeTier, JudgeModelRow>> = {
  anthropic: {
    small: {
      model: 'anthropic/claude-haiku-5.5',
      host: 'google-vertex/global',
      input: 0.1,
      output: 0.5,
      cachedRead: 0.01,
      temperature: false,
    },
    mid: {
      model: 'anthropic/claude-sonnet-5.5',
      host: 'google-vertex/global',
      input: 2,
      output: 10,
      cachedRead: 0.1,
      temperature: false,
      minReasoning: 'minimal',
    },
  },
  openai: {
    small: {
      model: 'openai/gpt-6-luna',
      host: 'azure',
      input: 0.1,
      output: 0.5,
      cachedRead: 0.01,
      temperature: false,
    },
    mid: {
      model: 'openai/gpt-6.1-sol',
      host: 'azure',
      input: 2,
      output: 10,
      cachedRead: 0.1,
      temperature: false,
      minReasoning: 'minimal',
    },
  },
  google: {
    small: {
      model: 'google/gemini-3.5-flash-lite',
      host: 'google-vertex/global',
      input: 0.3,
      output: 2.5,
      cachedRead: 0.03,
      temperature: false,
      minReasoning: 'minimal',
    },
    mid: {
      model: 'google/gemini-3.8-flash',
      host: 'google-vertex/global',
      input: 0.75,
      output: 3.75,
      cachedRead: 0.075,
      temperature: false,
      minReasoning: 'minimal',
    },
  },
};

export function openRouterJudge(
  settings: OpenRouterSettings,
  family: JudgeFamily,
  tier: JudgeTier,
  options: { allowDataCollection: boolean },
): ModelSpec {
  const row = JUDGE_MODELS[family][tier];
  return {
    key: `${row.model.split('/')[1]}@openrouter`,
    provider: 'openrouter',
    model: row.model,
    family,
    region: 'openrouter',
    baseUrl: (settings.baseUrl ?? 'https://openrouter.ai/api/v1').replace(
      /\/+$/,
      '',
    ),
    supports: {
      jsonSchema: true,
      explicitCache: false,
      temperature: row.temperature,
    },
    ...(row.minReasoning ? { minReasoning: row.minReasoning } : {}),
    cacheMode: 'implicit',
    price: {
      inputPerMTok: row.input,
      outputPerMTok: row.output,
      cachedInputRatio: row.cachedRead / row.input,
      cacheWriteRatio: null,
      source: `https://openrouter.ai/api/v1/endpoints/zdr (12/11/2026, dòng ${row.model} @ ${row.host})`,
      verified: true,
    },
    routing: {
      only: [row.host],
      dataCollection: options.allowDataCollection ? 'allow' : 'deny',
      zdr: true,
    },
    dataPolicy: {
      noTraining: 'confirmed',
      source: 'https://openrouter.ai/api/v1/endpoints/zdr',
      checkedAt: '2026-11-12',
      note: 'Mỗi request gửi `zdr: true` và `data_collection: deny`: endpoint không thuộc nhóm không lưu dữ liệu thì OpenRouter từ chối (thử 12/11/2026: GPT-6 Luna ở host `openai` bị trả 404 "No endpoints found matching your data policy"). OpenRouter mặc định không lưu prompt. Câu trả lời đã khử định danh trước khi gửi (DC-03)',
    },
  };
}

/** Một ghế trong panel: một họ, bậc chính rồi bậc dự phòng cùng họ. */
export interface JudgeSlot {
  /** 1, 2, 3 — `judge_slot` ở ERD-06. */
  slot: number;
  family: JudgeFamily;
  chain: ModelSpec[];
}

/**
 * DC-01: ba judge và model dẫn truyện thuộc bốn họ khác nhau. Trả về lỗi thay
 * vì ném, để lúc khởi động in ra và tắt AI-5, không làm sập phần không dùng AI.
 */
export function familyConflicts(
  slots: readonly JudgeSlot[],
  narratorFamilies: readonly string[],
): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const { slot, family, chain } of slots) {
    if (seen.has(family))
      problems.push(`ghế ${slot}: họ ${family} đã có ở ghế khác`);
    seen.add(family);
    if (narratorFamilies.includes(family))
      problems.push(`ghế ${slot}: họ ${family} trùng họ model dẫn truyện`);
    for (const spec of chain)
      if (spec.family !== family)
        problems.push(
          `ghế ${slot}: ${spec.key} thuộc họ ${spec.family}, không phải ${family}`,
        );
  }
  return problems;
}

/**
 * Panel ba judge. Thiếu key OpenRouter thì không có ghế nào — AI-5 báo "không
 * có model" thay vì chấm bằng cách khác (D-92).
 */
export function judgePanel(
  settings: AiSettings,
  options: {
    primaryTier?: JudgeTier;
    narratorFamilies?: readonly string[];
  } = {},
): { slots: JudgeSlot[]; problems: string[] } {
  if (!settings.openrouter)
    return { slots: [], problems: ['chưa có OPENROUTER_API_KEY'] };
  const primary = options.primaryTier ?? 'small';
  const fallback: JudgeTier = primary === 'small' ? 'mid' : 'small';
  const build = (family: JudgeFamily, tier: JudgeTier) =>
    openRouterJudge(settings.openrouter as OpenRouterSettings, family, tier, {
      allowDataCollection: settings.allowUnconfirmedProviders,
    });

  const slots = JUDGE_FAMILIES.map((family, i) => ({
    slot: i + 1,
    family,
    chain: [build(family, primary), build(family, fallback)],
  }));
  const problems = familyConflicts(
    slots,
    options.narratorFamilies ?? ['qwen', 'deepseek'],
  );
  return problems.length > 0 ? { slots: [], problems } : { slots, problems };
}

/** Key cho gateway. Một nơi duy nhất, để module và script chạy thử không lệch nhau. */
export const gatewayKeys = (
  settings: AiSettings,
): Partial<Record<ProviderId, string>> => ({
  qwen: settings.qwen?.apiKey,
  openrouter: settings.openrouter?.apiKey,
  deepseek: settings.deepseek?.apiKey,
});
