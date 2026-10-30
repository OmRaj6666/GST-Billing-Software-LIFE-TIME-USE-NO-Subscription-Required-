#!/usr/bin/env bash
# Free GST Billing — Unix (macOS + Linux) installer.
#
# Assumes Node.js is already installed (parent launcher checks and
# instructs the user if not — installing Node on Unix is too
# distro-specific to automate safely from a script).
set -e
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SYSTEM_DIR="$SCRIPT_DIR"

# v1.10.81 (#109) - Node.js new enough, and the registry reachable, first.
if [ -f "$SYSTEM_DIR/check-node.sh" ]; then
  . "$SYSTEM_DIR/check-node.sh"
  node_ok || exit 1
  registry_ok || exit 1
fi

echo ""
echo "  Installing app dependencies (npm install)…"
cd "$SYSTEM_DIR"
if ! npm install --omit=dev --no-audit --no-fund --loglevel=error; then
  echo ""
  echo "  The app packages did not install. Check the internet connection and the"
  echo "  free disk space, then run the launcher again - it carries on where it stopped."
  exit 1
fi

echo ""
echo "  ✅ Install complete."
echo "     The launcher will now start the server and open your browser."
