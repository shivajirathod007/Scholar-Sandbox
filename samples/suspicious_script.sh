#!/bin/bash
# This is a test script for Scholar Sandbox
# It will trigger static and dynamic analysis flags

# 1. Network Activity (Suspicious)
echo "Attempting to contact external server..."
curl -s http://example.com > /dev/null

# 2. Credential Access (Suspicious)
echo "Reading sensitive files..."
cat /etc/passwd | head -n 5

# 3. Persistence (Suspicious)
echo "Writing to autostart..."
echo "echo 'persistence'" > ~/.bashrc

echo "Test complete."
