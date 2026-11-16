# Báo cáo QA explorer UI và design system

Ngày rà: 16/11/2026. Nhánh: `feat/explorer-ui-v0`. Phạm vi: code hiện tại trong `apps/web/src`, `packages/ui/src`; không đọc lịch sử prototype. Chỉ ghi file báo cáo này; không sửa source, không commit, không dùng subagent. Workspace đang có nhiều người sửa song song, nên số dòng là tại thời điểm rà.

## Phương pháp, căn cứ và giới hạn

Đây là **audit tĩnh**, không phải chứng nhận WCAG hay kết quả chạy end-to-end. Responsive được suy luận từ class ở 360 px và 768 px; chưa đo DOM, chưa thử screen reader, bàn phím trên trình duyệt hay fault injection với model thật. Hiệu năng là dấu hiệu cần profiling, không phải số đo runtime.

Căn cứ nội bộ:

- `.codex-tasks/J.md`: ngôn ngữ, một hành động chính, vàng cho hành động chính/tiến độ cá nhân, loading/error/empty, mobile first.
- `research/reports/Hồ sơ JobQuest cơ chế game.md`: khối B (nhận xét hành vi), C (tự kể lúc này, thông báo dữ liệu gửi AI), E, đoạn “Lời lý do” (bằng chứng và từ cấm); khối F (hoàng đạo không tham gia gợi ý).
- `research/reports/Luật dẫn truyện JobQuest.md`, `research/reports/Seed scenario JobQuest.md`: nhịp thoại, vai, dữ kiện, điểm thời gian và sổ tay; seed G có `honest_note` theo BR-07.
- `docs/project-hub/assets/jobquest-requirements-report.md:18`: BR-06; dòng 19: BR-07; dòng 61–62: NFR-03/04; dòng 65: NFR-07.
- [WCAG 2.2, W3C](https://www.w3.org/TR/WCAG22/): dùng các tiêu chí ghi tại từng phát hiện. Không coi mọi khuyến nghị UX là một lỗi WCAG đã chứng minh.

Mức **Cao**: cản trải nghiệm cốt lõi, mất nội dung đang soạn hoặc khó phục hồi. **Vừa**: vi phạm quy ước/khả năng truy cập hay trạng thái quan trọng. **Thấp**: độ rõ ràng, nhất quán hoặc tối ưu cần xác nhận.

## Phát hiện

### J-01 · Cao · Nhịp thoại tự chạy hết

**Vị trí:** `apps/web/src/features/play/usePlaySession.ts:121`.

Effect phụ thuộc `revealed` và luôn tăng thêm một dòng khi gặp NPC/cảnh ở ngay vị trí hiện tại. Mỗi lần `setRevealed` lại chạy effect, nên một chuỗi lời thoại sẽ tự hiện hết qua các render dù chưa bấm “Tiếp”. `queued` nhanh chóng về 0 và Composer được mở trước khi người chơi đọc xong.

**Vì sao:** trái quy ước bấm qua nhịp của Stage và seed C3; làm mất nhịp visual novel.

**Sửa:** chỉ tự vượt các dòng player/system; lần mở đầu chỉ tự hiện một nhịp theo một chuyển trạng thái riêng. Không tự tăng ở mọi lần `revealed` đổi. Kiểm bằng chuỗi nhiều NPC/cảnh: phải còn hàng đợi cho tới khi người chơi bấm.

### J-02 · Cao · Lỗi tải cảnh trở thành loading vô hạn

**Vị trí:** `apps/web/src/features/play/PlayPage.tsx:61`, `apps/web/src/features/play/usePlaySession.ts:64`.

Nếu `useRun` thành công nhưng `scene` hoặc `transcript` trả lỗi mạng/500, hook đặt `s.error` và không đặt `ready`. Page chỉ nhận lỗi phiên bằng so sánh chuỗi `'not-found'`, rồi trả LoadingBlock ở dòng 68; thông báo lỗi bên dưới không bao giờ xuất hiện.

**Vì sao:** mọi async view phải có lỗi và đường phục hồi; NFR-04 cần thông báo khi xử lý thất bại.

**Sửa:** tách lỗi khởi tạo khỏi lỗi gửi lượt, render `errorText` cùng nút tải lại khi chưa ready; dùng mã lỗi thay so sánh thông báo.

### J-03 · Cao · Mất câu trả lời khi gửi lỗi

**Vị trí:** `apps/web/src/features/play/Composer.tsx:129`, `apps/web/src/features/play/PlayPage.tsx:198`.

TextReply xoá text ngay sau `onSend`; biểu mẫu action đóng trước khi `s.send` xong. Hook bắt lỗi và chỉ trả `Promise<void>`, nên caller không biết thất bại để giữ/khôi phục nội dung. Lỗi mạng có thể làm người chơi phải viết lại cả tài liệu.

**Vì sao:** NFR-03/04 và nguyên tắc giữ tiến độ khi xử lý thất bại. Bản nháp chưa gửi không phải committed progress, nhưng đây vẫn là mất nội dung người dùng ngay trong đường phục hồi.

**Sửa:** trả kết quả thành công/thất bại; chỉ xoá/đóng sau xác nhận thành công, giữ draft theo run và action/node; cho gửi lại mà không nhân đôi lượt đã nhận.

### J-04 · Cao · Gửi lựa chọn lỗi rồi không thể chọn lại

**Vị trí:** `apps/web/src/features/play/Composer.tsx:190` (Choices, `sent.current`).

`choose` đặt `sent.current = true` trước khi gửi. Nếu request thất bại và node không đổi, ref vẫn true; mọi lần bấm sau bị bỏ và button bị disabled sau render. Nhánh timeout cũng có trạng thái tương tự.

**Vì sao:** mutation cần thông báo lỗi và khả năng phục hồi; NFR-03/04.

**Sửa:** phân biệt đang gửi/đã xác nhận; phục hồi lựa chọn khi lỗi hoặc thêm retry với cùng định danh lượt. Giữ lựa chọn và elapsedMs ban đầu cho retry.

### J-05 · Cao · Màn giới thiệu phủ giao diện nhưng không quản lý focus

**Vị trí:** `apps/web/src/features/play/PlayPage.tsx:233`.

IntroOverlay là div tuyệt đối, không modal semantics, không đặt focus và không làm phần dưới inert. Composer còn tự focus textarea khi mount (`Composer.tsx:128`). Người dùng bàn phím có thể đang ở ô nhập/nút phía sau lớp phủ, và có thể gửi thao tác trước “Vào ca”.

**Vì sao:** WCAG 2.4.3, 2.4.11; quy ước focus trong dialog và một bước bắt đầu ca rõ ràng.

**Sửa:** dùng Dialog có tên truy cập, focus nút “Vào ca”, giữ phần nền inert; hoặc render intro thay toàn bộ giao diện chơi rồi mount Composer sau khi vào ca.

### J-06 · Cao · Checkbox trong giấy bị ép chữ tối trên nền tối

**Vị trí:** `apps/web/src/features/play/ArtefactForm.tsx:44`, dòng 64.

Selector `[&_label]:text-paper-ink/80` áp cho mọi label, kể cả label của Checkbox nằm trong `bg-night-900/90`. Chữ checkbox vì vậy dùng màu mực giấy tối trên nền navy, khó đọc.

**Vì sao:** WCAG 1.4.3; người chơi cần đọc các lựa chọn trong tài liệu.

**Sửa:** giới hạn override cho Field trên giấy; checkbox trên navy phải có label `text-ink`/`text-ink-muted`, hoặc đổi cả khối checkbox sang nền giấy. Kiểm computed color vì thứ tự utility có thể ảnh hưởng override.

### J-07 · Vừa · Chờ quá lâu và paused thiếu đường dự phòng đầy đủ

**Vị trí:** `apps/web/src/features/play/usePlaySession.ts:102`, `apps/web/src/features/play/PlayPage.tsx:76`.

Thông báo “chậm hơn thường lệ” chỉ xuất hiện nếu nhận event `delay`. Khi SSE mất hoặc không có delay event, polling 8 giây nuốt mọi lỗi và có thể giữ “Đang soạn lời…” vô hạn. Poll không kiểm tra `sc.paused`, dù khởi tạo có kiểm tra thuộc tính này. Nếu mất event paused, UI có thể không hiện nút tiếp tục hoặc không giải thích đúng trạng thái.

**Vì sao:** NFR-04 yêu cầu thông báo trong 10 giây khi nhà cung cấp lỗi. UI hiện chưa tự bảo đảm điều này; chưa kết luận thời gian thực tế của backend.

**Sửa:** thêm watchdog thời gian chờ, nhận paused cả từ polling, phân biệt mất kết nối và chờ model; hiện trạng thái đã lưu cùng retry/thoát rõ ràng. Không hứa “không mất gì” cho draft chưa được lưu.

### J-08 · Vừa · Ghi chú thiếu loading/error/empty và lỗi lưu

**Vị trí:** `apps/web/src/features/play/Notebook.tsx:188`, dòng 218.

Query notes render `(notes.data ?? [])`, nên đang tải, tải lỗi và không có ghi chú đều thành danh sách trắng. Mutation add có pending nhưng không hiện lỗi; người chơi không biết ghi chú đã được lưu hay chưa.

**Vì sao:** yêu cầu state coverage; WCAG 3.3.1/4.1.3 cho lỗi/trạng thái cần nhận biết.

**Sửa:** thêm loading, lỗi có retry, empty có lời hướng dẫn; hiện `errorText(add.error)` và trạng thái lưu thành công. Giữ text hiện tại khi add lỗi như code đang làm.

### J-09 · Vừa · Báo nội dung sai không hiện lỗi gửi

**Vị trí:** `apps/web/src/features/play/PlayPage.tsx:303`.

Handler chỉ `try/finally`; nếu `api.play.flag` reject, dialog không hiển thị lỗi và promise từ click reject không được xử lý tại đây.

**Vì sao:** mutation phải có pending/error; WCAG 3.3.1.

**Sửa:** catch lỗi, render Callout hoặc `role="alert"`, giữ reason, cho gửi lại; chặn đóng khi đang gửi nếu thao tác đóng làm mất draft.

### J-10 · Vừa · Tab sổ tay không có panel được liên kết

**Vị trí:** `apps/web/src/features/play/Notebook.tsx:78`; `packages/ui/src/components/Tabs.tsx:80`.

Tabs sinh `aria-controls` từ id tự động nhưng nội dung sổ tay là div thường, không `TabPanel` và không cùng `idBase`. Trình đọc màn hình không có panel đích cho các tab.

**Vì sao:** WCAG 1.3.1, 4.1.2; task yêu cầu ARIA cho custom tab.

**Sửa:** Notebook tạo idBase ổn định, truyền cho Tabs và render TabPanel với tabKey tương ứng. Có thể làm API wrapper của DS để tránh caller quên liên kết.

### J-11 · Vừa · Skip link còn giữ clip khi focus

**Vị trí:** `apps/web/src/app/AppShell.tsx:34`; `packages/ui/src/styles/base.css`, utility `visually-hidden`.

Link dùng utility riêng `visually-hidden` (width/height 1px, clip, overflow hidden) nhưng chỉ bỏ ẩn bằng `focus:not-sr-only`. Biến thể Tailwind này không có ý nghĩa đảo tự động utility riêng; nguy cơ style clip/size vẫn còn do cascade. Main cũng chưa có `tabIndex` để nhận focus một cách chủ động.

**Vì sao:** WCAG 2.4.1, 2.4.7; đây là đường bỏ qua navigation cho bàn phím.

**Sửa:** dùng cặp `sr-only focus:not-sr-only` hoặc khai báo đầy đủ reset cho utility riêng; thêm `tabIndex={-1}` và chuyển focus tới main khi kích hoạt. Xác nhận computed style và Tab trên browser.

### J-12 · Vừa · Chuyển route chưa đưa focus tới nội dung mới

**Vị trí:** `apps/web/src/app/App.tsx:8`, `apps/web/src/app/AppShell.tsx:98`.

Không thấy handler dùng location để focus heading/main và cập nhật title theo route. Sau NavLink, focus có thể còn ở nav; ở mobile người dùng tiếp tục Tab qua phần cuối trang thay vì đầu nội dung mới. Quiz/onboard đã có focus nội bộ nhưng không bao phủ routing chung.

**Vì sao:** yêu cầu focus sau navigation; WCAG 2.4.2/2.4.3. Thiếu handler tự nó chưa đủ để chứng minh mọi route vi phạm, cần thử luồng thật.

**Sửa:** thêm quản lý focus/title ở layout router, chờ lazy route sẵn sàng, focus main/heading bằng `tabIndex=-1`; giữ hành vi hợp lý cho back và thay search params trong cùng màn.

### J-13 · Vừa · Bản đồ không có heading cấp trang

**Vị trí:** `apps/web/src/features/galaxy/GalaxyPage.tsx:121`, dòng 336; `apps/web/src/features/play/Notebook.tsx:118`.

Galaxy không render h1, nhưng panel chọn nghề bắt đầu h2. Tài liệu sổ tay dùng h4 dù vùng này không có h3 dẫn vào. Điều này làm cấu trúc nội dung khó dò theo heading.

**Vì sao:** quy ước headings theo thứ tự; WCAG 1.3.1/2.4.6 (không đồng nhất “thiếu h1” với tự động trượt AA).

**Sửa:** thêm h1 “Bản đồ ngân hà” có thể sr-only nếu toolbar cần gọn; dùng heading phù hợp trong Notebook/TabPanel hoặc văn bản thường khi không phải mục độc lập.

### J-14 · Vừa · Mặt khó chưa có trong thẻ xem nhanh trước khi vào nghề

**Vị trí:** `apps/web/src/features/galaxy/GalaxyPage.tsx:341`, dòng 378.

PeekPanel có lý do gợi ý, summary và nút “Vào cấp đầu tiên”, nhưng không có mặt khó. Người chơi có thể đi thẳng từ gợi ý vào nghề mà không đọc hồ sơ. OccupationPage và thẻ Suggestion ở QuizResultPage đã hiện mặt khó đúng hướng.

**Vì sao:** task yêu cầu mặt khó luôn hiện, BR-07. Không kết luận toàn bộ dữ liệu nghề thiếu mặt khó; lỗi ở đường hiển thị nhanh này.

**Sửa:** lấy downsides cho nghề đang chọn, hiện ít nhất mặt khó chính ngay cạnh lời gợi ý và CTA; xử lý loading/error/thiếu dữ liệu rõ ràng. Không giấu sau “Xem thêm”.

### J-15 · Vừa · `night-400` không an toàn cho chữ nhỏ

**Vị trí:** `packages/ui/src/styles/tokens.css:23`, `packages/ui/src/components/Field.tsx:17`.

`night-400` chỉ đạt **4,497898:1** trên night-900, dưới 4,5 dù làm tròn thành 4,50; thấp hơn trên night-850 và glass. Field dùng nó cho placeholder chữ thường. Nền input có alpha, nên phải đo thêm trên đúng nền chồng lớp; không suy ra mọi placeholder có cùng ratio.

**Vì sao:** WCAG 1.4.3 áp dụng cả placeholder. Bảng đo ở dưới.

**Sửa:** dùng `night-300`/`ink-faint` cho chữ nhỏ và placeholder, hoặc tạo token riêng có ngưỡng >=4,5 trên nền xấu nhất được phép. Thêm test các cặp thực sự sử dụng, không chỉ test công thức contrast.

### J-16 · Vừa · Giấy có bộ đếm chữ phụ sáng quá

**Vị trí:** `apps/web/src/features/play/ArtefactForm.tsx:49`; `packages/ui/src/components/Field.tsx:104`.

Counter Field vẫn dùng `text-night-300` trên giấy ngà. Ước lượng với #f8f6ee khoảng 2,3:1, dưới ngưỡng chữ nhỏ. Override hiện tại chỉ chỉnh label và textarea.

**Vì sao:** WCAG 1.4.3.

**Sửa:** thêm variant paper của Field cho label, hint, counter, error và focus; kiểm trên hai đầu gradient giấy, không chỉ textarea.

### J-17 · Vừa · Nhãn AI chưa luôn hiện đúng tại nơi dùng

**Vị trí:** `apps/web/src/features/play/PlayPage.tsx:255`, `apps/web/src/features/summary/SummaryPage.tsx:143`.

Intro chỉ nói lời nhân vật do AI dẫn dắt, rồi biến mất sau khi vào ca; mở lại ca có lời player thì intro tự tắt. PlayPage ngoài AppShell nên không có footer disclosure hay SampleDataPill. Với default hybrid, lời thực tế là AI giả nhưng intro viết chung như AI thật. Tổng kết READY đã có Callout ai, còn nhánh NOT_AVAILABLE và phần story không có disclosure riêng trong nội dung (footer AppShell chỉ hiện desktop).

**Vì sao:** NFR-07 yêu cầu công khai ở điểm sử dụng; không đánh đồng fixture/AI giả với model thật.

**Sửa:** giữ nhãn nhỏ thường trực trong màn chơi, phân biệt demo/hybrid/live theo nguồn; thêm nhãn cho phần kể lại nếu do AI tạo. Không gắn nhãn “AI chấm” như kết quả thật cho fixture.

### J-18 · Vừa · Rủi ro che khuất và tràn ngang ở màn chơi nhỏ

**Vị trí:** `apps/web/src/features/play/PlayPage.tsx:98`, `apps/web/src/features/play/Stage.tsx:102`, `apps/web/src/features/play/Notebook.tsx:122`.

Màn chơi `h-dvh overflow-hidden`; hộp thoại cuối Stage không có max-height/scroll riêng. Ở 360 px, lời dài cộng Composer và HUD có thể chiếm hết chiều cao, đẩy phần nội dung không cuộn ra ngoài khung. Tại 768 px xuất hiện portrait và padding trái 184 px, làm vùng chữ hẹp hơn. Body tài liệu/thoại chưa có `overflow-wrap:anywhere` cho URL, log token hay chuỗi người dùng dài.

**Vì sao:** mobile first, WCAG 1.4.10/1.4.4. Đây là rủi ro từ class, chưa phải lỗi tái hiện bằng screenshot.

**Sửa:** giới hạn chiều cao hộp thoại, cho nội dung cuộn hoặc toàn main cuộn; thử bàn phím ảo và chữ 200%; đặt min-w-0 và break-words/anywhere ở vùng lời/tài liệu phù hợp.

### J-19 · Thấp · Vùng chạm nhỏ cần kiểm tra spacing exception

**Vị trí:** `apps/web/src/features/play/PlayPage.tsx:171`, dòng 184.

“Báo nội dung sai” là button cỡ chữ 11–12px, không padding/min-height, chiều cao theo dòng nhỏ hơn 24px. Nút trong desktop header nằm gần heading và trên Notebook. Chưa đo khoảng trống xung quanh nên chưa khẳng định không đạt ngoại lệ khoảng cách của WCAG.

**Vì sao:** WCAG 2.5.8 yêu cầu kích thước tối thiểu hoặc khoảng cách tương đương; task ưu tiên 44px trên mobile.

**Sửa:** dùng button/utility min-h-6 min-w-6, ưu tiên min-h-11 cho mobile, kiểm hit boxes cách nhau đủ. Các LikeScale 64px và IconButton thông thường đã lớn hơn mức tối thiểu.

### J-20 · Thấp · Chuyển động JS và live region cần tinh chỉnh

**Vị trí:** `apps/web/src/features/play/Stage.tsx:103`, dòng 184.

Typewriter cập nhật text khoảng mỗi 16ms trong button `aria-live=polite`; có thể tạo thông báo từng đoạn thay vì một câu ổn định. History luôn yêu cầu smooth scroll bằng JS. CSS giảm chuyển động đã có và typewriter/map có kiểm tra preference, nhưng đường smooth scroll này vẫn cần xác nhận browser có ưu tiên CSS hay không.

**Vì sao:** task reduced motion và trạng thái dễ tiếp nhận; WCAG 4.1.3. Không gắn tự động lỗi AA cho mọi animation.

**Sửa:** live region riêng chứa cả câu, phần typewriter aria-hidden; cuộn auto khi reduced motion, chỉ tự cuộn nếu người dùng đang ở cuối lịch sử.

### J-21 · Thấp · Vàng dùng cho nhiều nhãn nội dung và nghề gợi ý

**Vị trí:** `apps/web/src/features/galaxy/GalaxyMap.tsx:373` (halo selected/suggested); `apps/web/src/features/galaxy/GalaxyPage.tsx:439`; `packages/ui/src/styles/base.css`, utility eyebrow.

Halo vàng và Badge gold cho “Gợi ý” không biểu thị tiến độ của người chơi; eyebrow mặc định vàng ở nhiều nhóm nội dung. Lời NPC, ký tự phương án và thuật ngữ cũng thường dùng vàng. Điều này làm primary/progress bớt nổi bật dù các trang đa số đã chọn một CTA chính.

**Vì sao:** nguyên tắc màu trong J.md. Đây là sai khác quy ước thiết kế, không phải kết luận WCAG.

**Sửa:** gợi ý và nhãn thông tin dùng info/ink hoặc màu vùng; giữ vàng cho CTA chính, tiến độ, bậc và phần thưởng cá nhân. Nhóm nên làm rõ ngoại lệ trang trí vì DS hiện cũng mô tả vàng là “điểm nhấn”.

### J-22 · Thấp · Demo nằm trên đường import khởi động

**Vị trí:** `apps/web/src/api/index.ts:19`, dòng 56; `apps/web/src/api/demo/data.ts:4`.

API nhập và tạo demo đồng bộ; demo data nhập catalogue 208.104 byte và shift seed 40.522 byte, rồi parse seed ở cấp module. Đường auth/hooks dùng api nên lazy route chưa loại được toàn bộ dữ liệu/engine demo khỏi đường khởi động. Profile nghề đã dùng glob lazy đúng hướng.

**Vì sao:** task performance, NFR-13; chưa đo bundle nén hay CPU nên không gọi là vi phạm ngân sách đã xác nhận.

**Sửa:** lazy-load demo service/data khi thật sự gọi, tách entry theo mode hoặc build config; đo bundle và thời gian parse ở thiết bị yếu trước khi tối ưu thêm.

### J-23 · Thấp · Bản đồ và sân khấu còn công việc lặp trong render

**Vị trí:** `apps/web/src/features/galaxy/GalaxyMap.tsx:275` (orderAround/map PlanetNode); `apps/web/src/features/play/Stage.tsx:64`, dòng 198.

Khi chọn/tìm nghề, các PlanetNode được dựng lại và orderAround sort lại từng nhóm; PlanetNode chưa memo. Typewriter render Stage thường xuyên, dựng lại History và callback nameOf props dù lịch sử không đổi; effect keyboard phụ thuộc object tw tạo mới mỗi render nên tháo/gắn listener theo nhịp chữ. Map đã dùng ref transform, useMemo layout và mức detail, tránh set state cho toạ độ mỗi frame.

**Vì sao:** yêu cầu audit hot paths; đây là dấu hiệu, không phải benchmark.

**Sửa:** cache polyline/order theo layout, memo node/history với props ổn định, keyboard handler qua ref/effect ổn định. Profile trước/sau với đủ 221 nghề và transcript dài.

### J-24 · Thấp · Lời hứa chấm lại chưa có cơ chế được chứng minh

**Vị trí:** `apps/web/src/features/summary/SummaryPage.tsx:144`; `apps/web/src/api/live/index.ts:345`.

UI hứa “điểm sẽ được tính lại … khi bộ chấm sẵn sàng”, nhưng live adapter trả NOT_AVAILABLE cố định và chưa có đường chấm lại trong interface được rà. Đây là trạng thái chưa hiện thực, không nên diễn đạt thành cam kết chắc chắn.

**Vì sao:** quy ước repo phân biệt đã hiện thực với dự định; task yêu cầu messaging chính xác.

**Sửa:** đổi thành “Ca này hiện chưa chấm điểm. Bạn vẫn có thể xem lại diễn biến.” Chỉ hứa chấm lại khi có thiết kế và cơ chế được xác nhận.

## Tính tương phản

Tính bằng script Node trong bộ nhớ: chuyển kênh sRGB sang độ chói tuyến tính rồi dùng `(L_sáng + 0,05)/(L_tối + 0,05)`. Glass lấy hai đầu gradient tại `packages/ui/src/styles/base.css`: top #1c3866 alpha 0,62, bottom #142b52 alpha 0,5, composite từng kênh trên nền đã ghi. Đây là mô hình màu phẳng, chưa bao gồm sao, blur/saturate và nền gradient thực tế.

| Nền                                           | ink-faint / night-300 (#8ea5c3) |      night-400 (#5d7ea8) |
| --------------------------------------------- | ------------------------------: | -----------------------: |
| night-900 #0a1026                             |                            7,46 | 4,497898 (không đạt 4,5) |
| night-850 #0f1a38                             |                            6,79 |                     4,09 |
| Glass top trên night-900                      |                            5,72 |                     3,45 |
| Glass bottom trên night-900                   |                            6,57 |                     3,96 |
| Glass top trên night-850                      |                            5,42 |                     3,27 |
| Glass bottom trên night-850                   |                            6,18 |                     3,73 |
| night-800 #142b52 (thêm để xét đáy nền trang) |                            5,56 |                     3,35 |
| Glass top trên night-800                      |                            4,96 |                     2,99 |
| Glass bottom trên night-800                   |                            5,56 |                     3,35 |

`ink-faint` và `night-300` cùng mã màu, đạt ngưỡng 4,5 cho chữ thường trên các nền phẳng này; không nên báo lỗi chỉ vì tên token là “faint”. `night-400` không đủ cho chữ thường ở mọi cặp trên, và glass top trên night-800 còn dưới 3 cho chữ lớn. Kiểm thêm alpha của chữ và mọi lớp phủ tại điểm dùng.

## Những điểm đã kiểm tra và chưa thấy sai trong phạm vi rà

- Tìm các cụm “phù hợp với bạn”, “hợp nhất”, “bạn nên” trong TS/TSX của web và UI không thấy kết quả tại lần rà; không coi chữ trong tài liệu giải thích luật là UI vi phạm.
- QuizResult và Profile lấy tên trục từ `profile.RIASEC_INFO[axis].name`; không thấy render mã interestCode cho người chơi ở các màn này. Không thấy phần trăm fit người–nghề. Phần trăm môi trường làm việc, ngân sách thời gian và buff hoàng đạo có nghĩa khác, không đánh đồng với fit.
- Hoàng đạo hiện dùng cho biểu tượng/buff/mô tả; chưa thấy đường từ zodiac sang lý do gợi ý nghề trong UI được rà. Chưa chứng minh toàn bộ pipeline gợi ý bằng kiểm định thực nghiệm.
- BR-06: landing và summary có lời riêng tư, không thấy nút chia sẻ/xuất kết quả cá nhân trong các màn feature được rà. Đây không thay thế data-flow audit backend.
- OccupationPage để “Mặt khó” ở panel mở; QuizResult Suggestion có loading/error/empty riêng cho phần này. Chưa kiểm nội dung chân thực của toàn bộ 221 nghề.
- Feedback, rating, settings, quiz, profile và onboarding phần lớn đã có loading/error/pending thích hợp; các ngoại lệ cụ thể đã nêu. ReflectPage chuyển sang summary nếu query thiếu dữ liệu/lỗi, nên lỗi được summary xử lý nhưng ngữ cảnh reflection bị bỏ qua; nên có retry riêng trước redirect.
- Galaxy có chế độ danh sách với Link, lọc nghề và nút đổi chế độ truy cập bằng bàn phím. SVG role application chưa cho chọn từng node bằng bàn phím, nhưng không kết luận mọi hành động bị chặn vì đã có danh sách thay thế. Cần xác nhận danh sách cho phép tới cùng chức năng.
- LikeScale có radiogroup, aria-checked, roving tabindex và phím mũi tên/Home/End; Dialog dùng native showModal/close; Menu có phím điều hướng và trả focus. Chưa kiểm trap/restore focus native trên browser thật.
- 360 px: AppShell chừa pb-24 cho nav cao 64px; safe area được cộng vào nav nhưng padding content không tính trực tiếp safe area. 768 px: chuyển nav desktop và phần lớn grid theo breakpoint phù hợp. Các hàng tab/chip/lộ trình có overflow-x riêng. Cần thử safe area lớn, landscape và phóng chữ; không tuyên bố đã không tràn ngang.
- Màu vùng ở Galaxy/Occupation/Quiz dùng `regionColor`; chưa thấy mapping vùng tự tạo mâu thuẫn. Nhận xét hành vi và “tự kể lúc này” trong QuizResult có giới hạn rõ; văn bản động từ API/model vẫn cần validation nội dung.

## Kiểm tra đã chạy

- `pnpm exec eslint apps/web/src packages/ui/src --no-cache`: exit 0, **0 lỗi, 17 cảnh báo** non-null assertion (chủ yếu demo và một chỗ ProfilePage). Không tự sửa.
- TypeScript thử `--incremental false`: bị TS6379 do composite; thử thêm `--composite false`: bị TS5069 do declarationMap/emitDeclarationOnly kế thừa. Đây là lỗi lựa chọn cờ kiểm tra, không phải lỗi source.
- `pnpm exec tsc --noEmit --composite false --incremental false --declarationMap false --emitDeclarationOnly false -p apps/web/tsconfig.app.json`: **exit 0**. Không phát sinh build hoặc cache.
- Tính contrast bằng Node, số liệu tại bảng trên. Đọc và đối chiếu code source, API contract/hooks, các trang tham chiếu landing/auth và tài liệu game design liên quan.
- Không chạy prettier `--write` trên source vì nhiệm vụ chỉ cho ghi báo cáo. Không build, không cài dependency, không chạy app/model/DB; không có kết quả browser hay vitest mới để báo pass. Không viết logic sản phẩm nên không thêm spec.

## Top 15 sửa ưu tiên

1. **J-01 · Cao:** sửa effect reveal để giữ đúng từng nhịp thoại.
2. **J-03 · Cao:** giữ câu trả lời/tài liệu tới khi gửi thành công, cho retry.
3. **J-04 · Cao:** mở lại đường gửi lựa chọn khi mutation lỗi.
4. **J-02 · Cao:** hiển thị và retry lỗi tải scene/transcript.
5. **J-05 · Cao:** biến intro thành bước có quản lý focus và nền inert.
6. **J-06 · Cao:** sửa màu label checkbox trên nền tối trong giấy.
7. **J-07 · Vừa:** watchdog chờ model, nhận paused qua polling và thông báo mất kết nối.
8. **J-14 · Vừa:** hiện mặt khó ngay trong PeekPanel trước CTA vào nghề.
9. **J-17 · Vừa:** disclosure thường trực đúng nguồn AI thật/AI giả và trạng thái chấm.
10. **J-08 · Vừa:** bổ sung loading/error/empty và lỗi lưu ghi chú.
11. **J-09 · Vừa:** bắt và hiển thị lỗi báo nội dung sai.
12. **J-10 · Vừa:** nối Tabs sổ tay với TabPanel/idBase.
13. **J-11, J-12 · Vừa:** làm skip link nhìn thấy khi focus và quản lý focus/title theo route.
14. **J-15, J-16 · Vừa:** thay chữ night-400 và bổ sung Field variant giấy có contrast đạt.
15. **J-18 · Vừa:** thử/sửa hộp thoại dài ở 360/768px, bàn phím ảo và chuỗi không ngắt.

## Đã xử lý (Claude, 16–17/11/2026)

| Mục         | Trạng thái                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| J-01        | Đã sửa: chỉ tự hiện một nhịp ở đầu mỗi đợt mới (mở ca, sau lời người chơi, sau một lượt gửi); các nhịp sau chờ bấm |
| J-02        | Đã sửa: lỗi mở ca hiện thông báo và nút "Thử lại", không còn loading vô hạn                                        |
| J-03        | Đã sửa: `send` trả `true/false`; ô trả lời và hộp soạn tài liệu chỉ xoá/đóng khi lượt được nhận                    |
| J-04        | Đã sửa: gửi lựa chọn (cả hết giờ) lỗi thì mở lại để chọn lần nữa, giữ `elapsedMs` đo lúc bấm                       |
| J-05        | Đã sửa: màn giới thiệu có `role="dialog"`, `aria-modal`, focus vào "Vào ca", nền `inert`                           |
| J-06, J-16  | Đã sửa: màu nhãn và bộ đếm trên giấy chỉ áp cho ô viết, ô đánh dấu giữ chữ sáng trên nền tối                       |
| J-07        | Một phần: chờ quá 8 giây thì hỏi lại cảnh (polling dự phòng); chưa phân biệt mất mạng và chờ model                 |
| J-08, J-09  | Đã sửa: ghi chú có tải/lỗi/trống, lỗi lưu; báo nội dung sai hiện lỗi và giữ nội dung                               |
| J-10        | Đã sửa: tab sổ tay nối với panel qua `idBase`                                                                      |
| J-11, J-12  | Đã sửa: skip link dùng `sr-only focus:not-sr-only`; đổi trang đưa focus về `main`                                  |
| J-13        | Đã sửa: bản đồ có h1 (ẩn với mắt)                                                                                  |
| J-14        | Đã sửa: thẻ xem nhanh hiện mặt khó đầu tiên của nghề                                                               |
| J-15        | Đã sửa: placeholder dùng `night-300`                                                                               |
| J-17        | Đã sửa: HUD màn chơi có nhãn thường trực "Lời nhân vật do AI dẫn dắt" hoặc "AI giả (bản xem thử)"                  |
| J-18        | Đã sửa: chữ dài tự xuống dòng, hộp thoại giới hạn chiều cao và cuộn được                                           |
| J-19 – J-24 | Chưa xử lý, mức thấp                                                                                               |

## Vòng chụp màn hình (17/11/2026)

Ba worker Codex chụp lại toàn bộ luồng ở chế độ demo: explorer desktop 1440×900 (62 ảnh), explorer mobile 390×844 (69 ảnh, kèm đi trọn ca mẫu tới tổng kết), staff 1440×900, 768×1024 và 390×844 (29 ảnh, API giả theo hợp đồng). Không có lỗi console, lỗi trang hay request HTTP ≥ 400. Ảnh và báo cáo nằm ngoài repo (thư mục tạm của phiên), không commit.

| Phát hiện                                                            | Xử lý                                                                                                         |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Nhãn hành tinh đè nhau khi phóng gần cụm Công nghệ thông tin         | Chọn nhãn theo ưu tiên (đang chọn, gợi ý, có màn chơi) và bỏ nhãn chạm nhãn đã đặt; tên nghề vẫn có ở tooltip |
| Môi trường làm việc hiện "4000%"                                     | Dữ liệu ghi tỷ trọng 0–100, bỏ phép nhân 100                                                                  |
| Số năm kinh nghiệm hiện trần ("0", "0-1")                            | `formatYears`: "Chưa cần kinh nghiệm", "0–1 năm kinh nghiệm", "Từ 15 năm kinh nghiệm"                         |
| Cấp không yêu cầu kỹ năng mềm vẫn vẽ biểu đồ radar rỗng              | Chỉ vẽ khi cấp có yêu cầu                                                                                     |
| Đảo chưa có màn chính ghi "0/0 màn chính"                            | Ghi "Cấp này chưa có màn chính"                                                                               |
| Tab Hồ sơ tràn ngang 461 px trên điện thoại                          | Cột lưới chứa radar có `min-w-0`                                                                              |
| Nút "Tạo tài khoản" ở header landing bị cắt trên điện thoại          | `cn` không trộn class nên `hidden` thua `inline-flex`; đổi sang `max-sm:hidden`                               |
| Sáu tab Sổ tay bị cắt ở cột phải và trên điện thoại                  | Đổi sang tab dạng viên, tự xuống dòng                                                                         |
| Chân dung người nói bị hộp thoại kính làm mờ                         | Đưa chân dung lên trên hộp thoại                                                                              |
| Ca xem thử ghi "không tính vào tiến độ" nhưng hồ sơ kỹ năng vẫn tăng | Ca không gắn cấp chỉ tính điểm cho bản tổng kết, không cộng vào hồ sơ; trang tổng kết ghi rõ                  |
| Câu kết quả mẫu "0 dữ kiện cần thiết chưa được tìm thấy"             | Viết lại theo hai trường hợp còn thiếu / đã đủ                                                                |
| Staff: nút "Lưu nghề" của hộp tạo nghề nằm dưới mép cuộn             | Footer của `Dialog`/`Sheet` dính đáy; nút lưu chuyển vào footer                                               |
| Staff: danh sách nhóm nghề chiếm cả màn đầu ở tablet                 | Dưới `lg` giới hạn cao 192 px, cuộn trong khung                                                               |
| Staff: `createRoot` gọi lại, document rộng 1500 px                   | Do dev server giữ trạng thái HMR cũ; khởi động lại thì hết, chụp lại xác nhận 0 lỗi                           |

Sau khi sửa, hai worker chụp lại các màn liên quan: mobile 7/7 mục đạt, staff 4/4 ảnh đạt, mọi ảnh không tràn ngang.
