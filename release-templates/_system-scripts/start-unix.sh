#!/usr/bin/env bash
# Free GST Billing — Unix start-server + open-browser.
set -e
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SYSTEM_DIR="$SCRIPT_DIR"
ROOT_DIR="$( dirname "$SYSTEM_DIR" )"

# v1.10.75 - updates only ever added files, so installs from before v1.10.69
# kept launchers under their old names, which look like a second copy of the
# app. Remove them by exact name, only once the renamed launcher is present.
remove_if_replaced() { # old new
  if [ -f "$ROOT_DIR/$1" ] && [ -f "$ROOT_DIR/$2" ]; then rm -f "$ROOT_DIR/$1" 2>/dev/null || true; fi
}
remove_if_replaced "Free GST Billing.command" "Free GST Billing - MAC.command"
remove_if_replaced "Free GST Billing.sh"      "Free GST Billing - LINUX.sh"
remove_if_replaced "Free GST Billing.hta"     "Free GST Billing - WINDOWS.hta"

# Resolve port from persisted file if present.
PORT=47371
if [ -f "$SYSTEM_DIR/data/port.txt" ]; then
  P=$(tr -d '[:space:]' < "$SYSTEM_DIR/data/port.txt")
  [[ "$P" =~ ^[0-9]+$ ]] && PORT="$P"
fi

# Is our server already up?
if curl -fsS --max-time 1 "http://localhost:$PORT/api/profile" >/dev/null 2>&1; then
  echo "  Server already running on port $PORT — opening browser…"
else
  # v1.10.81 (#109) - an old Node.js was started here and never answered.
  if [ -f "$SYSTEM_DIR/check-node.sh" ]; then
    . "$SYSTEM_DIR/check-node.sh"
    node_ok || exit 1
  fi
  echo "  Starting server on port $PORT…"
  # Detach so the script can exit while node keeps running.
  cd "$SYSTEM_DIR"
  nohup node server.js >/dev/null 2>&1 &
  # Poll for readiness. 15s was too short for a first start after an install
  # (the Windows launcher waits 90s for the same reason).
  deadline=$(($(date +%s) + 90))
  up=0
  while [ $(date +%s) -lt $deadline ]; do
    sleep 0.4
    if curl -fsS --max-time 1 "http://localhost:$PORT/api/profile" >/dev/null 2>&1; then
      up=1
      break
    fi
  done
  if [ "$up" != 1 ]; then
    echo "  The server has not answered in 90 seconds. Try http://localhost:$PORT/ in your"
    echo "  browser in a minute; if it still does not open, run the launcher again."
  fi
fi

# Open browser — macOS uses `open`, Linux uses `xdg-open`.
if command -v open >/dev/null 2>&1; then open "http://localhost:$PORT/"
elif command -v xdg-open >/dev/null 2>&1; then xdg-open "http://localhost:$PORT/"
else echo "  Open http://localhost:$PORT/ in your browser."
fi

echo "  ✅ Server running. This window can be closed."
