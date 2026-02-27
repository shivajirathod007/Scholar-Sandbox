FROM ubuntu:22.04
RUN apt-get update && apt-get install -y \
    strace inotify-tools net-tools curl \
    python3 wine file wget bash exiftool \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /sandbox
COPY run_sample.sh /sandbox/run_sample.sh
RUN chmod +x /sandbox/run_sample.sh

# Environment will be strictly controlled dynamically at runtime via Docker API
