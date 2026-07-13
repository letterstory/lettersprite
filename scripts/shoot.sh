#!/usr/bin/env bash
# Screenshot each theme's homepage (+ an article and a section) using sample
# data, so layouts are fully populated. Boots a dev server per theme, waits for
# readiness, captures with headless Chrome, then tears down.
set -u
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT=9137
OUT=".context/shots"
mkdir -p "$OUT"
ROOT="$(pwd)"

THEMES="${THEMES:-sleek classic minimal magazine midnight gazette dispatch metro review signal current ledger atelier noir chronicle}"
ART="posts/the-quiet-revolution-in-small-models"
SEC="sections/technology"

shoot () { # url outfile height
  "$CHROME" --headless --disable-gpu --hide-scrollbars --force-color-profile=srgb \
    --window-size="1440,${3:-3200}" --virtual-time-budget=9000 \
    --screenshot="$2" "$1" >/dev/null 2>&1
}

for T in $THEMES; do
  echo "── $T"
  # Force sample data (empty key) so magazine layouts are populated.
  env -u LETTERBRACE_API_KEY -u LETTERBRACE_COLLECTION_ID \
    THEME="$T" LETTERBRACE_API_KEY="" SITE_TITLE="The Provo Signal" \
    SITE_TAGLINE="Ideas, technology & culture" SITE_ESTABLISHED="2024" \
    SITE_TWITTER="provosignal" PORT=$PORT \
    node_modules/.bin/next dev -p $PORT >/tmp/dev-$T.log 2>&1 &
  DEV_PID=$!
  # Wait for readiness (max ~40s).
  for i in $(seq 1 80); do
    if curl -sf "http://localhost:$PORT/" -o /dev/null 2>/dev/null; then break; fi
    sleep 0.5
  done
  sleep 1.5
  shoot "http://localhost:$PORT/" "$OUT/$T-home.png" 3400
  shoot "http://localhost:$PORT/$ART" "$OUT/$T-article.png" 2600
  shoot "http://localhost:$PORT/$SEC" "$OUT/$T-section.png" 2200
  kill $DEV_PID 2>/dev/null
  wait $DEV_PID 2>/dev/null
  sleep 0.5
done
echo "done → $OUT"
ls -1 "$OUT" | wc -l
