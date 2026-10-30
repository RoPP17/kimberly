"""
Quick studio utility to enhance and add new photos of Kimberly & Roberto.
Usage:
  python scripts/add_photo.py path/to/new_photo.jpg memory-04
"""
import sys
from process_assets import enhance_photograph

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python scripts/add_photo.py <image_path> <slug>")
        sys.exit(1)
    enhance_photograph(sys.argv[1], sys.argv[2], 1600)
