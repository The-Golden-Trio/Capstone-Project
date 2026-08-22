"""
Bản run_outlook.py chỉ dùng ITviec qua route slug cố định:
https://itviec.com/it-jobs/<slug>

Lý do:
- ITviec ?query= cho kết quả rộng/không ổn định để map taxonomy 78 roles.
- TopDev cần JS render nên parser requests + BeautifulSoup thường trả 0 sai lệch.
- LinkedIn public search hay chạm trần/ước lượng, không so sánh được với ITviec.

Chỉ những role có category/title slug ITviec tương đối chắc chắn mới được đo.
Các role còn lại để trống itviec_open_postings, không suy diễn thành 0.
"""

import csv
import re
import time

import requests
from bs4 import BeautifulSoup


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
}

ITVIEC_BASE_URL = "https://itviec.com/it-jobs"

# Slug thật lấy từ menu "Jobs by Expertise"/"Jobs by Title" và tag trên job card.
# Chỉ map role_code nào có category ITviec tương đối rõ, không ép các role còn lại.
ROLE_TO_ITVIEC_SLUG = {
    "SWE_BACKEND": "backend-developer",
    "SWE_FRONTEND": "frontend-developer",
    "SWE_FULLSTACK": "fullstack-developer",
    "SWE_MOBILE": "mobile-application-developer",
    "SWE_EMBEDDED": "embedded-engineer",
    "PROD_BA": "business-analyst",
    "PROD_PJM": "project-manager",
    "PROD_PO": "product-owner",
    "QA_MANUAL": "manual-tester",
    "QA_AUTO": "automation-tester",
    "CLOUD_DEVOPS": "devops-engineer",
    "DATA_DE": "data-engineer",
    "DATA_ML": "ai-machine-learning-engineer",
    "DATA_AI": "ai-machine-learning-engineer",
    "SEC_ENG": "security-engineer",
    "SWE_ARCH_SW": "software-technical-architect",
    "SWE_ARCH_SOL": "solution-architect",
    "DATA_AIARCH": "data-architect",
}

ROLE_NOTES = {
    "DATA_AI": "Dùng chung ITviec slug với DATA_ML; xem như proxy AI/ML chung.",
    "DATA_ML": "Dùng chung ITviec slug với DATA_AI; xem như proxy AI/ML chung.",
    "DATA_AIARCH": "ITviec slug là data-architect; chưa tách riêng AI Solution Architect.",
    "SWE_ARCH_SOL": "Slug solution-architect thấy trên ITviec; vẫn cần kiểm tay nếu dùng làm số chuẩn.",
}

CSV_FIELDS = [
    "role_code",
    "role_name",
    "itviec_slug_used",
    "itviec_open_postings",
    "topdev_open_postings",
    "linkedin_open_postings",
    "measured_at",
    "confidence",
    "note",
]


def extract_count(soup: BeautifulSoup) -> int:
    h1 = soup.find("h1")
    if not h1:
        return -1

    text = h1.get_text(" ", strip=True)
    match = re.match(r"^([\d,]+)\s", text)
    if not match:
        return -1

    return int(match.group(1).replace(",", ""))


def count_itviec_by_slug(session: requests.Session, slug: str) -> int:
    url = f"{ITVIEC_BASE_URL}/{slug}"
    try:
        response = session.get(url, headers=HEADERS, timeout=10)
        if response.status_code != 200:
            return -1

        soup = BeautifulSoup(response.text, "html.parser")
        return extract_count(soup)
    except requests.RequestException:
        return -1


def build_note(role_code: str, slug: str | None, count: int | None) -> str:
    if not slug:
        return "Không có category khớp trên ITviec - chưa đo, không suy diễn."

    base_note = "Khớp category cố định ITviec, số render server-side."
    if count is not None and count < 0:
        return "Có slug nhưng không parse được số từ ITviec - cần kiểm tay."

    role_note = ROLE_NOTES.get(role_code)
    return f"{base_note} {role_note}" if role_note else base_note


def build_confidence(slug: str | None, count: int | None) -> str:
    if not slug or count is None or count < 0:
        return "low"
    return "medium"


def run() -> None:
    results = []
    measured_at = time.strftime("%Y-%m-%d")

    with open("roles.csv", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    with requests.Session() as session:
        for row in rows:
            code = row["role_code"]
            slug = ROLE_TO_ITVIEC_SLUG.get(code)

            if slug:
                count = count_itviec_by_slug(session, slug)
                print(f"[{code}] slug={slug} -> {count}")
                time.sleep(1.5)
            else:
                count = None
                print(f"[{code}] không có category ITviec khớp - để trống")

            results.append(
                {
                    "role_code": code,
                    "role_name": row["role_name"],
                    "itviec_slug_used": slug or "",
                    "itviec_open_postings": count if count is not None and count >= 0 else "",
                    "topdev_open_postings": "",
                    "linkedin_open_postings": "",
                    "measured_at": measured_at,
                    "confidence": build_confidence(slug, count),
                    "note": build_note(code, slug, count),
                }
            )

    with open("outlook/posting_counts.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        writer.writeheader()
        writer.writerows(results)

    measured_count = sum(1 for row in results if row["itviec_slug_used"])
    print(
        f"Xong. Chỉ {measured_count}/{len(results)} role có số đo được; "
        "số còn lại để trống, không phải bằng 0."
    )


if __name__ == "__main__":
    run()
