"""Summarise k6 CSV output per endpoint, excluding the login requests made in setup().

Usage: python3 analyse.py <k6 csv> [<cpu csv>]
Prints JSON with overall and per-endpoint request counts, rates, latency percentiles
and error counts, and, if given, the API process CPU and memory during the run.
"""
import csv
import json
import sys
from collections import defaultdict


def pct(xs, p):
    xs = sorted(xs)
    if not xs:
        return None
    k = (len(xs) - 1) * p / 100
    f = int(k)
    c = min(f + 1, len(xs) - 1)
    return xs[f] + (xs[c] - xs[f]) * (k - f)


def stats(durs, errs, t0, t1):
    return {
        "n": len(durs),
        "rps": round(len(durs) / max(t1 - t0, 1), 2),
        "p50": round(pct(durs, 50), 1),
        "p95": round(pct(durs, 95), 1),
        "p99": round(pct(durs, 99), 1),
        "max": round(max(durs), 1),
        "errors": errs,
    }


def main(path, cpu_path=None):
    by = defaultdict(list)
    err = defaultdict(int)
    ts = []
    with open(path) as f:
        for row in csv.DictReader(f):
            if row["metric_name"] != "http_req_duration" or row["name"] == "setup":
                continue
            d = float(row["metric_value"])
            by[row["name"]].append(d)
            ts.append(int(row["timestamp"]))
            if not row["status"].startswith("2"):
                err[row["name"]] += 1
    t0, t1 = min(ts), max(ts)
    allv = [d for v in by.values() for d in v]
    out = {
        "window_s": t1 - t0,
        "overall": stats(allv, sum(err.values()), t0, t1),
        "endpoints": {k: stats(v, err[k], t0, t1) for k, v in sorted(by.items(), key=lambda kv: -len(kv[1]))},
    }
    if cpu_path:
        cpu, rss = [], []
        with open(cpu_path) as f:
            for line in f:
                parts = line.strip().split(",")
                if len(parts) == 3 and parts[1]:
                    cpu.append(float(parts[1]))
                    rss.append(int(parts[2]) / 1024)
        out["api_process"] = {
            "cpu_mean_pct": round(sum(cpu) / len(cpu), 1),
            "cpu_max_pct": round(max(cpu), 1),
            "rss_max_mb": round(max(rss)),
        }
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main(*sys.argv[1:])
