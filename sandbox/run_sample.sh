#!/bin/bash
# sandbox/run_sample.sh
SAMPLE_PATH="$1"
TELEMETRY_PATH="$2"
METADATA_PATH="$3"

if [ -z "$SAMPLE_PATH" ] || [ -z "$TELEMETRY_PATH" ] || [ -z "$METADATA_PATH" ]; then
    echo "Error: Missing arguments"
    exit 1
fi

if [ ! -f "$SAMPLE_PATH" ]; then
    echo "Error: File not found: $SAMPLE_PATH"
    exit 1
fi

echo "Running sample: $SAMPLE_PATH"

# Detect file type using both extension and magic bytes
MIME=$(file --mime-type -b "$SAMPLE_PATH" 2>/dev/null || echo "unknown")
EXT="${SAMPLE_PATH##*.}"

echo "Detected type: $MIME (extension: $EXT)"

# Execute based on type
case "$MIME" in
    application/x-shellscript|text/x-shellscript|text/plain)
        echo "Executing as shell script..."
        chmod +x "$SAMPLE_PATH"
        strace -f -e trace=network,file,process -o "$TELEMETRY_PATH" bash "$SAMPLE_PATH"
        ;;
    application/x-executable|application/x-elf)
        echo "Executing as ELF binary..."
        chmod +x "$SAMPLE_PATH"
        strace -f -e trace=network,file,process -o "$TELEMETRY_PATH" "$SAMPLE_PATH"
        ;;
    application/x-python|text/x-python)
        echo "Executing as Python script..."
        strace -f -e trace=network,file,process -o "$TELEMETRY_PATH" python3 "$SAMPLE_PATH"
        ;;
    image/*|video/*|application/pdf|audio/*)
        echo "Extracting metadata for analysis..."
        exiftool "$SAMPLE_PATH" > "$METADATA_PATH"
        cat "$METADATA_PATH"
        ;;
    text/*)
        # Fallback: try as shell script for .sh extension
        if [ "$EXT" = "sh" ]; then
            echo "Executing .sh by extension..."
            chmod +x "$SAMPLE_PATH"
            strace -f -e trace=network,file,process -o "$TELEMETRY_PATH" bash "$SAMPLE_PATH"
        else
            echo "Unsupported text type: $MIME. Extracting strings..."
            strings "$SAMPLE_PATH" | head -n 20 > "$METADATA_PATH"
            cat "$METADATA_PATH"
        fi
        ;;
    *)
        echo "Unsupported file type: $MIME. Extracting metadata..."
        exiftool "$SAMPLE_PATH" > "$METADATA_PATH"
        cat "$METADATA_PATH"
        ;;
esac
