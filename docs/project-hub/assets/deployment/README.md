# Deployment diagram (báo cáo §5.3.1)

Hình deployment theo ký hiệu UML:
- node, device và execution environment là hộp 3D có stereotype;
- artifact là hộp xanh lá có biểu tượng tài liệu;
- đường nối ghi giao thức;
- mũi tên đứt nét `«use»` là phụ thuộc giữa các artifact.

Nội dung khớp đoạn "Deployment" trong `reports/master/report.md`.

| File | Là gì |
|---|---|
| `build_deployment.py` | Nguồn duy nhất: sửa hình ở đây (toạ độ, chữ, màu) |
| `jobquest_deployment.svg` | Sinh ra từ script |
| `jobquest_deployment.png` | Chụp từ SVG, chép sang `reports/<ngày>_ch1-5/figures/` |

## Dựng lại (macOS, Google Chrome)

```sh
cd docs/project-hub/assets/deployment
python3 build_deployment.py
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --force-device-scale-factor=2 --window-size=1880,1620 \
  --screenshot="$PWD/jobquest_deployment.png" "file://$PWD/jobquest_deployment.svg"
cp jobquest_deployment.png ../../../../reports/master/figures/
```

Đổi kích thước canvas (`W, H` trong script) thì đổi luôn `--window-size` cho khớp. Trong `report.md`, hình được đặt trên trang xoay ngang (hậu tố `{landscape}`).
