# Model families available in October 2026: prices, capabilities and Vietnamese-language evidence (for JobQuest)

All pages were opened on **8 October 2026** unless a row says otherwise. Source types are tagged: **[official]** provider documentation or pricing page, **[peer-reviewed]**, **[preprint]**, **[leaderboard]** official benchmark leaderboard, **[third-party]** independent measurement, **[snippet]** seen only in a search-result summary and NOT opened (treat as unverified). Prices are USD per 1 million tokens unless stated.

## 1. What counts as a "model family"?

### Takeaway
The judge-bias literature gives a three-level definition of relatedness (same model, inheritance by fine-tuning or training on outputs, same family = different versions or sizes from one line), and the measured bias falls in that order, so "family" should be decided by the model's developer line and training lineage, not by the API that serves it. No source defines "family" for the exact JobQuest setting (a generator writing answers that a judge scores), so the operational rule below is a proposal built on those definitions.

### Cited Findings
- Li et al., "Preference Leakage: A Contamination Problem in LLM-as-a-judge" (arXiv 2502.01534; the arXiv listing says "Accepted by ICLR 2026", v3 revised 4 Mar 2026) defines three relatednesses between a data-generator LLM and a judge LLM: "being the same model, having an inheritance relationship, and belonging to the same model family". [peer-reviewed] — [arXiv abs 2502.01534](https://arxiv.org/abs/2502.01534)
- In Section 3.3 of that paper: *same model* = generator and judge are "the exact same model instance"; *inheritance* = one model is built on the other, either by fine-tuning it or by training on its outputs (either direction; examples: fine-tuning the generator into the judge, or fine-tuning a base model on the generator's synthetic data); *same family* = generator and judge share a family, example given "different versions or sizes of GPT", described as sharing an architecture and substantially overlapping pre-training data. [peer-reviewed] — [arXiv HTML 2502.01534v3](https://arxiv.org/html/2502.01534v3)
- Size of the effect by relatedness in that paper (preference-leakage score, PLS): same model 23.6% on average; inheritance 19.3% (same instructions) and 22.3% (different instructions); same family 8.9% (same series) and 2.8% (different series). Models used: GPT-4o-2024-11-20, Gemini-1.5-flash, LLaMA-3.3-70B as generators/judges; Mistral-7B and Qwen-2.5-14B as students; benchmarks Arena-Hard and AlpacaEval 2.0. [peer-reviewed] — [arXiv HTML 2502.01534v3](https://arxiv.org/html/2502.01534v3)
- Goel et al., "Great Models Think Alike and this Undermines AI Oversight" (arXiv 2502.04313, v2 12 Jun 2025; no venue shown on the arXiv listing) propose CAPA, "a metric for LM similarity based on overlap in model mistakes", and report that "LLM-as-a-judge scores favor models similar to the judge". [preprint] — [arXiv abs 2502.04313](https://arxiv.org/abs/2502.04313)
- Kim, Garg, Peng and Garg, "Correlated Errors in Large Language Models" (arXiv 2506.07962, accepted to ICML 2025), over 350 LLMs: on one leaderboard dataset "models agree 60% of the time when both models err"; shared architecture and shared provider are identified as drivers of correlation; and "larger and more accurate models have highly correlated errors" even with distinct architectures and providers. [peer-reviewed] — [arXiv abs 2506.07962](https://arxiv.org/abs/2506.07962)
- Real examples of inheritance among October 2026 candidates: SEA-LION v4.5 (Qwen) 27B is built on Qwen3.6-27B and was produced by logit distillation from Qwen3.5-397B-A17B plus model merging [official model card] — [Hugging Face: aisingapore/Qwen-SEA-LION-v4.5-27B-IT](https://huggingface.co/aisingapore/Qwen-SEA-LION-v4.5-27B-IT); Meta's open-weight Muse Glimmer (30B) is distilled from Muse Spark [official] — [Meta: Muse Glimmer overview](https://dev.meta.ai/docs/muse-glimmer); Viettel's VT-Super-120B-A12B is trained and fine-tuned from NVIDIA Nemotron 3 Super [official press page] — [Viettel AI, 29 May 2026](https://viettelai.vn/en/tin-tuc/viettel-trains-120-billion-parameter-vietnamese-sovereign-ai-model); the VMLU leaderboard lists "DeepSeek-R1-Distill-Llama-70B" and "DeepSeek-R1-Distill-Qwen-32B" (distilled across two developers) [leaderboard] — [VMLU leaderboard](https://vmlu.ai/leaderboard).
- The same model is sold by many hosts, so host is not family: Groq serves OpenAI's gpt-oss and Alibaba's qwen3.8-27b [official] — [Groq models](https://console.groq.com/docs/models); FPT AI Factory lists GPT-4.1, Gemini-3.5-Flash, DeepSeek-V4-Flash, GLM-5.2 and Llama-3.3-70B on one price page [official] — [FPT AI Factory pricing](https://factory.fpt.ai/pricing/); Mistral's own model catalogue lists Z.ai GLM 5.3 [official] — [Mistral models overview](https://docs.mistral.ai/getting-started/models/models_overview/).
- Anthropic's Models API exposes a `line` field (e.g. `opus`) that "names the model line it belongs to"; an example of a provider-defined grouping below the family level. [official] — [Claude models overview](https://platform.claude.com/docs/en/about-claude/models/overview)

### Inferences
- Proposed operational definition the report can cite (built on Li et al.'s three relatednesses): two models are **in the same family** if any of the following holds: (a) they are the same model or snapshots of it; (b) one was fine-tuned, distilled, merged from, or trained on outputs of the other or of any member of the other's family (inheritance, either direction); (c) they are versions or sizes of one line released by the same developer (e.g. GPT-6 Astra / Sol / Luna; Claude Opus / Sonnet / Haiku; Qwen Max / Plus / Flash and the open Qwen3.x weights). The **host or API reseller is irrelevant** to family membership. A derived model belongs to the family of **every** ancestor (so a "DeepSeek-R1-Distill-Qwen" model counts as both DeepSeek and Qwen; SEA-LION v4.5 (Qwen) counts as Qwen).
- Open-weight siblings of a closed line (gpt-oss vs GPT; Gemma vs Gemini; Muse Glimmer vs Muse Spark) should conservatively be treated as the same family as the closed line. For Muse Glimmer this is documented (distilled from Muse Spark). For gpt-oss/GPT and Gemma/Gemini I did not open a source in this session that documents shared training data or distillation, so this is a precaution rather than a cited fact.
- Li et al.'s numbers suggest the "same family" tie is the weakest of the three (2.8–8.9% versus about 19–24%), so the family rule is the cheap, checkable proxy, while inheritance is the relationship that matters most to exclude. Kim et al. and Goel et al. imply that picking different families reduces but does not remove correlated errors, because strong models err alike across providers; family diversity is necessary, not sufficient.
- Important scope limit: Li et al. measure leakage through a three-step chain (generator writes training data → student model is trained on it → judge scores the student). JobQuest's case is direct (generator writes a simulated answer → judge scores it), which is closer to self-preference bias than to preference leakage. The definition of relatedness transfers; the effect sizes do not.

### Gaps
- No source opened here defines "family" for direct generator-to-judge scoring of short rubric answers, in Vietnamese, or for ordinal scales. The measurement that would close the gap: in the Stage A benchmark, have each candidate family write the same degraded-answer variants and test whether any judge scores answers from its own family higher than the known level (per-family mean signed error).
- I did not open the self-preference papers (e.g. on LLM evaluators favouring their own generations); a neighbouring researcher covering judge bias should supply them.
- Whether Gemma shares training data or lineage with Gemini, and gpt-oss with GPT, was not verified from an official page.

## 2. Major families in October 2026: models by tier, list prices, discounts, context, structured output, weights, hosting

### Takeaway
Every major family now has a small/fast tier at or below about $0.30 input / $2.50 output per million tokens (several at $0.10 / $0.50), 50% batch discounts are near-universal, and schema-constrained JSON output is documented for OpenAI, Anthropic, Google and Mistral but only JSON-object mode for DeepSeek and (in the Singapore region) Qwen. Meta no longer serves Llama on its own API (it serves "Muse"), and line-ups changed within days of this reading (Mistral Large 4 was published 6 Oct 2026; Claude Haiku 5.5's retirement floor is dated from 7 Oct 2026), so every number below is a snapshot.

### Cited Findings

**Price table (official provider pages only; USD per 1M tokens; standard/on-demand tier).** "Cache" = price of a cached-input read.

| Family | Tier | Model (API id) | Input | Output | Cache read | Batch | Source URL | Access date |
|---|---|---|---|---|---|---|---|---|
| OpenAI | flagship | gpt-6-astra | 10.00 | 50.00 | 1.00 | 5.00 / 25.00 | https://developers.openai.com/api/docs/pricing | 8 Oct 2026 |
| OpenAI | mid | gpt-6.1-sol | 2.00 | 10.00 | 0.10 | 1.00 / 5.00 | same | 8 Oct 2026 |
| OpenAI | small | gpt-6-luna | 0.10 | 0.50 | 0.01 | 0.05 / 0.25 | same | 8 Oct 2026 |
| OpenAI | older small | gpt-5.6-luna | 0.20 | 1.20 | 0.02 | 0.10 / 0.60 | same | 8 Oct 2026 |
| OpenAI | older small | gpt-5.4-mini / gpt-5.4-nano | 0.75 / 0.20 | 4.50 / 1.25 | 0.075 / 0.02 | 0.375, 2.25 / 0.10, 0.625 | same | 8 Oct 2026 |
| OpenAI | older small | gpt-5-nano / gpt-4.1-nano | 0.05 / 0.10 | 0.40 / 0.40 | 0.005 / 0.025 | 0.025, 0.20 / 0.05, 0.20 | same | 8 Oct 2026 |
| Anthropic | flagship | claude-fable-5-1 | 10 | 50 | 0.25 | 5 / 25 | https://platform.claude.com/docs/en/about-claude/pricing | 8 Oct 2026 |
| Anthropic | high | claude-opus-5-5 | 4 | 20 | 0.20 | 2 / 10 | same | 8 Oct 2026 |
| Anthropic | mid | claude-sonnet-5-5 | 2 | 10 | 0.10 | 1 / 5 | same | 8 Oct 2026 |
| Anthropic | small | claude-haiku-5-5 (prompt ≤ 100K tokens) | 0.10 | 0.50 | 0.01 | 0.05 / 0.25 | same | 8 Oct 2026 |
| Anthropic | small | claude-haiku-5-5 (prompt > 100K tokens) | 0.50 | 2.50 | 0.05 | 0.25 / 1.25 | same | 8 Oct 2026 |
| Anthropic | older small | claude-haiku-4-5 | 1 | 5 | 0.10 | 0.50 / 2.50 | same | 8 Oct 2026 |
| Google | flagship (preview) | gemini-3.1-pro-preview (≤ 200K) | 2.00 | 12.00 | 0.20 + $4.50/h storage | 50% | https://ai.google.dev/gemini-api/docs/pricing | 8 Oct 2026 |
| Google | mid | gemini-3.8-flash | 0.75 (page lists 1.50 for 2027) | 3.75 (7.50 for 2027) | 0.075 + $0.50/h storage | 50% | same | 8 Oct 2026 |
| Google | small | gemini-3.5-flash-lite | 0.30 | 2.50 | 0.03 + $1.00/h storage | 50% | same | 8 Oct 2026 |
| Google | small | gemini-3.1-flash-lite | 0.25 | 1.50 | 0.025 + $1.00/h storage | 50% | same | 8 Oct 2026 |
| Google | older small | gemini-2.5-flash-lite | 0.10 | 0.40 | 0.01 + $1.00/h storage | 50% | same | 8 Oct 2026 |
| Google | open weights on API | Gemma 4 | free tier only (paid tier "not available") | free | free | not listed | same | 8 Oct 2026 |
| Meta | hosted | muse-spark-1.3 (Standard tier) | 1.25 | 4.25 | 0.15 | not mentioned | https://dev.meta.ai/docs/pricing-rate-limits | 8 Oct 2026 |
| Meta | hosted, data-sharing | muse-spark-1.3-contributor | 0.10 | 0.20 | 0.002 | not mentioned | same | 8 Oct 2026 |
| Mistral | flagship (public preview) | Mistral Large 4 | 0.68 (shown as discounted from 1.36) | 2.09 (from 4.18) | 0.07 (from 0.14) | 50% (FAQ) | https://docs.mistral.ai/models/mistral-large-4-0 | 8 Oct 2026 |
| Mistral | mid | Mistral Medium 3.5 | 1.5 | 7.5 | up to −90% (FAQ) | 50% (FAQ) | https://docs.mistral.ai/models/mistral-medium-3-5-26-04 | 8 Oct 2026 |
| Mistral | small | Mistral Small 4 (mistral-small-2603) | 0.15 | 0.6 | up to −90% (FAQ) | 50% (FAQ) | https://docs.mistral.ai/models/mistral-small-4-0-26-03 | 8 Oct 2026 |
| Mistral | edge | Ministral 3 8B (ministral-8b-2512) | 0.15 (page shows one figure; input/output not labelled separately) | see left | — | 50% (FAQ) | https://docs.mistral.ai/models/ministral-3-8b-25-12 | 8 Oct 2026 |
| Alibaba Qwen (International, Singapore) | flagship | qwen3.8-max | 2 | 6 | 10% of input | not listed for this model | https://www.alibabacloud.com/help/en/model-studio/model-pricing | 8 Oct 2026 |
| Alibaba Qwen | mid | qwen3.7-plus (0–256K tier) | 0.4 | 1.6 | 10% of input | not listed | same | 8 Oct 2026 |
| Alibaba Qwen | small | qwen3.8-flash | 0.15 | 0.47 | 10% of input | not listed | same | 8 Oct 2026 |
| Alibaba Qwen | small | qwen3.7-flash (0–32K tier) | 0.030 | 0.130 | 10% of input | 50% | same | 8 Oct 2026 |
| Alibaba Qwen | small | qwen-flash (0–256K tier) | 0.05 | 0.40 | 10% of input | 50% | same | 8 Oct 2026 |
| Alibaba Qwen | open weights on API | qwen3-8b / qwen3-14b / qwen3-32b | 0.18 / 0.35 / 0.16 | 0.7 / 1.4 / 0.64 (non-thinking) | — | — | same | 8 Oct 2026 |
| DeepSeek | flagship | deepseek-v4-pro (V4-Pro-0813) | 1.32 peak / 0.66 off-peak | 3.96 peak / 1.98 off-peak | 0.044 peak / 0.022 off-peak | none listed | https://api-docs.deepseek.com/quick_start/pricing | 8 Oct 2026 |
| DeepSeek | small/fast | deepseek-flash (V4.1-Flash) | 0.30 peak / 0.15 off-peak | 1.20 peak / 0.60 off-peak | 0.006 peak / 0.003 off-peak | none listed | same | 8 Oct 2026 |

Notes on the table, each from the page in the same row unless another link is given:
- OpenAI: Flex tier prices equal the batch prices (e.g. gpt-6-luna $0.05 / $0.25); "Fast mode" (renamed from Priority on 30 Jul 2026) doubles price; regional-processing endpoints carry a 10% uplift for models released on or after 5 Mar 2026. The page shows no "last updated" date. [official] — [OpenAI pricing](https://developers.openai.com/api/docs/pricing)
- Anthropic: cache writes cost 1.25× (5-minute) or 2× (1-hour) base input; cache reads 0.1× (0.05× on Opus 5.5 and Sonnet 5.5; 0.025× on Fable 5.1); Batch API is 50% off and stacks with caching; US-only inference (`inference_geo: "us"`) costs 1.1×; "Claude 4.7 and later models ... use a newer tokenizer" that "produces approximately 30% more tokens for the same text". The page FAQ says "New users receive a small amount of free credits" and "Academic and research discounts may be available". [official] — [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Google: page states last update 2026-10-07 UTC; the 3.6/3.7/3.8 Flash rows already list doubled prices for 2027; Gemini 3.1 Pro Preview has no free tier. [official] — [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- Mistral: the pricing page itself gives only one per-token example, "Mistral Large costs $0.5 /M tokens in and $1.5 /M tokens out", plus "Batch processing ... reduces the price by 50%, and cached input tokens reduce input cost by up to 90%"; per-model prices are on the model cards. The $0.5/$1.5 example does not match the Large 4 card ($0.68/$2.09 promotional, $1.36/$4.18 struck through), so it probably refers to Mistral Large 3; I did not open the Large 3 card. [official] — [Mistral pricing](https://mistral.ai/pricing); [Mistral Large 4 card](https://docs.mistral.ai/models/mistral-large-4-0)
- Alibaba: prices are tiered by input length per request (e.g. qwen3.7-flash $0.03 / $0.10 / $0.20 input for 0–32K / 32K–256K / 256K–1M); cache hits are billed at 10% of input and explicit cache creation at 125%; batch is 50% and cannot be combined with the cache discount; free quota is 1M tokens per model, valid 90 days. Only the first 100,000 of about 190,000 characters of this page were read. [official] — [Alibaba Model Studio pricing](https://www.alibabacloud.com/help/en/model-studio/model-pricing)
- DeepSeek: off-peak is half of peak; peak hours are 01:00–04:00 and 06:00–10:00 UTC Monday–Friday (that is 08:00–11:00 and 13:00–17:00 Vietnam time). [official] — [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing)
- Meta: the Standard tier's prompts and completions are "not used to train Meta models"; the Contributor tier is discounted in exchange for permission to train on prompts and completions. Rate limits: Standard 3,000 requests/min, Contributor 100 requests/min. [official] — [Meta pricing and rate limits](https://dev.meta.ai/docs/pricing-rate-limits)

**Context windows, output limits, structured output, weights, hosting.**
- OpenAI: GPT-6 Astra, GPT-6.1 Sol and GPT-6 Luna each list a 1.05M-token context and 128K max output; knowledge cut-off 30 Apr 2026 (Luna: 18 May 2026). [official] — [OpenAI models](https://developers.openai.com/api/docs/models). Structured Outputs (`json_schema`, `strict: true`) "ensures the model will always generate responses that adhere to your supplied JSON Schema", is available from GPT-4o onward, and differs from JSON mode, which only guarantees valid JSON; refusals and max-token truncation are the stated exceptions. [official] — [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs). API data is not used for training by default; abuse-monitoring logs kept up to 30 days; regional *processing* is offered only in the US, Europe and UAE, while Singapore, Japan, India, Australia, Canada, South Korea and the UK are storage-only, and data residency needs sales approval. [official] — [OpenAI: your data](https://developers.openai.com/api/docs/guides/your-data). Open weights: gpt-oss-20b (21B total / 3.6B active) and gpt-oss-120b (117B / 5.1B active), Apache 2.0. [official model card] — [Hugging Face: openai/gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b)
- Anthropic: Fable 5.1, Opus 5.5, Sonnet 5.5 and Haiku 5.5 all list a 1M-token context and 128K max output; comparative latency labels are Slower / Moderate / Fast / Fastest; Haiku 5.5 is described as "For high-volume, latency-sensitive tasks such as classification, extraction, and routing"; models are available on the Claude API, Amazon Bedrock, Google Cloud, Microsoft Foundry and Claude Platform on AWS; weights are closed. [official] — [Claude models overview](https://platform.claude.com/docs/en/about-claude/models/overview). Structured outputs are generally available with constrained decoding for the Claude 5 and 4.5+ models; unsupported schema features include recursive schemas, numeric `minimum`/`maximum`, string length constraints; first use compiles a grammar (cached 24 h), which adds first-request latency. [official] — [Claude structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- Google: the models page lists Gemini 3.8/3.7/3.6/3.5 Flash, 3.5 and 3.1 Flash-Lite as stable and Gemini 3.1 Pro as preview; the fetched text did not include token limits. [official] — [Gemini models](https://ai.google.dev/gemini-api/docs/models). Structured output constrains responses to "a subset of the JSON Schema specification"; "always validate values in your application"; "Very large or deeply nested schemas may be rejected"; the SDK accepts Zod (JavaScript) and Pydantic schemas. [official] — [Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output). Vietnam is in the list of regions where the Gemini API and AI Studio are available; users must be 18+. [official] — [Gemini available regions](https://ai.google.dev/gemini-api/docs/available-regions). Open weights: Gemma 4 in sizes E2B, E4B, 12B, 26B A4B (MoE) and 31B; context 128K (small) / 256K (medium); licence Apache 2.0; function calling built in. [official] — [Gemma 4 docs](https://ai.google.dev/gemma/docs/core); [Hugging Face: google/gemma-4-12b-it](https://huggingface.co/google/gemma-4-12b-it)
- Meta: the Meta Model API serves `muse-spark-1.3` (text/image/video/audio/PDF in, text out; 1,048,576-token context) and earlier Muse Spark versions; the page does not mention Llama. Muse Glimmer is the open-weight model and "runs on your own hardware"; it is not served on a Meta endpoint. [official] — [Meta models](https://dev.meta.ai/docs/models). Muse Glimmer: 30B parameters, Apache License 2.0, default 128K context, trained on data from more than 100 languages, distilled from Muse Spark. [official] — [Muse Glimmer overview](https://dev.meta.ai/docs/muse-glimmer). Llama models remain available from third-party hosts, e.g. Llama 3.3 70B at $1.04/$1.04 on Together [official] — [Together pricing](https://www.together.ai/pricing), and $0.209/$0.451 on FPT AI Factory [official] — [FPT AI Factory pricing](https://factory.fpt.ai/pricing/); Groq lists llama-3.3-70b-versatile and llama-3.1-8b-instant with price "Contact sales" [official] — [Groq models](https://console.groq.com/docs/models).
- Mistral: Large 4 — released 6 Oct 2026, public preview, 1M context, described as open-weight (licence not named on the card), 1.05T total / 52B active parameters, structured outputs and function calling supported [official] — [Mistral Large 4 card](https://docs.mistral.ai/models/mistral-large-4-0). Medium 3.5 — 28 Apr 2026, 256K context, open weights under a Modified MIT licence, structured outputs supported [official] — [Medium 3.5 card](https://docs.mistral.ai/models/mistral-medium-3-5-26-04). Small 4 — 16 Mar 2026, 256K context, Apache 2.0, "119B parameters with 6.5B active", structured outputs supported [official] — [Small 4 card](https://docs.mistral.ai/models/mistral-small-4-0-26-03). Ministral 3 14B / 8B / 3B — Apache 2.0, 256K context (8B card) [official] — [Mistral models overview](https://docs.mistral.ai/getting-started/models/models_overview/); [Ministral 3 8B card](https://docs.mistral.ai/models/ministral-3-8b-25-12)
- Alibaba Qwen: Model Studio regions fix where data is stored; the Singapore region (`ap-southeast-1`, endpoint `dashscope-intl.aliyuncs.com`) stores request data in Singapore and supports only the "International" inference scope; Beijing supports only the Chinese-mainland scope; a "Global" scope is selectable from Frankfurt, Tokyo, Hong Kong or Virginia. [official] — [Alibaba Model Studio regions](https://www.alibabacloud.com/help/en/model-studio/regions/). Structured output: JSON-object mode is supported on most Qwen text models (prompt must contain the word "JSON"); JSON-Schema mode (`strict`) is limited to the Qwen3.7 and Qwen3.8 Plus/Flash/Max series and the page says "Singapore region models are not supported yet"; in thinking mode the output "may not be strictly valid JSON". [official] — [Qwen structured output](https://www.alibabacloud.com/help/en/model-studio/qwen-structured-output). Open weights: Qwen3.5-9B is Apache-2.0, 262,144-token native context, "201 languages and dialects", thinking mode on by default. [official model card] — [Hugging Face: Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- DeepSeek: both API models list a 1M context, 384K max output, JSON Output and Tool Calls [official] — [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing). The JSON guide documents only `response_format: {"type": "json_object"}` (no schema-strict mode); the prompt must contain the word "json", and "the API may occasionally return empty content". [official] — [DeepSeek JSON output](https://api-docs.deepseek.com/guides/json_mode). Privacy policy (updated 10 Feb 2026): "we directly collect, process and store your Personal Data in People's Republic of China". [official] — [DeepSeek privacy policy](https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html). Weights are public: DeepSeek-V4-Flash-0731 is MIT-licensed, 304B parameters, with a serving example on "a single 4×GB300 node" [official model card] — [Hugging Face: DeepSeek-V4-Flash-0731](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731); the organisation page also lists V4-Pro-0813 (1.7T) and V4.1-Flash (763B) [official] — [Hugging Face: deepseek-ai](https://huggingface.co/deepseek-ai).
- Third-party hosts of open-weight models (official price pages of the hosts): Groq — gpt-oss-120b $0.15/$0.60, gpt-oss-20b $0.075/$0.30, qwen/qwen3.8-27b $0.80/$4.00 (preview), 131K context [official] — [Groq models](https://console.groq.com/docs/models); Together — Gemma 4 31B $0.39/$0.97, gpt-oss-120B $0.15/$0.60, Qwen3.5 9B $0.17/$0.25, Qwen3.8 Flash $0.15/$0.47, DeepSeek V4.1 Flash $0.30/$1.20 [official] — [Together pricing](https://www.together.ai/pricing).

### Inferences
- A four-family design is purchasable at the small tier for well under $1 per million output tokens per family (e.g. gpt-6-luna, claude-haiku-5-5, qwen3.7-flash/qwen3.8-flash, deepseek-flash, mistral-small, gemini flash-lite, or hosted open weights such as gpt-oss and Gemma 4). Illustration only: a judge call of 1,500 input + 300 output tokens costs about $0.0003 at $0.10/$0.50, so three judges cost roughly $0.001 per scored answer before caching; this arithmetic uses the table above and an assumed token count, and Vietnamese token counts per provider are not documented in any source opened.
- Schema-strict output is a real differentiator for DC-02 (replaceable provider): OpenAI, Anthropic, Google and Mistral document schema enforcement; DeepSeek documents only JSON-object mode with a known empty-content failure; Qwen's schema mode is not yet available in the Singapore region. A provider-neutral design therefore needs client-side validation (zod) and a retry path for at least the DeepSeek and Qwen cases.
- Data location differs sharply: DeepSeek's first-party API processes data in China; Qwen International stores data in Singapore; OpenAI offers no regional processing in Asia; Anthropic's default is global routing. All are cross-border transfers from Vietnam (DC-03); open-weight models (gpt-oss, Gemma 4, Qwen3.5, Muse Glimmer, Mistral Small/Ministral) are the only route to keep inference on infrastructure the team chooses.
- "Meta Llama" as a current family now means legacy open weights (Llama 3.3, Llama 4) on third-party hosts plus the new Muse line; the SEA-HELM data in section 5 shows the Llama 4 models are comparatively weak in Vietnamese.

### Gaps
- Artificial Analysis lists a "Gemini 4 Argon" from Google ([third-party](https://artificialanalysis.ai/leaderboards/models)), but neither Google's pricing page nor its models page (both read 8 Oct 2026) mentions it. Unresolved conflict; no official price found.
- Official context-window and max-output figures for the Gemini and Qwen API models were not in the pages I could read (Artificial Analysis shows 1M for Gemini 3.x Flash and Qwen3.7 Plus, 984K for Qwen3.8 Max, as third-party figures).
- Llama 3.3 / Llama 4 licence texts, Mistral's hosting location, and the licence name for Mistral Large 4 were not opened or not stated.
- Mistral Ministral 3 output price and Mistral Large 3 price: not confirmed (the page shows a single figure / I did not open the card). Third-party trackers disagree on Large 3, so I did not use them.
- Groq's llama prices ("Contact sales") and Together's batch discount values are not published on the pages read.
- Amazon Bedrock, Google Vertex AI and Azure Foundry regional prices (e.g. a Singapore region) were not read.

## 3. Free tiers, research credits and education programmes

### Takeaway
The only documented standing free API tier from a first-party frontier provider is Google's Gemini API free tier (Flash models and Gemma 4, with content used to improve Google products); other options are small trial credits or quotas (Alibaba 1M tokens per model for 90 days, Cerebras $5 for 30 days, OpenRouter free variants at 50–1,000 requests/day, Azure for Students $100). GitHub Models, often suggested to students, was retired on 30 July 2026.

### Cited Findings
- Google Gemini API: free tier exists for Gemini 3.8/3.7/3.6/3.5 Flash, 3.5 and 3.1 Flash-Lite, 2.5 Pro/Flash/Flash-Lite and Gemma 4 (Gemma 4 is free of charge with no paid tier); Gemini 3.1 Pro Preview has no free tier; the Free plan lists content as "used to improve our products". [official] — [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- Gemini free-tier rate limits are not published on the docs page; they "can be viewed in Google AI Studio". Tier 1 requires only a linked billing account; Tier 2 requires $100 paid and 3 days. [official] — [Gemini rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- Vietnam is an available region for the Gemini API and Google AI Studio; minimum age 18. [official] — [Gemini available regions](https://ai.google.dev/gemini-api/docs/available-regions)
- Alibaba Model Studio (International): free quota of 1M tokens for many models (e.g. qwen3.8-max, qwen3.7-plus, qwen3.7-flash, qwen-flash), valid 90 days from activation. [official] — [Alibaba Model Studio pricing](https://www.alibabacloud.com/help/en/model-studio/model-pricing)
- Anthropic: "New users receive a small amount of free credits to test the API"; "Academic and research discounts may be available" (no amounts given). [official] — [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- Cerebras: Free Trial is $5 in credits expiring 30 days after grant; listed free-trial limits 5 requests/min and 1M tokens/day for `gpt-oss-120b` and `qwen-3.8-27b`. [official] — [Cerebras rate limits](https://inference-docs.cerebras.ai/support/rate-limits)
- Groq: the rate-limit page shows base limits of 30 requests/min, 1K requests/day, 8K tokens/min, 200K tokens/day for gpt-oss-120b, gpt-oss-20b and qwen3.8-27b, labelled as Developer-plan base limits [official] — [Groq rate limits](https://console.groq.com/docs/rate-limits); the models page gives different Developer-plan figures (250K tokens/min, 1K requests/min) [official] — [Groq models](https://console.groq.com/docs/models). The two pages conflict; the lower set may be the free plan, but the page read does not say so.
- OpenRouter: free model variants (":free") are limited to 20 requests/min and 50 requests/day, or 1,000 requests/day once at least 10 credits have been purchased; upstream providers may rate-limit separately. [official] — [OpenRouter limits](https://openrouter.ai/docs/api-reference/limits)
- GitHub Models: "As of July 30, 2026, GitHub Models has been fully retired"; the page points to Azure AI Foundry and GitHub Copilot instead. [official] — [GitHub Models docs](https://docs.github.com/en/github-models/use-github-models/prototyping-with-ai-models)
- Azure for Students: $100 credit usable within 12 months, renewable yearly while a student, "No credit card required", full-time university students with a school email; Azure OpenAI and Microsoft Foundry are among the listed services. [official] — [Azure for Students](https://azure.microsoft.com/en-us/free/students)
- Mistral: the Free plan includes access to Mistral Studio; "Verified students can get Mistral Pro for $5.99 / month (normally $14.99)"; the Pro plan text lists monthly API credits (figures "$15 /mo" and "$25.5 /mo in API credits" appear on the page; which plan variant each belongs to was not clear from the page text). [official] — [Mistral pricing](https://mistral.ai/pricing)
- Meta: the Contributor tier ($0.10 / $0.20) is a discount in exchange for training on prompts and completions, not a free tier; the page mentions platform free-tier credits only for Muse Voice Transcribe. [official] — [Meta pricing and rate limits](https://dev.meta.ai/docs/pricing-rate-limits)
- DeepSeek: the pricing page lists no free tier or free credits. [official] — [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing)

### Inferences
- For Stage A (synthetic benchmark, no personal data), free and trial quotas plus batch pricing could cover a large share of offline evaluation cost; free tiers that train on content (Gemini free tier, Meta Contributor) are unsuitable once real users' answers are involved, because of DC-03.
- Free tiers have request-per-day caps (OpenRouter 50–1,000/day; Cerebras 5 requests/min) that are fine for an evaluation harness but cannot back a latency NFR at run time; any run-time path needs a paid tier.

### Gaps
- OpenAI Researcher Access Program page returned HTTP 403; Google Cloud research-credits page content was truncated; Mistral's free API tier documentation URL returned 404. None of these could be verified, so no amounts are reported.
- Exact Gemini free-tier request limits per model are only visible inside AI Studio (requires sign-in; not done).
- No Vietnam-specific education programme from any provider was found.

## 4. Published latency figures

### Takeaway
Artificial Analysis (independent, third-party) reports median figures only; on its 8 Oct 2026 leaderboard, non-reasoning or low-effort small models show roughly 0.6–1.1 s to first chunk and about 90–240 tokens/s, while the same models at higher reasoning effort take tens to hundreds of seconds to first chunk. No source publishes 95th-percentile latency, and the measurements are taken from a US data centre, not from Vietnam.

### Cited Findings
- Method (Artificial Analysis): workloads of about 1K, 10K (site default) and 100K input tokens; the 1K and 10K workloads run about eight times a day; test machine is a Google Cloud VM in us-central1-a (the page notes server location affects TTFT because network latency is included); results are the median (P50) over the past 72 hours (14 days for the 100K workload); TTFT is "The time in seconds between sending a request ... and receiving the first token of the response" (for reasoning models, the first reasoning token); "Time to First Answer Token" is measured after thinking; output speed is average tokens per second after the first token, counted with tiktoken o200k_base. [third-party] — [Artificial Analysis methodology](https://artificialanalysis.ai/methodology/performance-benchmarking)
- Figures below are from the Artificial Analysis model leaderboard as displayed on 8 Oct 2026 (the page shows no date; columns "Median Tokens/s" and "Latency First Chunk (s)"). The page was truncated, so absent models may simply not have been in the part read. [third-party] — [Artificial Analysis leaderboard](https://artificialanalysis.ai/leaderboards/models)

| Model (variant as labelled) | Median tokens/s | First chunk (s) |
|---|---|---|
| GPT-6 Luna (non-reasoning) | 119 | 0.76 |
| GPT-6 Luna (low) | 121 | 3.05 |
| GPT-6 Luna (high) | 112 | 21.08 |
| GPT-5.6 Terra (non-reasoning) | 92 | 0.76 |
| GPT-6.1 Sol (low) / (medium) | 49 / 50 | 3.41 / 8.78 |
| GPT-6 Astra (low) / (medium) | 46 / 46 | 2.96 / 5.61 |
| Claude Haiku 5.5 (low) / (medium) / (high) | 178 / 137 / 160 | 9.93 / 13.40 / 28.01 |
| Claude 4.5 Haiku (non-reasoning) | 90 | 0.55 |
| Claude Sonnet 5.5 (low) / (medium) / (high) | 101 / 102 / 104 | 1.05 / 2.05 / 13.04 |
| Claude Opus 5.5 (low) / (medium) | 79 / 76 | 8.65 / 22.52 |
| Gemini 3.5 Flash-Lite | 346 | 8.62 |
| Gemini 3.8 Flash (high) | 125 | 24.33 |
| Gemini 3.1 Pro Preview | 122 | 23.15 |
| Gemma 4 31B (non-reasoning) | 43 | 2.02 |
| Gemma 4 26B A4B (non-reasoning) | 94 | 1.03 |
| Gemma 4 12B (non-reasoning) | 113 | 2.40 |
| Muse Glimmer (high) | 89 | 1.64 |
| Muse Spark 1.3 (xhigh) | 368 | 41.62 |
| Llama 4 Scout / Llama 4 Maverick / Llama 3.3 70B | 56 / 34 / 83 | 0.86 / 1.07 / 1.81 |
| Mistral Large 4 Preview | 116 | 1.46 |
| Mistral Medium 3.5 | 168 | 2.24 |
| Mistral Small 4 (non-reasoning) | 154 | 0.73 |
| Ministral 3 8B / 14B | 101 / 81 | 0.72 / 1.21 |
| Qwen3.8 Max (0902) | 37 | 2.74 |
| Qwen3.7 Plus | 54 | 2.25 |
| Qwen3.8-Flash-Next | 56 | 2.47 |
| Qwen3.5 9B (non-reasoning) | 80 | 0.71 |
| DeepSeek V4.1 Flash (non-reasoning) | 219 | 1.06 |
| DeepSeek V4 Pro 0813 (non-reasoning) | 107 | 1.56 |
| gpt-oss-120b (low) / gpt-oss-20b (low) | 209 / 240 | 0.83 / 0.85 |

- Provider-stated speeds (not independent): Groq lists 1,000 tokens/s for gpt-oss-20b, 500 for gpt-oss-120b, 450 for qwen3.8-27b, 560 for llama-3.1-8b-instant and 280 for llama-3.3-70b-versatile. [official, vendor claim] — [Groq models](https://console.groq.com/docs/models)
- Self-hosted reference point: the SEA-LION v4.5 (Qwen) 27B card reports, with vLLM at concurrency 1 and 8,192 context, 0.326 s to first token and about 49 tokens/s on an H100, and 0.051 s and about 70 tokens/s on an H200. [official model card] — [Hugging Face: Qwen-SEA-LION-v4.5-27B-IT](https://huggingface.co/aisingapore/Qwen-SEA-LION-v4.5-27B-IT)
- Anthropic notes that structured outputs compile a grammar on first use (cached 24 hours), adding first-request latency. [official] — [Claude structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)

### Inferences
- Reasoning effort dominates latency more than model choice: the same small model moves from under 1 s to 20 s or more to first chunk when reasoning is raised. For the 5 s (NFR-01) and 8 s (NFR-02) limits, only non-reasoning or lowest-effort settings are plausible at the median; e.g. at about 100 tokens/s and 1 s to first chunk, a 300-token structured judgement completes in about 4 s at the median (arithmetic on the table, not a measurement).
- The leaderboard's "first chunk" values of 8–10 s for Claude Haiku 5.5 (low) and Gemini 3.5 Flash-Lite look like they include thinking time, yet the methodology page defines TTFT as the first reasoning token. The leaderboard column is not defined on the page read, so these two rows should not be used to rule models in or out without a direct test.
- A three-judge panel called in parallel is bounded by the slowest judge, so the panel's p95 is worse than any single judge's p95; published medians cannot establish NFR compliance.

### Gaps
- No p95 or p99 figures are published by Artificial Analysis (medians only), and no measurement from Vietnam or Southeast Asia was found. The measurement that closes the gap: the team's own probe from the deployment region, with the real prompt sizes, Vietnamese input, structured output on, reporting p50/p95 over several days and peak hours.
- No non-reasoning rows were visible for Claude Haiku 5.5, Claude Sonnet 5.5, Gemini 3.x Flash/Flash-Lite, GPT-5.4 mini/nano or Qwen3.7 Flash (page truncated or not listed).
- No latency data found for any Vietnam-hosted service (FPT, GreenNode).

## 5. Vietnamese capability: benchmarks, leaderboards and peer-reviewed evaluations

### Takeaway
On SEA-HELM's Vietnamese track (leaderboard dated 18 Sep 2026) the leading closed and open models sit in a narrow 75–79 band with confidence intervals of about ±1.5, so the top Anthropic, Google, OpenAI, Qwen, Gemma and GLM models are statistically close, while Mistral Small 4, Llama 4, Llama 3.x small models and gpt-oss-20b are clearly weaker. No benchmark or peer-reviewed study found measures what JobQuest needs (rubric-based ordinal grading of short Vietnamese free-text answers, or Vietnamese role-play narration), and the newest small models (GPT-6 Luna, Claude Haiku 5.5, Gemini 3.5 Flash-Lite, DeepSeek V4.1 Flash, Qwen3.7/3.8 Flash API models) are not on the leaderboard.

### Cited Findings
- SEA-HELM (AI Singapore) leaderboard, dated Sep 18, 2026: 75 open-weights models (served locally) and 16 closed-weights models (via API); scores are averages of 2,000 bootstraps with 95% confidence intervals; seven SEA languages including Vietnamese. [leaderboard] — [SEA-HELM leaderboard](https://leaderboard.sea-lion.ai/)
- Vietnamese (VI) scores read from the detailed view with all sizes and closed-weights models switched on (87 models shown) [leaderboard] — [SEA-HELM Vietnamese detail](https://leaderboard.sea-lion.ai/detailed/VI):

| Model | Developer | VI score | Multi-turn chat | Inst. following | NLG |
|---|---|---|---|---|---|
| Opus 4.8 | Anthropic | 78.70 | 86.96 | 91.93 | 56.06 |
| Gemini 3.1 Pro Preview | Google | 78.66 | 84.42 | 91.87 | 55.86 |
| Gemini 3.8 Flash | Google | 78.40 | 87.86 | 93.92 | 55.86 |
| Qwen 3.5 397B (MoE, open) | Alibaba | 78.15 | 86.96 | 96.24 | 55.26 |
| GPT 6 Astra | OpenAI | 77.86 | 85.28 | 95.98 | 55.13 |
| Gemini 3.5 Flash | Google | 77.80 | 85.78 | 90.24 | 56.15 |
| Gemma 4 31B (open) | Google | 77.09 | 87.12 | 96.21 | 56.21 |
| GPT 5.6 Sol | OpenAI | 77.06 | 83.71 | 95.32 | 55.33 |
| Sonnet 5 | Anthropic | 77.03 | 85.98 | 90.88 | 55.87 |
| GLM 5.2 754B (open) | Z.ai | 76.93 | 86.47 | 95.29 | 53.65 |
| Qwen 3.5 27B / Qwen 3.6 27B (open) | Alibaba | 76.27 / 76.12 | 87.10 / 84.71 | 95.55 / 94.40 | 55.16 / 54.67 |
| GPT 5.6 Terra | OpenAI | 75.92 | 84.90 | 94.25 | 54.91 |
| Gemma 4 26B (open) | Google | 75.33 | 86.50 | 94.38 | 55.48 |
| Gemini 3.1 Flash Lite | Google | 75.24 | 83.42 | 93.12 | 55.94 |
| Qwen 3.8 Flash Next 180B (open) | Alibaba | 74.93 | 87.17 | 95.71 | 55.08 |
| SEA-LION v4.5 (Qwen) 27B (open) | AI Singapore | 73.85 | 79.32 | 94.92 | 51.78 |
| Muse Glimmer 30B (open) | Meta | 73.52 | 87.09 | 95.88 | 53.87 |
| DeepSeek V4 Pro / V4 Flash (open) | DeepSeek | 73.40 / 72.06 | 86.77 / 82.25 | 90.42 / 87.87 | 55.96 / 55.76 |
| GPT 5.4 mini | OpenAI | 72.74 | 81.81 | 94.53 | 54.09 |
| GPT 5.6 Luna | OpenAI | 71.94 | 82.69 | 95.06 | 54.40 |
| Qwen 3.5 9B (open) | Alibaba | 71.93 | 84.00 | 92.18 | 54.24 |
| Gemma 4 12B (open) | Google | 69.90 | 85.24 | 93.42 | 55.44 |
| GPT OSS 120B (open) | OpenAI | 69.81 | 83.50 | 88.25 | 53.40 |
| Qwen 3.5 4B (open) | Alibaba | 68.97 | 78.67 | 90.90 | 53.59 |
| Mistral Medium 3.5 (open) | Mistral | 68.82 | 82.88 | 86.44 | 55.73 |
| Llama 3.3 70B (open) | Meta | 68.35 | 65.74 | 93.70 | 54.19 |
| Haiku 4.5 | Anthropic | 67.67 | 77.13 | 82.31 | 53.79 |
| Gemma 4 E4B 8B (open) | Google | 67.14 | 82.04 | 85.05 | 53.80 |
| Llama 4 Scout 109B (open) | Meta | 63.92 | 68.77 | 90.45 | 54.61 |
| GPT OSS 20B (open) | OpenAI | 63.75 | 76.75 | 79.35 | 51.70 |
| Gemma 4 E2B 5B (open) | Google | 61.19 | 77.49 | 86.79 | 52.37 |
| Llama 4 Maverick 400B (open) | Meta | 60.14 | 70.34 | 91.22 | 54.87 |
| Mistral Small 4 119B (open) | Mistral | 57.23 | 76.82 | 73.59 | 54.11 |
| Llama 3.1 8B (open) | Meta | 44.63 | 50.72 | 72.97 | 52.43 |
| Llama 3.2 3B (open) | Meta | 29.30 | 43.63 | 61.57 | 49.57 |

- Confidence intervals on the VI score are about ±1.2 to ±2.0 points (e.g. Gemma 4 31B 77.09 [−1.73, +1.64]; Qwen 3.5 9B 71.93 [−1.51, +1.49]). [leaderboard] — [SEA-HELM Vietnamese detail](https://leaderboard.sea-lion.ai/detailed/VI)
- What the SEA-HELM categories measure (all languages): Cultural (SEA-NLI, cultural alignment), Instruction Following (SEA-IFEval, accuracy), Knowledge, Multi-Turn Chat (SEA-MTBench, "Win Rate against a reference"), NLG (translation scored with MetricX-24, summarisation with ROUGE-L), NLR (inference, causal reasoning), NLU (sentiment, metaphor, QA), Safety (toxicity detection). [leaderboard] — [SEA-HELM task description](https://leaderboard.sea-lion.ai/tasks/language)
- SEA-HELM paper: Susanto et al., "SEA-HELM: Southeast Asian Holistic Evaluation of Language Models", arXiv 2502.14301 (v2, 2 Jun 2025); five pillars (NLP Classics, LLM-specifics, SEA Linguistics, SEA Culture, Safety); the paper lists Filipino, Indonesian, Tamil, Thai and Vietnamese; no venue is shown on the arXiv listing. [preprint] — [arXiv abs 2502.14301](https://arxiv.org/abs/2502.14301)
- VMLU leaderboard (footer "ZaloAI, Jaist"; zero-shot multiple-choice across STEM, Social Science, Humanities, Others): in the base-model list the top entries are QwQ-32B 76.13 (13/03/2025), Qwen2.5-72B-Instruct-AWQ 69.17, Llama-3-70B 66.44, KiLM-13b 66.07, GPT-4 65.53 (08/01/2024), GPT-4o-mini 62.87; there are no GPT-5/6, Claude or Gemini 2.x/3.x entries. In the fine-tuned list the top entries are VAI-LLM-v1.6+ 90.04 (06/08/2026, creator "VAI"), V-LLM v2.1 89.85 (VinSmart Future, 31/07/2026), axis-sovereign 85.75, Vi-Qwen3.6 85.36 (Zoom AI Lab), MISA-AI-1.0 81.26, VNPTAI.IO-Medium-R1.2 79.61, GreenNode-xMedium-v1 75.50; older Vietnamese models score low (ViGPT-1.6B-v1 42.34, PhoGPT-7B5-Instruct 24.01, Vistral-7B-Chat 50.07). [leaderboard] — [VMLU leaderboard](https://vmlu.ai/leaderboard)
- VMLU paper: Bui et al., "VMLU Benchmarks: A comprehensive benchmark toolkit for Vietnamese LLMs", ACL 2025 (Long Papers), pp. 11495–11515; four datasets covering general knowledge, reading comprehension, reasoning and conversational skills; reviews Llama-3, Qwen2.5 and GPT-4; the authors suggest open-source LLMs can serve as effective, cost-efficient evaluators in the Vietnamese context. [peer-reviewed] — [ACL Anthology 2025.acl-long.563](https://aclanthology.org/2025.acl-long.563/)
- Truong et al., "Crossing Linguistic Horizons: Finetuning and Comprehensive Evaluation of Vietnamese Large Language Models", Findings of NAACL 2024, pp. 2849–2900 (authors include Tho Quan of HCMUT): evaluation framework of 10 tasks and 31 metrics; open-source LLMs show "limited effectiveness in processing Vietnamese" despite multilingual pre-training; fine-tuning transfers knowledge across languages; larger models can introduce more bias and less calibrated outputs; data quality is the main factor. [peer-reviewed] — [ACL Anthology 2024.findings-naacl.182](https://aclanthology.org/2024.findings-naacl.182/)
- Model cards rarely name Vietnamese: Gemma 4 states pre-training on over 140 languages and "35+ languages" out-of-the-box without listing Vietnamese [official] — [Hugging Face: google/gemma-4-12b-it](https://huggingface.co/google/gemma-4-12b-it); Qwen3.5 states "201 languages and dialects" without a list [official] — [Hugging Face: Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B); SEA-LION v4.5 names Vietnamese explicitly as a target language [official] — [Hugging Face: Qwen-SEA-LION-v4.5-27B-IT](https://huggingface.co/aisingapore/Qwen-SEA-LION-v4.5-27B-IT).

### Inferences
- Documented as strong in Vietnamese on SEA-HELM (within CI of each other): Anthropic Opus/Sonnet, Google Gemini Pro/Flash and Gemma 4 26B/31B, OpenAI GPT-6 Astra and GPT-5.x, Alibaba Qwen 3.5/3.6 (even at 27B), Z.ai GLM 5.2. Documented as weaker: Mistral Small 4 (57.2) and Mistral Medium 3.5 (68.8), Meta Llama 4 Scout/Maverick (63.9/60.1) and Llama 3.1 8B (44.6), OpenAI gpt-oss-20b (63.8), Anthropic Haiku 4.5 (67.7). This matters for the panel: a Mistral or Llama 4 judge would add family diversity but with the weakest documented Vietnamese.
- Among self-hostable sizes, Qwen 3.5 9B (71.9), Gemma 4 12B (69.9) and Qwen 3.5 4B (69.0) outscore much larger models from Meta and Mistral; Qwen 3.5/3.6 27B and Gemma 4 26B/31B reach the top band.
- The NLG column is flat (about 50–57 for every model, from Llama 3.1 8B to Opus 4.8), because it is translation plus ROUGE-L summarisation; it does not discriminate generation quality and cannot support claims about Vietnamese narration quality. Multi-turn chat is the closest proxy for AI-4, and there Llama 3.3/4 and Haiku 4.5 are the outliers.
- SEA-HELM's sub-score for the smallest closed models tested (GPT 5.4 mini 72.7, GPT 5.6 Luna 71.9, Gemini 3.1 Flash Lite 75.2) suggests the "small tier" loses roughly 3–7 points against the flagship of the same family; whether this carries to GPT-6 Luna, Haiku 5.5 or Gemini 3.5 Flash-Lite is untested.
- VMLU is multiple-choice knowledge and is stale for frontier API models (last base-model entries early 2025), so it supports statements about Vietnamese fine-tunes, not about the candidate API models. The VMLU authors' remark that open models can be cost-efficient Vietnamese evaluators is the only peer-reviewed statement found that touches judging in Vietnamese; the abstract gives no agreement statistic.

### Gaps
- No peer-reviewed or preprint study was found on LLM grading of Vietnamese short free-text answers against human raters, on Vietnamese rubric-based ordinal scoring, or on Vietnamese role-play/dialogue generation; a targeted search returned only English-language (and Turkish, Ghanaian, Chinese) grading studies. This is a plain literature gap for RP-2; the measurement that closes it is the project's own expert-agreement study (QWK of each judge and of the panel median against domain experts, per language).
- Not on the SEA-HELM leaderboard as of 18 Sep 2026: GPT-6 Luna, GPT-6.1 Sol, Claude Haiku 5.5, Sonnet 5.5, Opus 5.5, Fable 5.1, Gemini 3.5 Flash-Lite, Muse Spark, DeepSeek V4.1 Flash, Mistral Large 4, and the closed Qwen API models (qwen3.8-max, qwen3.7-plus, qwen3.x-flash).
- How SEA-MTBench's "win rate against a reference" is judged (which judge model) is not stated on the task page read; the full SEA-HELM paper and the evaluation-details page were not opened.
- ViLLM-Eval was seen only in a secondary summary [snippet] and V-Bench (VinUniversity, announced 6 Jul 2026 per a search snippet) could not be opened (HTTP 403), so neither is reported as a finding.
- The Vietnamese evaluation by Truong et al. (2024) predates all current models; no update was found.

## 6. Vietnamese-developed or Vietnam-hosted models and inference services

### Takeaway
Two Vietnam-based platforms publish usable inference offers: FPT AI Factory (USD per-token prices for open and proxied closed models; GPU regions labelled "Southeast Asia" and "Japan") and GreenNode/VNG (per-token MaaS billed in VND, price list behind the console). Vietnamese-developed LLMs (Viettel, VinSmart Future, VNPT, MISA, Zalo, VinBigData) appear on the VMLU leaderboard, but no public API price or data-processing statement was found for any of them, and several are fine-tunes of foreign open models, which places them inside those models' families.

### Cited Findings
- FPT AI Factory pricing page (USD), serverless LLM examples per 1M tokens input/output: GPT-4.1 $2.00/$8.00; GLM-5.2 $1.40/$4.40; Gemini-3.5-Flash $1.50/$9.00; DeepSeek-V4-Flash $0.14/$0.28; gpt-oss-120b $0.143/$0.605; Llama-3.3-70B-Instruct $0.209/$0.451; Minimax-M3 $0.30/$1.20. GPU per hour: H100 SXM5 $2.99 (Southeast Asia), A30 $1.06 (Southeast Asia), RTX PRO 6000 Blackwell $2.19 (Southeast Asia), B300 SXM $6.99 (Southeast Asia), H200 SXM5 $6.60 (Japan). The page labels regions "Southeast Asia" and "Japan" and does not name a Vietnam data centre or mention free credits. [official] — [FPT AI Factory pricing](https://factory.fpt.ai/pricing/) (accessed 8 Oct 2026)
- FPT states that its Vietnam AI factory keeps all data stored and processed within Vietnam. [snippet, FPT news page not opened] — [fpt.com news](https://fpt.com/en/news/inside-fpts-first-ai-factory-in-vietnam-thousands-of-nvidia-superchips-in-action)
- GreenNode (VNG) Model-as-a-Service: text models are billed per 1,000,000 tokens with separate input, cache and output prices; prepaid credits are valid one year from the last top-up, and postpaid accounts are billed monthly; per-model prices are shown in the AI Platform Portal (console). [official] — [GreenNode MaaS pricing docs](https://docs.greennode.ai/ai-stack/model-as-a-service/pricing.md)
- GreenNode public pricing page: MaaS "from 474 VND" (unit not given), GPU instances from 16,080,632 VND per 30 days, "20+ ready-to-use AI models"; offices listed in Ho Chi Minh City and Bangkok; data-centre locations not stated. [official] — [GreenNode pricing](https://greennode.ai/pricing)
- A GreenNode price list (effective 3 Aug 2026) reportedly includes proxied Claude models, e.g. Sonnet 4.6 at 85,065 VND input / 425,325 VND output per 1M tokens, and Kimi and GLM models. [snippet; the linked docs page returned "Page Not Found" when opened] — [GreenNode model pricing list](https://docs.greennode.ai/ai-stack/model-as-a-service/model-pricing-list)
- Viettel AI: VT-Super-120B-A12B (announced 29 May 2026) is a 120-billion-parameter Vietnamese LLM "built on the open NVIDIA Nemotron 3 Super architecture", with continued pre-training, supervised fine-tuning and reinforcement learning by Viettel AI on local data; positioned for Viettel's own agent platform and a Legal AI Assistant. The page gives no benchmark numbers, API, price or data-location statement. [official press page] — [Viettel AI news, 29 May 2026](https://viettelai.vn/en/tin-tuc/viettel-trains-120-billion-parameter-vietnamese-sovereign-ai-model)
- VMLU fine-tuned leaderboard entries from Vietnamese organisations: VAI-LLM-v1.6+ 90.04 (creator "VAI", 06/08/2026); V-LLM v2.1 89.85 (VinSmart Future, 31/07/2026); MISA-AI-1.0 81.26 (23/02/2026); VNPTAI.IO-Medium-R1.2 79.61 (17/06/2025); Cake-Mochi 77.64 (BeFinancial); GreenNode-xMedium-v1 75.50 (24/02/2025); Llama3-ZAI 65.34 and KiLM-13b 66.07 (Kiki AI/Zalo, 2024); Llama3-ViettelSolutions-8B 56.20; ViGPT-1.6B-v1 42.34 and vbd-llama2-7b-50b-chat 36.98 (VinBigData, Jan 2024); PhoGPT-7B5-Instruct 24.01 (VinAI, Jan 2024); ura-llama-7b 32.18 (Ho Chi Minh City University of Technology). [leaderboard] — [VMLU leaderboard](https://vmlu.ai/leaderboard)
- For comparison, the same NVIDIA Nemotron 3 Super 120B base that Viettel builds on scores 55.31 on SEA-HELM Vietnamese, and AI Singapore's SEA-LION v4.8 (Nemotron) 120B scores 70.36. [leaderboard] — [SEA-HELM Vietnamese detail](https://leaderboard.sea-lion.ai/detailed/VI)

### Inferences
- A Vietnam-based host does not by itself remove the cross-border transfer: FPT's and GreenNode's catalogues include closed models (GPT-4.1, Gemini, Claude) that can only be served by forwarding requests to the foreign provider, and neither page states where each model runs. Only the open-weight entries (gpt-oss-120b, Llama 3.3 70B, DeepSeek-V4-Flash, GLM, MiniMax) could physically run on the host's own GPUs, and even that is not confirmed on the pages read.
- FPT's per-token prices for open models are close to US hosts (gpt-oss-120b $0.143/$0.605 versus $0.15/$0.60 on Groq and Together), so a regional host need not cost more for those models.
- Vietnamese-developed models are mostly fine-tunes (names such as MISA-Llama3, Llama3-ZAI, Vi-Qwen3.6, VT-Super on Nemotron), so under the section 1 rule they inherit the base model's family; they do not add a new independent family to the judge panel. Their VMLU scores (multiple-choice knowledge) say nothing about grading ability.

### Gaps
- No public API, price or data-processing location was found for Viettel AI's LLM, VinSmart Future V-LLM, VNPT AI, MISA AI, Zalo KiLM or VinBigData ViGPT (the only VinBigData coverage found was the December 2023 consumer launch, seen in snippets). Whether "VAI" on VMLU is Viettel AI is suggested by a search snippet of a 27 Jul 2026 Viettel AI news item about "VAI-LLM" but was not verified on an opened page.
- FPT AI Factory: the country of the "Southeast Asia" region, free-trial credits, whether closed models are proxied abroad, and structured-output support were not stated on the pricing page; the FPT marketplace page rendered only a heading.
- GreenNode: per-model VND prices and data-centre locations require the console; not verified.
- None of the Vietnam-hosted services has independent latency measurements.

## 7. Open-weight models small enough to self-host for judging or checking

### Takeaway
Permissively licensed models from four different developers fit on a single 16–48 GB GPU (Gemma 4 E4B/12B/26B, Qwen3.5 4B/9B, gpt-oss-20b, Ministral 3, and at 48–80 GB Qwen3.6/SEA-LION 27B, Gemma 4 31B, Muse Glimmer 30B, gpt-oss-120b), with Vietnamese scores from about 64 to 77 on SEA-HELM. An always-on single GPU costs roughly $250–$800 per month at the listed hourly rates, which is far more than paying per token for the same open models at low volume.

### Cited Findings

| Model | Developer / family | Licence | Size and memory (official) | SEA-HELM VI (18 Sep 2026) | Sources |
|---|---|---|---|---|---|
| Gemma 4 E4B | Google | Apache 2.0 | 17.9 GB BF16 / 8.9 GB 8-bit / 4.5 GB 4-bit; 128K context | 67.14 | [Gemma docs](https://ai.google.dev/gemma/docs/core) |
| Gemma 4 12B | Google | Apache 2.0 | 26.7 / 13.4 / 6.7 GB; 256K context | 69.90 | [Gemma docs](https://ai.google.dev/gemma/docs/core); [HF card](https://huggingface.co/google/gemma-4-12b-it) |
| Gemma 4 26B A4B (MoE) | Google | Apache 2.0 | 57.7 / 28.8 / 14.4 GB (all 26B must be loaded) | 75.33 | [Gemma docs](https://ai.google.dev/gemma/docs/core) |
| Gemma 4 31B | Google | Apache 2.0 | 69.9 / 34.9 / 17.5 GB | 77.09 | [Gemma docs](https://ai.google.dev/gemma/docs/core) |
| Qwen3.5-9B (sibling 4B) | Alibaba | Apache-2.0 | 9B parameters; 262,144 native context; no VRAM figure on card | 71.93 (4B: 68.97) | [HF card](https://huggingface.co/Qwen/Qwen3.5-9B) |
| SEA-LION v4.5 (Qwen) 27B | AI Singapore, Qwen family | MIT | about 34.4 GB on disk, about 51.1 GiB VRAM; 262K context | 73.85 | [HF card](https://huggingface.co/aisingapore/Qwen-SEA-LION-v4.5-27B-IT) |
| gpt-oss-20b | OpenAI | Apache 2.0 | 21B total / 3.6B active; "within 16GB of memory"; structured outputs supported | 63.75 | [HF card](https://huggingface.co/openai/gpt-oss-20b) |
| gpt-oss-120b | OpenAI | Apache 2.0 | 117B total / 5.1B active; fits a single 80 GB GPU | 69.81 | [HF card](https://huggingface.co/openai/gpt-oss-20b) |
| Muse Glimmer | Meta | Apache 2.0 | 30B parameters; 128K default context; no memory figure | 73.52 | [Meta docs](https://dev.meta.ai/docs/muse-glimmer) |
| Mistral Small 4 | Mistral | Apache 2.0 | 119B total / 6.5B active (not small to host) | 57.23 | [Mistral card](https://docs.mistral.ai/models/mistral-small-4-0-26-03) |
| Ministral 3 3B / 8B / 14B | Mistral | Apache 2.0 | sizes by name; 256K context (8B) | not on leaderboard | [Mistral models overview](https://docs.mistral.ai/getting-started/models/models_overview/) |

(SEA-HELM column from [SEA-HELM Vietnamese detail](https://leaderboard.sea-lion.ai/detailed/VI), leaderboard.)

- Gemma memory figures "include about 20% overhead" and cover weights only, not the context cache. [official] — [Gemma docs](https://ai.google.dev/gemma/docs/core)
- Runpod on-demand GPU pods, per hour (Community Cloud / Secure Cloud): RTX A5000 24 GB $0.16 / $0.27; RTX 3090 24 GB $0.22 / $0.50; RTX 4090 24 GB $0.34 / $0.74; L4 24 GB $0.44 / $0.49; RTX A6000 48 GB $0.33 / $0.53; A40 48 GB $0.35 / $0.49; L40S 48 GB $0.79 / $1.09; A100 80 GB $1.19–1.39 / $1.59; H100 80 GB $1.99–2.69 / $2.89–3.49. Serverless (billed while active): 24 GB class $0.69/h, 48 GB A6000/A40 $1.22/h, A100 $2.72/h, H100 $4.79/h. [official price list] — [Runpod pricing](https://www.runpod.io/pricing) (accessed 8 Oct 2026)
- FPT AI Factory GPU VMs per hour: A30 $1.06, RTX PRO 6000 Blackwell $2.19, H100 SXM5 $2.99 (all "Southeast Asia"); H200 $6.60 (Japan). [official price list] — [FPT AI Factory pricing](https://factory.fpt.ai/pricing/) (accessed 8 Oct 2026)
- Together dedicated inference: H100 $5.49 per GPU-hour on demand; B200 $8.99. [official price list] — [Together pricing](https://www.together.ai/pricing) (accessed 8 Oct 2026)
- Pay-per-token alternatives for the same open weights: Gemma 4 31B $0.39/$0.97 and Qwen3.5 9B $0.17/$0.25 (Together); gpt-oss-20b $0.075/$0.30 and gpt-oss-120b $0.15/$0.60 (Groq); Gemma 4 free of charge on the Gemini API free tier. [official] — [Together pricing](https://www.together.ai/pricing); [Groq models](https://console.groq.com/docs/models); [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)

### Inferences
- Rough always-on cost (hourly rate × 730 h, my arithmetic): a 24 GB GPU at $0.34–0.49/h is about $250–$360 per month; a 48 GB A40 at $0.35–0.49/h about $255–$360; an L40S about $575–$800; FPT's A30 about $775; an H100 about $1,450–$2,550. At $0.17/$0.25 per million tokens, $250 buys on the order of a billion tokens of Qwen3.5 9B from a host, so self-hosting only pays for itself at high sustained volume or when data location, not cost, is the reason.
- Fit by GPU class (from the official memory tables): 16 GB — gpt-oss-20b, Gemma 4 E4B (8-bit), Gemma 4 12B (8-bit, tight); 24 GB — Gemma 4 12B (8-bit) or Gemma 4 26B/31B at 4-bit, Qwen3.5 9B; 48 GB — Gemma 4 26B/31B at 8-bit; 80 GB — gpt-oss-120b, SEA-LION v4.5 27B at full precision (about 51 GiB). Quantisation effects on Vietnamese grading accuracy are not documented in any source opened.
- For an offline "checker" (model-based checks run off-line per decision D-89) latency is not binding, so serverless GPU billing or batch APIs are the natural fit; for a run-time judge, the SEA-LION card's single-request figures (about 49 tokens/s on an H100) indicate a self-hosted 27B model would be slower than the hosted small models in section 4.
- The self-hostable set spans four developers' families (Google Gemma, Alibaba Qwen, OpenAI gpt-oss, Meta Muse Glimmer) with Apache/MIT licences, so a fully open-weight judge panel is licence-feasible; its Vietnamese scores (64–77) are below or at the level of the closed flagships (77–79).

### Gaps
- Google Cloud's GPU price page could not be read (content truncated), and AWS/Azure GPU lists were not opened, so hyperscaler GPU prices are not reported.
- No official throughput or VRAM figures for Qwen3.5 9B, Muse Glimmer or Ministral 3; no SEA-HELM result for Ministral 3.
- Licences for Qwen3.6 27B, Qwen3.8 27B and the Llama 3.3/4 weights were not opened.
- No published evidence on how small open models perform as rubric graders in Vietnamese (see section 5 gap); the Stage A benchmark is the place to measure it.
