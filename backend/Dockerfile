FROM node:20-bookworm
WORKDIR /app

# Install python, magic, yara, and pip for the scanners and AI pipeline
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-magic libmagic1 docker.io yara \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies for the scanner/ai pipeline
COPY ./scanner/requirements.txt /tmp/requirements.txt
RUN pip3 install --break-system-packages -r /tmp/requirements.txt ollama

# Install Node dependencies
COPY ./backend/package.json ./backend/package-lock.json* ./backend/
RUN cd backend && npm install

# Copy all necessary directories into the container
COPY ./backend ./backend
COPY ./scanner ./scanner
COPY ./ai ./ai
COPY ./data ./data

WORKDIR /app/backend

EXPOSE 4000
CMD ["node", "server.js"]
