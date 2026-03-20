# combine_frontend.py
"""
Combine all frontend source files into a single text file.

The script walks the `frontend-code-mentor` directory (relative to the project root),
collects files with typical frontend extensions, and writes their contents to
`combined_frontend.txt`.

It does **not** perform any git operations, ensuring the repository state
remains unchanged.
"""

import os
from pathlib import Path

# Directory containing frontend files (adjust if your project structure changes)
FRONTEND_DIR = Path(__file__).parent / "frontend-code-mentor"

# Output file (created next to this script)
OUTPUT_FILE = Path(__file__).parent / "combined_frontend.txt"

# File extensions considered part of the frontend codebase
FRONTEND_EXTENSIONS = {
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".html",
    ".css",
    ".scss",
    ".json",
    ".md",
    ".png",
    ".jpg",
    ".svg",
    # Add more extensions if needed
}

def is_frontend_file(path: Path) -> bool:
    """Return True if the file has a frontend‑related extension."""
    return path.suffix.lower() in FRONTEND_EXTENSIONS and path.is_file()

def collect_frontend_files(root: Path) -> list[Path]:
    """Recursively collect all frontend files under *root*."""
    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        # Exclude common generated or third‑party directories
        dirnames[:] = [d for d in dirnames if d not in {"node_modules", ".git", ".github", ".vscode", ".idea", "dist", "build", "__pycache__"}]
        for fname in filenames:
            fpath = Path(dirpath) / fname
            if is_frontend_file(fpath):
                files.append(fpath)
    return files

def combine_files(file_list: list[Path], output_path: Path) -> None:
    """Write the contents of *file_list* to *output_path*.

    Each file is separated by a clear header so the combined file remains
    readable.
    """
    with output_path.open("w", encoding="utf-8") as out_f:
        for f in file_list:
            out_f.write(f"--- Begin {f.relative_to(FRONTEND_DIR)} ---\n")
            try:
                content = f.read_text(encoding="utf-8")
                out_f.write(content)
            except UnicodeDecodeError:
                # Binary assets (e.g., images) – note their presence.
                out_f.write("[binary content omitted]\n")
            out_f.write(f"\n--- End {f.relative_to(FRONTEND_DIR)} ---\n\n")

def main():
    if not FRONTEND_DIR.exists():
        raise FileNotFoundError(f"Frontend directory not found: {FRONTEND_DIR}")

    files = collect_frontend_files(FRONTEND_DIR)
    print(f"Found {len(files)} frontend files. Combining into {OUTPUT_FILE}…")
    combine_files(files, OUTPUT_FILE)
    print("Done.")

if __name__ == "__main__":
    main()
