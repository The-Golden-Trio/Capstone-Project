"""Prepare a small, repeatable cohort from local Nemotron Vietnam Parquet shards.

Requires pyarrow in the Python environment used for data preparation.
The output is a starting point for human review of the occupation and skills.
Set familiarity and goals for the planned JobQuest scenario before a live study.
"""

import argparse
import hashlib
import json
from pathlib import Path
import re
from uuid import UUID


SOURCE = "https://huggingface.co/datasets/nvidia/Nemotron-Personas-Vietnam"
COLUMNS = ("uuid", "occupation", "skills_and_expertise_list")


def profile(row):
    try:
        source_id = str(UUID(row["uuid"]))
        skills = json.loads(row["skills_and_expertise_list"])
    except (TypeError, ValueError, AttributeError):
        return None

    occupation = row["occupation"]
    if not isinstance(occupation, str) or not isinstance(skills, list):
        return None
    occupation = occupation.strip()
    skills = [
        item.strip()
        for item in skills
        if isinstance(item, str) and 1 <= len(item.strip()) <= 120
    ][:6]
    if not 1 <= len(occupation) <= 100 or not skills:
        return None

    return {
        "id": f"vn-{source_id}",
        "sourceUuid": source_id,
        "occupation": occupation,
        "skills": skills,
        "goal": "Tìm hiểu cách xử lý công việc trong ca được giao.",
        "familiarity": "mới",
    }


def sample(rows, seed, count, occupations):
    candidates = {}
    ranks = {}
    worst = None
    skipped = 0
    for row in rows:
        if occupations and row["occupation"] not in occupations:
            continue
        candidate = profile(row)
        if not candidate:
            skipped += 1
            continue
        source_id = candidate["sourceUuid"]
        if source_id in candidates:
            if candidate != candidates[source_id]:
                raise ValueError(f"UUID được chọn có nội dung khác nhau: {source_id}")
            continue
        rank = hashlib.sha256(f"{seed}/{source_id}".encode()).digest()
        if worst is not None and (rank, source_id) >= worst:
            continue
        candidates[source_id] = candidate
        ranks[source_id] = rank
        if len(candidates) > count:
            del candidates[worst[1]]
            del ranks[worst[1]]
        if len(candidates) == count:
            worst = max((value, key) for key, value in ranks.items())

    return [candidates[key] for key in sorted(ranks, key=lambda key: (ranks[key], key))], skipped


def parquet_rows(paths):
    from pyarrow.parquet import ParquetFile

    for path in paths:
        parquet = ParquetFile(path)
        if not set(COLUMNS).issubset(parquet.schema_arrow.names):
            raise ValueError(f"Thiếu cột persona bắt buộc trong {path}")
        for batch in parquet.iter_batches(columns=list(COLUMNS), batch_size=4096):
            yield from batch.to_pylist()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("shards", nargs="+", type=Path)
    parser.add_argument("--revision", required=True)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--seed", default="jobquest-persona-v1")
    parser.add_argument("--count", type=int, default=6)
    parser.add_argument("--occupation", action="append", default=[])
    args = parser.parse_args()
    if not re.fullmatch(r"[a-f0-9]{40}", args.revision) or not 1 <= args.count <= 100:
        parser.error("Cần revision là Git SHA 40 ký tự và count từ 1 đến 100.")
    paths = sorted(set(args.shards))
    if not all(path.is_file() for path in paths):
        parser.error("Các shard phải là tệp Parquet đã tải về máy.")
    try:
        profiles, skipped = sample(parquet_rows(paths), args.seed, args.count, set(args.occupation))
    except (ImportError, ValueError, OSError) as error:
        parser.error(str(error))
    if len(profiles) < args.count:
        parser.error(f"Chỉ tìm được {len(profiles)} hồ sơ hợp lệ. Có {skipped} bản ghi lỗi.")
    output = {
        "source": {
            "url": SOURCE,
            "revision": args.revision,
            "attribution": "NVIDIA và các tác giả Nemotron-Personas-Vietnam, https://creativecommons.org/licenses/by/4.0/",
            "license": "CC BY 4.0",
            "selection": (
                f"Mẫu theo SHA-256 từ {', '.join(path.name for path in paths)}, "
                f"seed={args.seed}, lọc nghề={args.occupation!r}, bỏ bản ghi lỗi={skipped}. "
                "Chỉ giữ nghề và tối đa sáu kỹ năng. Mục tiêu và mức quen nghề là mặc định của JobQuest."
            ),
        },
        "profiles": profiles,
    }
    with args.out.open("x", encoding="utf-8", newline="\n") as dest:
        json.dump(output, dest, ensure_ascii=False, indent=2)
        dest.write("\n")


if __name__ == "__main__":
    main()
