#!/bin/bash

TAB_ID=$(curl -s http://localhost:9222/json | grep -o '"id":"[^"]*"' | head -1 | grep -o '[^"]*$')

if [ -z "$TAB_ID" ]; then
    echo "Error: Could not connect to Chromium. Is it running with --remote-debugging-port=9222?"
    exit 1
fi

curl -s -X POST "http://localhost:9222/devtools/page/$TAB_ID/runtime/evaluate" \
    -H "Content-Type: application/json" \
    -d '{"expression":"localStorage.removeItem(\"crumbs_leaderboard\");localStorage.removeItem(\"crumbs_oops_record\");"}' \
    > /dev/null

echo "Leaderboard cleared."
