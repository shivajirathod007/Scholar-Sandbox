#!/bin/bash
SAMPLE_FILE=$1

if [ -z "$SAMPLE_FILE" ]; then
    echo "No sample provided"
    exit 1
fi

echo "Running sample: $SAMPLE_FILE"

# Make it executable if it's a linux binary
chmod +x "$SAMPLE_FILE" 2>/dev/null

# Detect type
FILE_TYPE=$(file "$SAMPLE_FILE")

if [[ "$FILE_TYPE" == *"PE32"* || "$FILE_TYPE" == *"MS-DOS"* ]]; then
    # Run in Wine
    wine "$SAMPLE_FILE"
elif [[ "$FILE_TYPE" == *"Python script"* ]]; then
    python3 "$SAMPLE_FILE"
elif [[ "$FILE_TYPE" == *"ELF"* ]]; then
    "$SAMPLE_FILE"
else
    # Try generic bash execution or just exit if we don't know
    bash "$SAMPLE_FILE" || echo "Unsupported file type"
fi
