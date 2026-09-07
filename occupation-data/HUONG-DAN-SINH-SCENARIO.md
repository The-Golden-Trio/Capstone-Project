# Hướng dẫn sinh scenario

> Dành cho người trong team cần tạo thêm kịch bản cho lớp mô phỏng nghề.
> Không cần đọc hết spec trước. Làm theo 6 bước dưới, gặp chỗ nào không chắc thì tra mục tương ứng trong `spec-scenario-KHOI1.md`.

**File liên quan**

| File | Vai trò |
|---|---|
| `spec-scenario-KHOI1.md` | Bộ quy tắc. Bất biến, không sửa vì một kịch bản lẻ |
| `scenario-golden/SWE_BACKEND_L3.json` | Kịch bản mẫu. Xem để hiểu, **không dán vào phiên sinh** |
| `9_roles_tier1_pass2.json` | Dữ liệu 9 role đã xác minh |
| `dataset_final_merged.json` | Dữ liệu đầy đủ 78 role |

---

## 0. Bảy khái niệm cần nắm

Đọc một lượt là đủ, không cần thuộc.

| Khái niệm | Nghĩa |
|---|---|
| **job** | Một cặp `(role_code, band)`. Ví dụ `SWE_BACKEND` + `L3`. Đây là đơn vị sinh |
| **band** | Cấp bậc L1–L10. L1 intern → L10 C-level |
| **archetype** | Một trong 6 kiểu tình huống (`S_EXEC`, `S_AMBIG`, `S_INCIDENT`, `S_CONFLICT`, `S_REVIEW`, `S_DECISION`). Mở khoá dần theo band |
| **beat cố định** | Nhịp viết sẵn trong file. Mỗi kịch bản có 3–4 cái, nối nhau bằng `forward_to` |
| **follow-up** | Câu đào sâu, **runtime AI tự sinh**, không viết sẵn. File chỉ khai trần `limitFollowup` và `followup_goal` |
| **hint** | Gợi ý người chơi chủ động bấm xem. Dùng hint thì beat đó tối đa mốc `0` |
| **quick action** | Beat gấp có đồng hồ đếm ngược cưỡng chế. Hết giờ tính `-1` |
| **observes** | Rubric. Mỗi beat khai nó quan sát kỹ năng nào, kèm 3 mốc hành vi `+2` / `0` / `-1` |
| **random event** | Sự kiện gieo theo xác suất, đổi đường đi (`DIVERT`) hoặc kết thúc sớm (`EARLY_END`) |
| **ending** | Kết cục. Mỗi kịch bản có 2–5 cái, kiểu `GOOD` / `PARTIAL` / `BAD` / `SECRET` |
| **fallback tier** | Nấc 1–3, cho biết dữ liệu lấy từ đâu. Tier 1 là dữ liệu thật, tier 3 là suy luận |

**Hai luật quan trọng nhất, nhớ mỗi hai cái này thôi cũng được:**

1. Cùng một nghề ở band khác nhau **phải chơi khác nhau**. Kịch bản dán được sang band khác mà không phải sửa gì thì nó sai.
2. `FREETEXT` là **mặc định**. `CHOICE` tối đa 1 mỗi kịch bản và phải giải thích vì sao bắt buộc.

---

## 1. Chọn job và kiểm xem có dữ liệu không

Chạy lệnh này để xem những job nào có đủ dữ liệu (fallback tier 1 — dễ làm nhất, nên bắt đầu từ đây):

```bash
python3 - <<'PY'
import json
rows=[]
for f in ("occupation-data/9_roles_tier1_pass2.json","occupation-data/dataset_final_merged.json"):
    for r in json.load(open(f)):
        for l in (r.get('levels') or []):
            if l.get('tasks'):
                rows.append((r['role_code'], l['band'], l.get('evidence_level','?'),
                             len(l['tasks']), len(l.get('skills_hard') or []),
                             len(l.get('skills_soft') or [])))
seen=set(); out=[]
for x in rows:
    if (x[0],x[1]) in seen: continue
    seen.add((x[0],x[1])); out.append(x)
out.sort()
print(f"{'ROLE_CODE':<18}{'BAND':<6}{'EVIDENCE':<14}{'TASK':<6}{'HARD':<6}{'SOFT':<6}")
for x in out: print(f"{x[0]:<18}{x[1]:<6}{x[2]:<14}{x[3]:<6}{x[4]:<6}{x[5]:<6}")
print(f"\nTong: {len(out)} job co du lieu day du")
PY
```

Hiện có **40 job** như vậy, trải trên 10 role. `SWE_FRONTEND` là role giàu dữ liệu nhất (dựng từ 40 tin tuyển dụng thật) — nếu bạn mới làm lần đầu thì chọn một band của role này.

Job không có trong danh sách vẫn sinh được, nhưng rơi vào tier 2 hoặc 3 — xem mục 5.

---

## 2. Trích dữ liệu của job

Đổi `ROLE` và `BAND` ở dòng đầu rồi chạy. Kết quả là JSON, copy toàn bộ để dùng ở bước 3.

```bash
python3 - <<'PY'
import json
ROLE, BAND = "QA_MANUAL", "L4"          # <<< DOI O DAY
for f in ("occupation-data/9_roles_tier1_pass2.json","occupation-data/dataset_final_merged.json"):
    d = json.load(open(f))
    r = next((x for x in d if x['role_code']==ROLE), None)
    if not r: continue
    lv = next((l for l in (r.get('levels') or []) if l['band']==BAND), None)
    if not lv: continue
    print(json.dumps({
      "source_dataset": f.split('/')[-1],
      "role_code": r['role_code'], "role_name_vn": r['role_name_vn'],
      "role_group": r['role_group'], "archetype": r['archetype'],
      "occupied_bands": r['occupied_bands'],
      "company_type_variance": r['company_type_variance'],
      "work_environment_ids": r.get('work_environment_ids'),
      "level": lv,
    }, ensure_ascii=False, indent=2)); break
else:
    print("KHONG TIM THAY. Kiem tra lai role_code va band.")
PY
```

Nhìn qua kết quả một lượt. Nếu `level.tasks` rỗng thì bạn đang ở tier 2/3 — đọc mục 5 trước khi đi tiếp.

---

## 3. Sinh trong một phiên AI mới

### Phiên phải MỚI và SẠCH

Đây là chỗ hay sai nhất. Nếu AI đã thấy `SWE_BACKEND_L3.json` trong ngữ cảnh, nó sẽ chép lại tình huống API chậm với vài chữ đổi đi. Bạn nhận về một bản sao chứ không phải kịch bản mới.

- Mở cuộc trò chuyện mới hoàn toàn
- **Không** dán file golden vào
- Không dán hướng dẫn này vào

### Dán theo đúng thứ tự này

```
[1] Nguyên KHỐI A của spec-scenario-KHOI1.md
    — từ dòng "# KHỐI A — SINH SKELETON (offline)"
    — tới hết mục "A15. Mười lăm lỗi hay gặp"
    — KHÔNG dán KHỐI B

[2] --- JOB CẦN SINH ---
    [JSON từ bước 2]

[3] Sinh scenario cho job này theo KHỐI A.
    Trả về JSON, nhiều scenario ngăn bằng ===SPLIT===.
```

### Bao nhiêu scenario một lần?

Theo A3, mỗi job sinh **một scenario cho mỗi archetype đang mở** ở band đó. Trần follow-up (A7) cũng đổi theo band:

| Band | Archetype mở | Số scenario | Trần follow-up mỗi scenario |
|---|---|---|---|
| L1 | `S_EXEC` | 1 | ≤ 2 |
| L2 | thêm `S_AMBIG` | 2 | ≤ 2 |
| L3 | thêm `S_INCIDENT` | 3 | ≤ 3 |
| L4–L5 | thêm `S_CONFLICT`, `S_REVIEW` | 5 | ≤ 3 |
| L6+ | thêm `S_DECISION` | 6 | ≤ 4 |

Sinh cả bộ trong một lượt thì AI tự tránh trùng lặp giữa chúng. Sinh lẻ từng cái thì bạn phải tự chặn — xem mục 4.

---

## 4. Sinh thêm cho job đã có scenario

> ⚠️ **Spec hiện chưa có quy tắc chống trùng.** Khối A được viết để sinh cả bộ trong một lượt. Khi bạn thêm lẻ, phải tự chặn bằng tay theo cách dưới.

Dán thêm khối này vào **sau** JSON job:

```
--- ĐÃ SINH RỒI, KHÔNG ĐƯỢC TRÙNG ---
S_INCIDENT: đã dùng task "Tối ưu hóa các API bị chậm",
            cảnh N+1 query trên endpoint lịch sử đơn hàng,
            đã quan sát "Giải quyết vấn đề" và "Làm việc độc lập"

Sinh S_EXEC và S_AMBIG cho job này. Mỗi cái phải neo vào một task KHÁC
trong tasks[], và không được lặp lại bối cảnh ở trên.
```

**Đưa tóm tắt, đừng đưa cả file JSON.** Đưa cả file thì AI bám vào cả văn phong lẫn nội dung, và bạn sẽ nhận về ba biến thể của cùng một tình huống.

Tóm tắt cần đúng ba thứ: task đã dùng, bối cảnh đã dựng, kỹ năng đã quan sát.

---

## 5. Khi job thiếu dữ liệu

Ba trường hợp, xử lý khác nhau:

### Tier 2 — `tasks[]` rỗng nhưng band liền kề có

AI sẽ tự mượn theo A5. Việc của bạn là **kiểm lại phạm vi hậu quả**: task mượn từ L5 mà đem sang L3 thì phải hạ quy mô xuống, không thì vi phạm trục band.

Kiểm `coverage_note` có ghi rõ mượn từ band nào không. Không ghi là sai.

### Tier 3 — cả role không có task nào

`evidence_level` phải là `C_INFERRED`, và `coverage_note` phải nói rõ đây là suy luận. Đọc kỹ hơn bình thường: đây là chỗ AI dễ viết bằng giọng chắc chắn nhất.

### Role archetype C — không có `levels[]`

Role kiểu này (ví dụ `SWE_ARCH_ENT`) chỉ có `destination_profile`. Sinh **một job duy nhất**, band lấy từ `destination_profile.band_range`. Lệnh ở bước 2 sẽ không tìm thấy — dùng bản này thay thế:

```bash
python3 - <<'PY'
import json
ROLE = "SWE_ARCH_ENT"                    # <<< DOI O DAY
d = json.load(open('occupation-data/dataset_final_merged.json'))
r = next(x for x in d if x['role_code']==ROLE)
print(json.dumps({
  "source_dataset":"dataset_final_merged.json",
  "role_code": r['role_code'], "role_name_vn": r['role_name_vn'],
  "role_group": r['role_group'], "archetype": r['archetype'],
  "occupied_bands": r['occupied_bands'],
  "company_type_variance": r['company_type_variance'],
  "work_environment_ids": r.get('work_environment_ids'),
  "destination_profile": r['destination_profile'],
}, ensure_ascii=False, indent=2))
PY
```

### Không có gì cả

AI phải **không sinh** và ghi vào `unknowns[]`. Trả về rỗng là hành vi đúng, không phải lỗi. Đừng ép nó sinh.

---

## 6. Lưu file

Đặt tên theo `<ROLE_CODE>_<BAND>_<ARCHETYPE>.json`:

```
occupation-data/scenarios/QA_MANUAL/L4_S_REVIEW.json
occupation-data/scenarios/QA_MANUAL/L4_S_CONFLICT.json
```

Thư mục `scenario-golden/` chỉ giữ 2–4 file làm mẫu — **đừng bỏ kịch bản thường vào đó**.

Nhớ bỏ hết comment `//` nếu AI trả về dạng jsonc, vì JSON chuẩn không có comment.

---

## 7. Kiểm trước khi commit

### Kiểm bằng máy

Đổi đường dẫn ở dòng đầu rồi chạy. Mọi dòng phải `True` hoặc `OK`.

```bash
python3 - <<'PYEOF'
import json, csv, glob
P = "occupation-data/scenarios/QA_MANUAL/L4_S_REVIEW.json"   # <<< DOI O DAY

s = json.load(open(P)); ok = lambda c: "OK  " if c else "FAIL"
ctx, beats, ev, re_ = s['context'], s['beats'], s['endings'], s.get('random_events', [])
bn = int(s['job']['band'].lstrip('L'))
codes = {r['role_code'] for r in csv.DictReader(open('occupation-data/roles.csv', encoding='utf-8-sig'))}

role = lv = None
for f in ("occupation-data/9_roles_tier1_pass2.json","occupation-data/dataset_final_merged.json"):
    for r in json.load(open(f)):
        if r['role_code']==s['job']['role_code']:
            role = role or r
            for l in (r.get('levels') or []):
                if l['band']==s['job']['band'] and l.get('tasks'): lv = lv or l

print(ok(s['job']['role_code'] in codes), "role_code trong roles.csv")
print(ok(s['job']['band'] in role['occupied_bands']), "band trong occupied_bands")

gate = {'S_EXEC':1,'S_AMBIG':2,'S_INCIDENT':3,'S_CONFLICT':4,'S_REVIEW':4,'S_DECISION':6}
print(ok(gate[ctx['scenario_archetype']] <= bn), "archetype mo o band")
print(ok(3 <= len(beats) <= 4), f"so beat co dinh = {len(beats)} (can 3-4)")

# --- A7: CHOICE la ngoai le ---
ch = [b for b in beats if b['type']=='CHOICE']
print(ok(len(ch)<=1), f"CHOICE <= 1 (co {len(ch)})")
print(ok(all(b.get('choice_reason') for b in ch)), "CHOICE co choice_reason")
print(ok(all(len(b['options'])==3 for b in ch)), "CHOICE dung 3 option")
print(ok(all((b['options'] is None)!=(b['input_prompt'] is None) for b in beats)), "options/input_prompt loai tru")

# --- A7: do thi beat ---
ids = {b['beat_id'] for b in beats}
origins = [b for b in beats if b.get('isOrigin')]
reach = set(); cur = origins[0]['beat_id'] if origins else None
while cur and cur != 'END' and cur not in reach:
    reach.add(cur); cur = next(b['forward_to'] for b in beats if b['beat_id']==cur)
print(ok(len(origins)==1), f"dung 1 isOrigin (co {len(origins)})")
print(ok(all(b['forward_to'] in ids or b['forward_to']=='END' for b in beats)), "forward_to tro toi beat co that")
print(ok(sum(1 for b in beats if b['forward_to']=='END')==1), "dung 1 beat forward_to=END")
print(ok(reach==ids), "moi beat toi duoc tu goc", (ids-reach) or "")

# --- A7: tran follow-up + ngan sach ---
cap = {1:2,2:2,3:3,4:3,5:3}.get(bn, 4)
tot = sum(b['limitFollowup'] for b in beats)
print(ok(tot<=cap), f"tong limitFollowup = {tot} <= tran band {cap}")
print(ok(all(b['limitFollowup']<=2 for b in beats)), "moi beat <= 2 followup")
print(ok(all(b['limitFollowup']==0 for b in beats if b['type']=='CHOICE' or b.get('quick_action'))),
      "CHOICE/quick_action co limitFollowup=0")
print(ok(all((b['followup_goal'] is None)==(b['limitFollowup']==0) for b in beats)), "followup_goal khop limitFollowup")
budget = 2*sum(1 for b in beats if b['type']=='FREETEXT') + 1*len(ch) + 1.5*tot + 2
print(ok(10<=budget<=15), f"ngan sach = {budget} phut | khai bao {ctx['estimated_minutes']}")

# --- A9 / A10 / A11 ---
print(ok(all(len(b['hints'])<=1 for b in beats)), "hints toi da 1")
print(ok(all(not b['hints'] for b in beats if b['type']=='CHOICE' or b.get('quick_action'))),
      "CHOICE/quick_action khong co hint")
print(ok(all(b.get('closing_prompt') for b in beats)), "moi beat co closing_prompt")
qa = [b for b in beats if b.get('quick_action')]
print(ok(len(qa)<=1), f"quick_action <= 1 (co {len(qa)})")
print(ok(all(20<=b['time_limit_seconds']<=60 for b in qa)), "time_limit_seconds trong [20,60]")

# --- A12 random event ---
eids = {e['ending_id'] for e in ev}
ee = [r for r in re_ if r['outcome']=='EARLY_END']
print(ok(len(re_)<=2), f"random_events <= 2 (co {len(re_)})")
print(ok(all(0.1<=r['chance']<=0.4 for r in re_)), "chance trong [0.1,0.4]")
print(ok(all(r['after_beat'] in ids for r in re_)), "after_beat co that")
print(ok(all(r['early_ending_id'] in eids for r in ee)), "EARLY_END tro toi ending co that")
print(ok(all(r['condition'] is not None for r in ee)), "EARLY_END co condition (khong cat oan nguoi choi tot)")
print(ok({e['ending_id'] for e in ev if e.get('reachable_by_event')}=={r['early_ending_id'] for r in ee}),
      "reachable_by_event khop random_events")

# --- neo ve dataset ---
if lv:
    hard = {x['skill'] for x in lv['skills_hard']}; soft = set(lv['skills_soft'])
    print(ok(ctx['task'] in lv['tasks']), "task nguyen van")
    print(ok(set(ctx['skills_hard'])<=hard and set(ctx['skills_soft'])<=soft), "context.skills nguyen van")
    print(ok(soft <= {o['skill'] for b in beats for o in b['observes'] if o['skill_type']=='soft'}), "phu het skills_soft")
else:
    print("--   task/skill nguyen van: BO QUA (tier 2/3, phai doc bang mat)")
bad = [(b['beat_id'], o['skill']) for b in beats for o in b['observes']
       if o['skill'] not in (ctx['skills_hard'] if o['skill_type']=='hard' else ctx['skills_soft'])]
print(ok(not bad), "observes.skill nam trong context.skills", bad or "")
print(ok(role['company_type_variance'][ctx['company_type']] != "CHUA_CO_DU_LIEU"), "company_type co du lieu")
print(ok(ctx['work_environment_id'] in (role.get('work_environment_ids') or [])), "work_env hop le")

# --- A13 endings ---
by = {}
for x in ev: by.setdefault(x['type'], []).append(x)
last = max(ev, key=lambda x: x['priority'])
print(ok(2<=len(ev)<=5), f"so ending = {len(ev)}")
print(ok(len(by.get('GOOD',[]))==1 and len(by.get('BAD',[]))==1), "GOOD=1, BAD=1")
print(ok(len({x['priority'] for x in ev})==len(ev)), "priority khong trung")
print(ok(all(x['priority']==1 for x in by.get('SECRET',[]))), "SECRET priority=1")
print(ok(all(last['condition'][k] is None for k in ('min_plus2','max_minus1','extra'))), "co ending vet")
tot_obs = sum(len(b['observes']) for b in beats)
print(ok(max((x['condition']['min_plus2'] or 0) for x in ev)<=tot_obs), f"nguong +2 cao nhat <= {tot_obs} moc kha di")
print(ok(len(s['unknowns'])>=2), f"unknowns = {len(s['unknowns'])}")

# --- chong trung voi scenario cung job ---
others = [json.load(open(p)) for p in glob.glob(f"occupation-data/scenarios/{s['job']['role_code']}/*.json") if p != P]
same = [o for o in others if o['job']['band']==s['job']['band']]
print("--  ", "trung task     :", [o['context']['scenario_archetype'] for o in same if o['context']['task']==ctx['task']] or "khong")
print("--  ", "trung archetype:", [o['context']['scenario_archetype'] for o in same if o['context']['scenario_archetype']==ctx['scenario_archetype']] or "khong")
PYEOF
```

### Kiểm bằng mắt — 9 câu, máy không kiểm được

Đây là phần quan trọng hơn. Đọc kịch bản rồi tự trả lời:

1. **Che `role_code` và `band` đi, kịch bản này có dán được sang band khác không?** Dán được là hỏng, viết lại. Đây là lỗi nặng nhất.
2. **Ba phương án của beat `CHOICE`, có cái nào ngu ngốc hiển nhiên không?** Nếu bạn loại được một phương án trong nửa giây thì beat đó chỉ còn hai lựa chọn.
3. **`choice_reason` có thuyết phục không?** Nếu tình huống đó vẫn gõ tự do được thì nó phải là `FREETEXT`. Mỗi beat `CHOICE` là một beat đánh mất cơ hội quan sát.
4. **Mốc hành vi có viết bằng tính từ không?** "Giao tiếp tốt" là sai. Phải là hành vi quan sát được.
5. **Hint có đưa thẳng đáp án không?** "Em xem log DB chưa?" là đúng. "Đây là N+1 query" là sai — nó cho luôn thứ đang được đo, và beat mất giá trị kể cả khi đã hạ trần.
6. **NPC có áp lực thật không?** Nếu NPC nào cũng rảnh và sẵn sàng giúp thì tình huống mất sức nặng.
7. **Có tên công ty thật, tên sản phẩm thật, hay số liệu trông như thật không?** Tất cả phải hư cấu và vô danh.
8. **Random event có mở tình huống mới không?** Nó phải đổi *đường đi*, không đổi *đề bài*. Một sự cố khác hẳn ập tới giữa chừng là scenario thứ hai bị nhét vào.
9. **Ending `SECRET` (nếu có): có beat nào cho phép người chơi làm điều đó không?** Không có thì đó là kết cục chết.

---

## 8. Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| Kịch bản mới giống hệt cái cũ | Đã dán file golden hoặc kịch bản cũ vào phiên | Mở phiên mới, chỉ đưa tóm tắt như mục 4 |
| L1 và L5 đọc như nhau | AI bỏ qua trục band | Nhắc lại bảng A4 và yêu cầu sinh lại, chỉ rõ phạm vi hậu quả phải khác |
| Kiểm báo skill không nguyên văn | AI tự diễn giải lại tên kỹ năng | Bảo nó copy đúng ký tự từ JSON đầu vào. Đây là lỗi hay lặp lại nhất |
| Ngân sách vượt 15 phút | Quá nhiều beat `FREETEXT` | Bớt beat, **không** rút ngắn nội dung beat để lách |
| `unknowns` chỉ có 1 mục | AI tự tin giả | Yêu cầu bổ sung. Tối thiểu 2, và phải là nghi ngờ thật chứ không phải câu lấp chỗ |
| Không có ending vét | AI đặt điều kiện cho cả 5 ending | Bắt ending `priority` lớn nhất để cả ba trường điều kiện `null` |
| AI sinh `S_DECISION` cho L2 | Bỏ qua bảng mở khoá A3 | Nhắc lại A3, yêu cầu sinh lại |
| Sinh 2–3 beat `CHOICE` | AI vẫn theo thói quen cũ, `CHOICE` dễ viết hơn | Nhắc A7: `FREETEXT` là mặc định, `CHOICE` tối đa 1 và phải có `choice_reason` |
| `EARLY_END` không có `condition` | AI bỏ sót luật hai cổng | Bắt thêm `condition`, nếu không sự kiện sẽ cắt oan cả người đang chơi tốt |
| Beat không ai trỏ tới | `forward_to` gãy | Rà lại chuỗi `isOrigin` → ... → `END`, sửa đúng con trỏ bị sai |

Nguyên tắc chung khi sửa: **bảo AI sửa đúng chỗ sai, đừng sinh lại từ đầu.** Sinh lại thì bạn mất cả những phần đã tốt.

---

## 9. Khi nào dừng lại và hỏi

Ba tình huống nên hỏi người viết spec thay vì tự quyết:

- **Nhiều job cùng sinh sai một kiểu.** Đó là lỗi của quy tắc, không phải của kịch bản. Sửa `spec-scenario-KHOI1.md` chứ đừng vá từng file.
- **Bạn thấy cần thêm field mới vào JSON.** Schema ở mục A9 là hợp đồng — thêm field tự phát thì server đọc không ra.
- **Chơi thử thấy thời lượng lệch hẳn khỏi 10–15 phút.** Sửa hệ số ngân sách ở A7 một lần, đừng chỉnh `estimated_minutes` của từng file.

Bảng tra nhanh:

| Vấn đề | Sửa ở đâu |
|---|---|
| Một kịch bản dở, các cái khác ổn | Sửa tay file JSON đó |
| Nhiều kịch bản cùng sai một kiểu | `spec-scenario-KHOI1.md` |
| Thời lượng lệch hệ thống | Mục A7 |
| Band không phân biệt được | Bảng trục band ở A4 |
| AI lúc chạy game bịa số / lộ rubric | KHỐI B, mục B2 và B6 |
