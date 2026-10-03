import json

# Mức lương trung vị ước tính cho thị trường VN (VND/tháng)
ENTRY_WAGES = {
    "SWE_FRONTEND": {
        "<1 năm": 10000000,
        "1-2 năm": 16500000
    },
    "DATA_DE": {
        "<1 năm": 12000000,
        "1-2 năm": 18500000
    },
    "QA_MANUAL": {
        "<1 năm": 9000000
    }
}

def patch_entry_wages():
    # Đọc file đã có phúc lợi từ bước trước
    with open("dataset_22_roles_enriched_v2.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    # Quét qua các role và điền số nếu đang bị null
    for role in data.get("roles", []):
        code = role["role_code"]
        if code in ENTRY_WAGES:
            exp_list = role["compensation"]["itviec_2025_2026"]["by_experience"]
            for exp in exp_list:
                yoe = exp["yoe"]
                # Nếu mốc kinh nghiệm nằm trong danh sách cần vá và đang bị khuyết
                if yoe in ENTRY_WAGES[code] and exp.get("median") is None:
                    exp["median"] = ENTRY_WAGES[code][yoe]
                    exp["available"] = True
            
            # Cập nhật lại ghi chú để hiển thị trên giao diện
            role["compensation"]["itviec_2025_2026"]["gap_note"] = "Mốc entry-level được vá dựa trên ước tính thị trường chung (không lấy từ ITviec)."

    # Ghi ra file mới để nạp vào visualize.html
    with open("dataset_22_roles_enriched_v3.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("✅ Đã vá xong lương entry-level! File xuất ra: dataset_22_roles_enriched_v3.json")

if __name__ == "__main__":
    patch_entry_wages()