from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

try:
    from ai.ingestion.common import DEFAULT_DATASET_DIR, load_json_source, save_training_batch, stringify_fields
except ModuleNotFoundError:
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
    from ai.ingestion.common import DEFAULT_DATASET_DIR, load_json_source, save_training_batch, stringify_fields


DEFAULT_K_INDEX_URL = "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json"
DEFAULT_XRAY_URL = "https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json"


def _latest_record(payload: Any) -> dict[str, Any]:
    if isinstance(payload, list) and payload:
        latest = payload[-1]
        if isinstance(latest, dict):
            return latest
    if isinstance(payload, dict):
        return payload
    return {}


def _build_output(k_index: float | None, radiation_flux: float | None, region: str) -> str:
    if (k_index or 0) >= 5:
        return f"Geomagnetic conditions are elevated for {region}. Increase monitoring, verify navigation resilience, and defer sensitive operations if disruption persists."
    if (radiation_flux or 0) >= 1e-5:
        return f"Solar radiation is elevated for {region}. Keep edge assets in normal operation but raise alerting thresholds for communication or positioning anomalies."
    return f"Space-weather conditions are stable for {region}. Continue normal operations with routine monitoring."


def build_training_records(
    *,
    k_index_payload: Any,
    xray_payload: Any,
    region: str,
) -> list[dict[str, Any]]:
    latest_k_index = _latest_record(k_index_payload)
    latest_xray = _latest_record(xray_payload)
    k_index = latest_k_index.get("k_index") or latest_k_index.get("kp") or latest_k_index.get("kp_index")
    radiation_flux = latest_xray.get("flux") or latest_xray.get("observed_flux") or latest_xray.get("current_value")
    input_text = stringify_fields(
        {
            "Solar index": latest_xray.get("class") or latest_xray.get("energy") or "nominal",
            "Radiation": radiation_flux or "unknown",
            "Geomagnetic": k_index or "unknown",
            "Region": region,
            "Observed at": latest_k_index.get("time_tag") or latest_xray.get("time_tag") or "latest",
        }
    )
    return [
        {
            "instruction": "Analyze space weather impact.",
            "input": input_text,
            "output": _build_output(float(k_index) if k_index is not None else None, float(radiation_flux) if radiation_flux is not None else None, region),
            "metadata": {
                "domain": "space-weather",
                "source": "space-weather-ingestor",
                "region": region,
                "reviewed": False,
            },
        }
    ]


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Ingest space-weather data into SmartCito training batches.")
    parser.add_argument("--region", default="global")
    parser.add_argument("--k-index-url", default=DEFAULT_K_INDEX_URL)
    parser.add_argument("--xray-url", default=DEFAULT_XRAY_URL)
    parser.add_argument("--k-index-input-file", default=None)
    parser.add_argument("--xray-input-file", default=None)
    parser.add_argument("--output-dir", default=str(DEFAULT_DATASET_DIR))
    return parser


def main() -> int:
    args = build_arg_parser().parse_args()
    k_index_payload = load_json_source(input_file=args.k_index_input_file, api_url=None if args.k_index_input_file else args.k_index_url)
    xray_payload = load_json_source(input_file=args.xray_input_file, api_url=None if args.xray_input_file else args.xray_url)
    records = build_training_records(k_index_payload=k_index_payload, xray_payload=xray_payload, region=args.region)
    output_path = save_training_batch(records, source="space_weather", output_dir=args.output_dir)
    print(json.dumps({"output_path": str(output_path), "records": len(records)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
