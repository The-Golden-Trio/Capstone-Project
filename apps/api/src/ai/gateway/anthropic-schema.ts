/**
 * Viết lại JSON Schema cho chế độ structured output của Claude.
 *
 * Trang Structured outputs của Anthropic (JSON Schema limitations) liệt kê
 * `anyOf`, `enum` (kể cả `null`) và `type: "null"` là được hỗ trợ; dạng mảng
 * kiểu `type: ["string", "null"]` không được nêu. GPT và Gemini nhận dạng mảng,
 * nên chỉ họ Anthropic bị đổi sang `anyOf`. Hai khuôn nói cùng một điều; luật
 * kiểm đầu ra phía server không đổi.
 */
type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/** Từ khoá có giá trị là một map tên → schema. */
const SCHEMA_MAPS = ['properties', '$defs', 'definitions'] as const;
/** Từ khoá có giá trị là một schema, hoặc mảng schema. */
const SCHEMA_CHILDREN = ['items', 'anyOf', 'allOf'] as const;
/** Ở lại ngoài `anyOf` khi tách một nút thành nhiều nhánh. */
const ANNOTATIONS = ['description', 'title', 'default'] as const;

const matchesType = (value: unknown, type: unknown): boolean => {
  switch (type) {
    case 'null':
      return value === null;
    case 'string':
      return typeof value === 'string';
    case 'boolean':
      return typeof value === 'boolean';
    case 'number':
    case 'integer':
      return typeof value === 'number';
    default:
      return false;
  }
};

function splitUnion(node: Json, types: unknown[]): Json {
  const { type: _type, enum: values, ...rest } = node;
  const outer: Json = {};
  for (const key of ANNOTATIONS)
    if (key in rest) {
      outer[key] = rest[key];
      delete rest[key];
    }

  const branches: Json[] = [];
  for (const type of types) {
    const allowed = Array.isArray(values)
      ? values.filter((v) => matchesType(v, type))
      : null;
    // Một kiểu mà enum không còn giá trị nào thì không thể xảy ra: bỏ nhánh.
    if (allowed && allowed.length === 0) continue;
    branches.push(
      type === 'null'
        ? { type }
        : { type, ...rest, ...(allowed ? { enum: allowed } : {}) },
    );
  }
  return branches.length === 1
    ? { ...outer, ...branches[0] }
    : { ...outer, anyOf: branches };
}

export function toAnthropicSchema(schema: unknown): unknown {
  if (!isObject(schema)) return schema;

  const node: Json = { ...schema };
  for (const key of SCHEMA_MAPS) {
    const map = node[key];
    if (isObject(map))
      node[key] = Object.fromEntries(
        Object.entries(map).map(([name, child]) => [
          name,
          toAnthropicSchema(child),
        ]),
      );
  }
  for (const key of SCHEMA_CHILDREN) {
    const child = node[key];
    if (Array.isArray(child)) node[key] = child.map(toAnthropicSchema);
    else if (isObject(child)) node[key] = toAnthropicSchema(child);
  }

  const { type } = node;
  if (Array.isArray(type) && type.length > 0) {
    if (type.length === 1) return { ...node, type: type[0] };
    return splitUnion(node, type);
  }
  return node;
}
