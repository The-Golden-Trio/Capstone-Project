# Component diagram (báo cáo §5.3.1)

Hình component gốc không có file nguồn trong repo (chỉ có PNG), nên phần **Local LLM** được vẽ chồng lên PNG gốc.

| File | Là gì |
|---|---|
| `base.png` | Hình component gốc, chưa có Local LLM |
| `overlay.html` | Ảnh gốc cộng hộp «component» **Local LLM** (viền đứt nét, ý tưởng, không hiện thực), đường nối từ Model gateway và dòng chú giải |
| `jobquest_component_diagram.png` | Kết quả, chép sang `reports/master/figures/` |

Local LLM là chế độ dự phòng khi mọi nhà cung cấp AI gặp sự cố; giữ dữ liệu trong Việt Nam. Ngoài phạm vi ĐACN và ĐATN: chỉ vẽ để ghi ý tưởng (D-98).

## Dựng lại (macOS, Google Chrome)

```sh
cd docs/project-hub/assets/component
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --window-size=2500,2352 --allow-file-access-from-files \
  --screenshot="$PWD/jobquest_component_diagram.png" "file://$PWD/overlay.html"
cp jobquest_component_diagram.png ../../../../reports/master/figures/
```

Có file nguồn editable (draw.io hoặc công cụ khác) thì thêm hộp Local LLM trực tiếp vào đó và bỏ thư mục này.
