# Free GST Billing - is the Node.js on this machine new enough? (POSIX sh)
#
# Sourced by install-unix.sh, start-unix.sh and update-unix.sh:
#   . "$SYSTEM_DIR/check-node.sh"; node_ok || exit 1
#
# v1.10.81 (#109) - only "is there a node" was checked. An old one (Node 6,
# npm 3) broke the install, and the server could not start on it. Installing
# Node.js is left to the user here: the official builds do not run on every
# NAS (Alpine uses musl), and the right package manager differs per system.
# So: check, and say exactly what to run.

MIN_NODE_MAJOR=18   # package.json "engines"
MIN_NPM_MAJOR=7     # first npm that understands --omit=dev

_major() { printf '%s' "$1" | sed 's/^v//' | cut -d. -f1 | tr -cd '0-9'; }

_node_help() {
  printf '  %s\n' "$1" \
    "Free GST Billing needs Node.js $MIN_NODE_MAJOR or newer, with npm $MIN_NPM_MAJOR or newer." \
    'Install or update it, then open the app again:'
  if [ "$(uname -s 2>/dev/null)" = Darwin ]; then
    printf '    %s\n' 'Homebrew:      brew install node@20' \
      'Official pkg:  https://nodejs.org/en/download'
  else
    printf '    %s\n' 'Debian/Ubuntu: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install nodejs' \
      'Fedora:        sudo dnf install nodejs npm' \
      'Arch:          sudo pacman -S nodejs npm' \
      'Alpine / NAS:  sudo apk add nodejs npm' \
      'Any system:    https://github.com/nvm-sh/nvm  (nvm install 20)'
  fi
}

node_ok() {
  if ! command -v node >/dev/null 2>&1; then _node_help 'Node.js is not installed.'; return 1; fi
  nv=$(node -v 2>/dev/null); nm=$(_major "$nv")
  if [ -z "$nm" ] || [ "$nm" -lt "$MIN_NODE_MAJOR" ]; then _node_help "Node.js ${nv:-?} on this machine is too old."; return 1; fi
  if ! command -v npm >/dev/null 2>&1; then _node_help 'npm (which comes with Node.js) is missing.'; return 1; fi
  pv=$(npm -v 2>/dev/null); pm=$(_major "$pv")
  if [ -z "$pm" ] || [ "$pm" -lt "$MIN_NPM_MAJOR" ]; then _node_help "npm ${pv:-?} on this machine is too old."; return 1; fi
  return 0
}

# Before npm install: can the registry be reached? Says why not.
registry_ok() {
  if command -v curl >/dev/null 2>&1; then
    curl -fsSI --max-time 15 https://registry.npmjs.org/ >/dev/null 2>&1 && return 0
  elif command -v wget >/dev/null 2>&1; then
    wget -q --spider -T 15 https://registry.npmjs.org/ >/dev/null 2>&1 && return 0
  else
    return 0   # cannot tell: let npm try
  fi
  printf '  %s\n' 'The app cannot reach the internet to download its packages.' \
    'Check that this machine is online; a proxy or firewall may block registry.npmjs.org.'
  return 1
}
