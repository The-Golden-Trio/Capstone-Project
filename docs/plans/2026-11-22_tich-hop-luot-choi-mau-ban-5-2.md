# Tích hợp lượt chơi mẫu "Chín trăm đơn của Minh Phát" (seed L3.m2 bản 5.2)

Ngày 22/11/2026. Nhánh `feat/shift-minh-phat-play`. **Đề xuất triển khai**, chờ nhóm duyệt; nội dung seed vẫn chưa qua DE (BR-05).

Nguồn: [`research/reports/Lượt chơi mẫu Back-end L3 m2 bản 5.2.md`](../../research/reports/Lượt%20chơi%20mẫu%20Back-end%20L3%20m2%20bản%205.2.md) (gọi tắt **WT**). Seed hiện tại `occupation-data/seeds/SWE_BACKEND/L3.m2.json` là bản 4; việc này nâng lên bản 5.2 để chơi đúng WT, cả ở chế độ demo (engine chạy trong trình duyệt, AI giả có kịch bản) lẫn live.

Yêu cầu UI của người dùng: tài liệu, code, wiki **mở thành cửa sổ thật** (IDE, wiki, log viewer, terminal, mail…), không nằm trong sổ tay bên cạnh.

## Phân việc

| Worker         | Phạm vi file (chỉ sửa trong phạm vi này)                                                                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A · engine** | `packages/game-core/src/shift/**` trừ `testing/fakeRules.ts` (chỉ được thêm stub, xem §A9)                                                                                                                       |
| **B · seed**   | `occupation-data/seeds/SWE_BACKEND/*`, `packages/game-core/src/shift/testing/fakeRules.ts`, file sinh (`packages/game-core/data/shift-seeds.json`, `apps/web/src/api/demo/fixtures/shift-seeds.json`) qua script |
| **C · web**    | `apps/web/src/**`, `packages/ui/src/**` (nếu cần component dùng chung)                                                                                                                                           |

Không commit, không push. Không sửa file ngoài phạm vi; cần đổi gì ngoài phạm vi thì báo lại.

## A · Schema và engine (`packages/game-core/src/shift/`)

Mọi field mới đều **optional / có default**, để seed cũ và API vẫn parse được.

**A1. Slide giới thiệu.** `ShiftSeedSchema.intro_slides?: Array<{ title: string; body: string }>`. View: `introSlides`.

**A2. Bot.** `ShiftSeedSchema.bots: Array<{ id: string; name: string }>` (default `[]`), ví dụ `bot_deploy` → "Bot deploy", `bot_giam_sat` → "Giám sát". `Beat.speaker` hay `timeline.speaker` là id bot thì engine ghi dòng `kind: 'system'`, `speaker: <id bot>`; không dò dữ kiện từ lời bot. View: `bots`.

**A3. Timeline.** `TimelineItemSchema` thêm:

- `kind` thêm giá trị `'notice'`: tới giờ thì hiện ở lần `due` kế tiếp nhưng **không cắt** hành động đang chạy (không tính trong `hasInterrupt`).
- `speaker?: string` (id bot hoặc slot cast; không có thì là lời cảnh như cũ).
- `unlocks: string[]` (default `[]`): dữ kiện vào sổ tay lúc mục hiện ra (kể cả `silent`).
- `presence?: { slot: string; text: string | null }`: đổi trạng thái hiện của một người (ví dụ "Đang họp · 11:20 trả lời"); `null` là xoá. State: `presence: Record<string, string>`. View: `cast[].status?: string`.

**A4. Tài liệu hiển thị.** `ArtefactSchema.view?:` union theo `type`:

```ts
| { type: 'table'; columns: string[]; rows: string[][]; raw?: string[]; caption?: string }   // log, bảng số liệu
| { type: 'dashboard'; metrics: Array<{ label: string; value: string; note?: string; tone?: 'ok'|'warn'|'bad' }>; caption?: string }
| { type: 'code'; path: string; language: 'js'|'ts'|'sql'|'text'; code: string[]; hovers: Array<{ token: string; text: string }> }
| { type: 'wiki'; space: string; sections: Array<{ id: string; title: string; body: string[] }> }  // body: dòng markdown (đoạn, "- ", "1. ", bảng "| a | b |", **đậm**, `code`)
| { type: 'terminal'; command?: string }              // artefact result: lines từ nhánh
| { type: 'patch'; path: string; base: string[] }      // form bản vá: code gốc + danh sách thay đổi (ticks)
| { type: 'mail'; to: string; subject_field?: string } // form email
| { type: 'note' }                                     // form ghi chú sự cố
| { type: 'channel'; channel: string }                 // form tin kênh #su-co
| { type: 'file'; filename: string }                   // result xuất file
```

`body` giữ nguyên làm bản chữ cho AI và người đọc seed. View truyền `view` ra ở `documents[]`, `ArtefactForm` và `actions[].form`.

**A5. Ô nhập.** `ArtefactFieldSchema` thêm `placeholder?: string`, `multiline: boolean` (default `true`).
`ArtefactSchema.selects: Array<{ id; label; options: Array<{ id; label }>; reason: boolean }>` (default `[]`), dùng cho bảng giả thuyết h1–h6 (Loại / Giữ / Chưa rõ + Vì sao).

- Gửi lên vẫn qua `ticks` và `fields`: lựa chọn là tick dạng `"h1=loai"`, lý do là field `"h1__why"`.
- `requireFields` nhận thêm field `${select.id}__why`; tick hợp lệ nếu là id trong `ticks` **hoặc** `${select.id}=${option.id}` (mỗi select tối đa một).
- `tick_flags` tra được khoá dạng `"h4=giu"`. Cờ từ tick cũng phải tính lại khi lưu bản mới.
- Áp dụng cho cả `nodeArtefact` lẫn hành động `write`/`rewrite` (hiện `write` chưa xét `tick_flags` khi lưu: sửa để xét). Bản vá 5.2 là **ticks** (v1 gom truy vấn, v2 phân trang, v3 giữ app cũ, idx chỉ mục) + field ghi chú.

**A6. Cờ suy ra.** `ShiftSeedSchema.derived_flags: Array<{ flag: string; any_of: FlagExpr[] }>` (default `[]`). Sau mỗi lần cờ đổi (thêm hoặc bớt), tính lại: bật nếu một expr khớp, tắt nếu không. Dùng cho "có v2 thì phải có v3".

**A7. Hành động.** `ActionSchema` thêm `beats: Beat[]` (default `[]`, hiện sau khi xong, ví dụ chị Linh nhắn "Chị nhận rồi nè em") và `unlocks: string[]` (default `[]`). Mở tài liệu: mở **mọi** dữ kiện trong `artefact.unlocks` chưa có (hiện chỉ mở một); kiểm test cũ.

**A8. Lời hứa làm bằng hành động.** `NodeOptionSchema.promise` thêm `by_action?: string` và `label?: string`. Lời hứa có `by_action`:

- giữ lời khi hành động đó xong trước `dueAt + PROMISE_WINDOW.after`; liên lạc với người đó **không** tính là giữ;
- không thay và không bị thay bởi lời hứa liên lạc khác với cùng người (A12 chỉ áp cho lời hứa liên lạc);
- quá hạn chưa làm thì như trễ hẹn hiện nay.
  `label` có thì dùng làm nhãn sổ tay ("Gửi chị Linh danh sách đơn trước 11:10").

**A9. Phương án đổi chữ theo cờ.** `NodeOptionSchema.text_if: Array<{ if: FlagExpr; text: string }>` (default `[]`): khớp đầu tiên thay `text`, cả ở view lẫn lời người chơi khi chọn.

**A10. Nút chen ngang.** `NodeSchema.interjection: boolean` (default `false`). Nút này không nằm trong chuỗi canon: tới giờ thì bật nếu chưa xong (không cần nút trước xong), và không chặn nút sau (`previousDone` bỏ qua nó). Dùng cho e1 (11:10, chị Linh nhắn).

**A11. Lượt báo tin cuối ca.** `ShiftSeedSchema.last_word?: { to: string; event: string; channel: Channel; prompt: string; reply: Beat[] }`. Khi nút kết `finish` và còn lời hứa `open` với `to` theo sự kiện `event` mà sự kiện đã xảy ra: chờ `{ kind: 'last_word'; to; prompt }` (AwaitState mới). `SAY` → dòng người chơi (context `last_word`), lời hứa `kept`, hiện `reply`. `END_CONVERSATION` → bỏ qua. Rồi mới tới A12, rồi review như cũ. 0 điểm.

**A12. Kết ca.** `ShiftSeedSchema.epilogue: Array<{ if: FlagExpr; beats: Beat[] }>` (default `[]`): sau lượt báo tin cuối ca, hiện **mọi** mục khớp theo thứ tự (context `epilogue`), trước review.

**A13. AI giả có kịch bản** (`testing/fakes.ts`). Thêm kiểu

```ts
export interface FakeScript {
  replies: Record<string /*slot*/, Array<{ when: string[]; beats: Beat[] }>>; // khớp cụm từ (normalizeVi) trong playerText, mục đầu khớp
  probes: Array<{ hook: string; beats: Beat[] }>; // hook trùng nguyên văn
  reactions: Record<string /*node id*/, Beat[]>;
  defer: Beat[];
}
```

`fakeNarration(req, script?)`: reply → thử `script.replies[slot]`, không khớp thì như cũ nhưng nhận câu hỏi tiếng Việt không có "?" (gì, sao, nào, không, hông, k ạ, chưa, mấy, bao giờ, ở đâu). probe → `script.probes`; reaction → `script.reactions[nodeId]` (cần thêm `node?: string` vào `NarrateRequest`); guidance (hoãn duyệt) → `script.defer`. Trong `fakeRules.ts` chỉ thêm `export const FAKE_SCRIPTS: Record<string, FakeScript> = {};` và export ở `index.ts`; nội dung do B điền.

**A14. View.** Cập nhật `SceneView`: `introSlides`, `bots`, `cast[].status`, `documents[].view`, `ArtefactForm.view/selects/fields[].placeholder/multiline`, `actions[].form` cũng cho `run`? (không: run không có form), phương án đã thay chữ, `await` có `last_word`. `documents` gồm mọi tài liệu đã mở/đã lưu như hiện nay.

**A15. Kiểm.** `pnpm exec nx run game-core:test`, `typecheck`, `lint`; thêm test cho A3, A5, A6, A8, A10, A11, A12. Test dựa vào nội dung seed cũ sẽ vỡ khi B đổi seed: để lại, Claude giao sửa sau.

## B · Seed bản 5.2

Viết lại `L3.m2.json` (version 5, `_source` trỏ WT, giữ `_draft` BR-05) và `L3.pack.json` để chơi **đúng từng bước WT**. Dùng các field mới ở §A (đọc `schema.ts` sau khi A xong; trong lúc chờ, soạn theo đặc tả này). Bám WT về lời thoại, giờ, điểm, con số.

- **Slide**: 6 slide WT → `intro_slides`. `title` 9:40–12:00, budget 28, 1 điểm = 5 phút, `warn_remaining` 6 với câu cảnh 11:30 WT. Tiêu đề màn: "Chín trăm đơn của Minh Phát".
- **Glossary**: API, request, DB, release, production, #su-co, CS, staging, log, index, phân trang, gom truy vấn, rollback (giải nghĩa như WT, "DB" = "Kho chứa mọi dữ liệu: khách, đơn, món trong đơn.").
- **Dữ kiện** f1–f18 đúng chỗ mở trong bảng "Sự thật đã mở" của WT (f12 "Minh Phát dùng app 2.x trên máy tính bảng" là `on_ask` từ support).
- **Tài liệu** (mỗi cái có `view`): `wiki` (S1–S6 nguyên văn WT, mở 1 điểm, mở f10 f14 f18, bật `da_mo_wiki`); `log_api` (table 10 dòng WT + `raw` dạng `GET /orders/history?customer=… 200 4.38s db_queries=901 rows=900`); `bang_theo_doi_csdl` (dashboard 3 chỉ số WT); `bang_so_lieu` (table khách, vẫn có hành động "Mở bảng số liệu khách"); `code_api` (code WT, path `src/orders/order-history.js`, hover `db.query` → "một lần hỏi CSDL"); `ban_va` (patch: base = code; ticks v1 v2 v3 idx đúng nhãn WT; field `ghi_chu` placeholder; tick_flags `bv.v1` `bv.v2` `bv.v3` `bv.idx`); `log_staging` (terminal, nhánh đúng WT: v1+v2 không v3 → 2 dòng + dòng ⚠; v1+v2+v3 → 1.12s rows=900; v1 không v2 → 1.12s rows=900 cho cả hai; không v1 → 4.4s; emits `su_kien.staging_ok` khi có v1); `xuat_file` (result `file`: dòng `MP-0042_lich_su_don.xlsx · 900 đơn · đã gửi chị Linh`); `deploy_prod` (result terminal: đưa lên khi chưa duyệt, bật `tu_dua_len`); `ghi_chu_su_co` (note: 3 field có placeholder WT, selects h1–h6 Loại/Giữ/Chưa rõ + lý do); `tin_su_co` (channel `#su-co`); `email_an` (mail to "anh An", field `tieu_de` multiline=false + 3 field placeholder WT).
- **Hành động** đúng bảng WT (điểm trong ngoặc) + "Xuất danh sách đơn cho chị Linh" (2, requires `da_mo_wiki`, một lần, `beats` chị Linh nhắn nhận file), "Đưa lên production" (1, requires `staging_da_chay`), "Tạm làm việc khác", "Chốt nguyên nhân" (n2), "Gửi anh An" (n3).
- **Timeline**: 10:05 bot_deploy build #482 (notice, f16); 10:40 build xong (notice); 10:30 silent f2 → 12 cuộc; 10:40 silent f9 sẵn cho n1; 11:00 presence mentor "Đang họp · 11:20 trả lời"; 11:15 bot_giam_sat (notice, f17); 11:20 presence mentor xoá.
- **Nút**: n0 (WT 9:40, 3 nhịp), n1 (10:50, call, `timed_choice` 40 giây, 3 phương án WT, `text_if` cho a khi đã có hẹn, c có `promise` `by_action: xuat_file_action` hạn 11:10, adapt theo G/T/P như ghi chú WT, `free_turn_after_reaction`), e1 (`interjection`, 11:10, chat, `free_reply`, adapt theo đã nói lỗi / đã nói có bản sửa / đã gửi file), n2 (player "Chốt nguyên nhân" hoặc fallback 11:20, artefact `ghi_chu_su_co`, probe "Mấy cái em để chưa rõ, em tính kiểm bằng gì?"), n3 (player "Gửi anh An" hoặc 12:00, artefact `email_an`, probe ba nhánh theo thứ tự WT, closing duyệt khi: v1, (không v2 hoặc có v3) qua `derived_flags`, có cách kiểm, có rollback; approve beats WT).
- **last_word** (chị Linh, sự kiện `su_kien.duyet`, prompt "Nhắn chị Linh trước khi kết ca?", reply WT) và **epilogue** (bot deploy 12:06, bot giám sát 12:20, chị Linh "Minh Phát nói mở được rồi nè em, hú hồn!" khi được duyệt; nhánh không duyệt soạn ngắn, `_draft`).
- **Review**: 5 mục WT (tự đưa lên, hứa chắc, để chị Linh tin sai, trễ hẹn, lời hứa treo).
- **observes**: giữ 6 mục ở "Chấm dự kiến" WT (4.2, 7.1, 1.5, 7.4, 1.1, R), signs theo bằng chứng WT.
- **AI giả** (`fakeRules.ts`): cập nhật `FAKE_RULES`/`FAKE_EVENTS` cho cờ mới; điền `FAKE_SCRIPTS['SWE_BACKEND.L3.m2']` bằng đúng lời NPC trong WT, sao cho **gõ lại các câu của Lan trong WT ra đúng diễn biến WT**.
- Sinh lại: `pnpm data:build` rồi `node apps/web/scripts/build-demo-fixtures.mjs`. Chỉ giữ thay đổi liên quan seed trong diff file sinh.
- Kiểm: `lintSeed` sạch; một script chạy trọn WT bằng `shift.step` + fakes (đặt ở `packages/game-core/src/shift/walkthrough.spec.ts`, phối hợp với A) cho ra: không cờ review nào, ba lời hứa `kept`, n3 duyệt, dùng 26/28 điểm.

## C · Giao diện cửa sổ (`apps/web`)

Đọc kiểu ở `packages/game-core/src/shift/view.ts` (A đang thêm field §A14). Giữ theme toon cho khung game; **bên trong cửa sổ** dùng giao diện giống công cụ thật.

1. **Trình quản lý cửa sổ** (`features/play/desktop/`): cửa sổ nổi trên sân khấu, thanh tiêu đề kiểu macOS (đóng / phóng to), kéo được trên desktop, toàn màn hình trên mobile; nhiều cửa sổ, bấm để lên trên; `Esc` đóng; focus trap, `aria-modal`. Một **dock/taskbar** dưới HUD liệt kê tài liệu đã mở; bấm để mở lại (miễn phí, không gửi lượt).
2. **Trình xem theo `view.type`**:
   - `code` → IDE kiểu VS Code (nền tối, cây thư mục bên trái, tab file, số dòng, tô màu cú pháp JS/SQL tự viết không thêm dependency, tooltip khi rê/chạm token trong `hovers`, thanh trạng thái).
   - `wiki` → trang wiki (mục lục bên trái S1–S6, nội dung markdown đơn giản có bảng).
   - `table` → log viewer (bảng, nút "Xem dạng gốc" chuyển sang chữ thô monospace).
   - `dashboard` → thẻ chỉ số kiểu Grafana.
   - `terminal` → cửa sổ terminal đen, dòng `⚠` tô vàng.
   - `file` → hộp "đã xuất file" có icon xlsx.
   - `patch` → IDE: code gốc bên trái, panel "Thay đổi" (checkbox ticks) + ô ghi chú cho người review, nút "Lưu bản vá".
   - `mail` → soạn thư (Đến, Tiêu đề, thân thư theo field, placeholder), nút "Gửi".
   - `note` → tài liệu ghi chú sự cố: 3 ô + bảng giả thuyết (select Loại/Giữ/Chưa rõ + Vì sao).
   - `channel` → khung chat kiểu Slack cho #su-co.
   - không có `view` → hiện `body` như văn bản.
3. **Nối hành động**: `open` → gửi lượt, xong thì mở cửa sổ tài liệu đó; `run` → gửi lượt, mở cửa sổ kết quả; `write`/`rewrite`/`message` → mở cửa sổ soạn (thay `Dialog` + `ArtefactForm`), gửi khi bấm lưu; nút ở dạng `artefact` (n2, n3) → khung trả lời hiện nút "Mở …" và tự mở cửa sổ soạn. Lỗi gửi giữ nguyên bản nháp.
4. **Sổ tay**: tab tài liệu chỉ còn danh sách tài liệu, bấm là mở cửa sổ; không còn hiện nội dung trong sổ tay.
5. **Slide giới thiệu**: `introSlides` thành carousel trước nút "Vào ca" (giữ thẻ vai/người gặp làm slide cuối nếu seed không có slide).
6. **Thuật ngữ**: trong lời NPC, từ khớp `glossary` gạch chân chấm, chạm/rê hiện giải nghĩa.
7. **Bot và trạng thái**: dòng `system` có speaker là bot hiện như tin bot (tên từ `bots`); `cast[].status` hiện cạnh tên người.
8. **Lượt báo tin cuối ca** (`await.kind === 'last_word'`): ô nhập với prompt + nút "Bỏ qua" (gửi `end_conversation`). Thêm vào `TurnInput` nếu cần và map ở `api/demo/play.ts`.
9. Hộp xác nhận nộp n3: "Gửi xong thì ca này kết thúc."
10. Kiểm: `pnpm exec nx run @datn/web:typecheck`, `lint`, `test`; sửa test UI bị vỡ do đổi luồng (`PlayJourney.spec`, `PlayUx.spec`…).
