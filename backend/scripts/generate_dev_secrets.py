"""Create development secrets without printing secret values."""

from __future__ import annotations

import argparse
import secrets
from pathlib import Path

SECRET_NAMES = ("JWT_SECRET", "JWT_QR_SECRET", "OTP_SECRET")


def generate_env(path: Path, overwrite: bool) -> None:
    """Create or update a development env file, preserving unrelated settings."""
    existing = path.read_text(encoding="utf-8").splitlines() if path.exists() else []
    values: dict[str, str] = {}
    for line in existing:
        if "=" in line and not line.lstrip().startswith("#"):
            name, value = line.split("=", 1)
            values[name.strip()] = value.strip()
    for name in SECRET_NAMES:
        if overwrite or len(values.get(name, "")) < 32:
            values[name] = secrets.token_urlsafe(48)
    present = {line.split("=", 1)[0].strip() for line in existing if "=" in line}
    output = [
        f"{name}={values[name]}" if line.startswith(f"{name}=") else line
        for line in existing
        for name in [line.split("=", 1)[0].strip() if "=" in line else ""]
    ]
    for name in SECRET_NAMES:
        if name not in present:
            output.append(f"{name}={values[name]}")
    path.write_text("\n".join(output).rstrip() + "\n", encoding="utf-8")


def main() -> None:
    """Parse options and create development secrets."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--env-file", type=Path, default=Path(".env"))
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    generate_env(args.env_file, args.overwrite)
    print("Development secrets are present with sufficient length.")


if __name__ == "__main__":
    main()
