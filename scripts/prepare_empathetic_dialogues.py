#!/usr/bin/env python3
"""Download and convert EmpatheticDialogues into chat fine-tuning JSONL."""

from __future__ import annotations

import csv
import gzip
import io
import json
import tempfile
import urllib.request
from itertools import groupby
from pathlib import Path
from tarfile import open as open_tar


DATASET_URL = (
    "https://dl.fbaipublicfiles.com/parlai/empatheticdialogues/"
    "empatheticdialogues.tar.gz"
)
DATASET_ID = "facebook/empathetic_dialogues"
SPLITS = {
    "train": "empatheticdialogues/train.csv",
    "validation": "empatheticdialogues/valid.csv",
    "test": "empatheticdialogues/test.csv",
}
SYSTEM_PROMPT = (
    "You are a supportive, empathetic conversation partner. Listen and respond "
    "with warmth without pretending to be a clinician. Do not diagnose, prescribe, "
    "or give medical advice. If someone may be in immediate danger, encourage "
    "them to contact local emergency services or a trusted person."
)
OUTPUT_DIRECTORY = (
    Path(__file__).resolve().parents[1] / "datasets" / "empathetic_dialogues"
)


def convert_split(archive: Path, source_path: str, split: str, output_dir: Path) -> int:
    with open_tar(archive, mode="r:gz") as tar:
        source_file = tar.extractfile(source_path)
        if source_file is None:
            raise RuntimeError(f"Dataset archive is missing {source_path}.")

        text_file = io.TextIOWrapper(source_file, encoding="utf-8", newline="")
        rows = csv.DictReader(text_file)
        output_path = output_dir / f"{split}.jsonl.gz"
        count = 0

        with gzip.open(output_path, mode="wt", encoding="utf-8", newline="\n") as output:
            for conversation_id, grouped_rows in groupby(
                rows, key=lambda row: row["conv_id"]
            ):
                conversation = list(grouped_rows)
                if not conversation:
                    continue

                messages = [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": conversation[0]["prompt"]},
                ]

                for row in conversation:
                    if row["speaker_idx"] == "0":
                        messages.append({"role": "user", "content": row["utterance"]})
                    else:
                        messages.append({"role": "assistant", "content": row["utterance"]})
                        record = {
                            "messages": messages.copy(),
                            "dataset": DATASET_ID,
                            "split": split,
                            "conversation_id": conversation_id,
                        }
                        output.write(json.dumps(record, ensure_ascii=False) + "\n")
                        count += 1

        if count == 0:
            raise RuntimeError(f"No assistant turns were found in the {split} split.")
        return count


def main() -> None:
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="kai-empathetic-dialogues-") as temp_dir:
        archive = Path(temp_dir) / "empatheticdialogues.tar.gz"
        request = urllib.request.Request(
            DATASET_URL,
            headers={"User-Agent": "KAI-dataset-preparation/1.0"},
        )
        with urllib.request.urlopen(request, timeout=60) as response:
            with archive.open("wb") as downloaded:
                while chunk := response.read(1024 * 1024):
                    downloaded.write(chunk)

        for split, source_path in SPLITS.items():
            count = convert_split(archive, source_path, split, OUTPUT_DIRECTORY)
            print(f"{split}: {count:,} examples -> {OUTPUT_DIRECTORY / f'{split}.jsonl.gz'}")


if __name__ == "__main__":
    main()
