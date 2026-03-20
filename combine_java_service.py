# combine_java_service.py
"""
Combine all Java source files from the backend (Spring‑Boot) project into a single
text file.  Only the files you authored are kept – the script skips typical build
folders (`target`, `out`, `.mvn`) and version‑control directories.
"""

import os
from pathlib import Path

JAVA_ROOT   = Path(__file__).parent / "backend"
OUTPUT_FILE = Path(__file__).parent / "combined_java_service.txt"

JAVA_EXTENSIONS = {".java", ".xml", ".properties", ".yml", ".yaml", ".gradle", ".kt"}

def is_java_file(p: Path) -> bool:
    return p.suffix.lower() in JAVA_EXTENSIONS and p.is_file()

def collect_files(root: Path) -> list[Path]:
    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        # exclude compiled / build artefacts and VCS folders
        dirnames[:] = [d for d in dirnames
                       if d not in {"target", "out", ".git", ".github", ".vscode",
                                   ".idea", ".mvn", "build", "dist"}]
        for f in filenames:
            fpath = Path(dirpath) / f
            if is_java_file(fpath):
                files.append(fpath)
    return files

def combine(files: list[Path], out: Path) -> None:
    with out.open("w", encoding="utf-8") as fp:
        for f in files:
            fp.write(f"--- Begin {f.relative_to(JAVA_ROOT)} ---\n")
            try:
                fp.write(f.read_text(encoding="utf-8"))
            except UnicodeDecodeError:
                fp.write("[binary content omitted]\n")
            fp.write(f"\n--- End {f.relative_to(JAVA_ROOT)} ---\n\n")

def main() -> None:
    if not JAVA_ROOT.exists():
        raise FileNotFoundError(f"Directory not found: {JAVA_ROOT}")
    files = collect_files(JAVA_ROOT)
    print(f"Found {len(files)} Java‑related files → {OUTPUT_FILE}")
    combine(files, OUTPUT_FILE)

if __name__ == "__main__":
    main()
