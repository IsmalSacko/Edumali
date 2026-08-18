#!/usr/bin/env bash
# Build l'APK Android release (signé) et le publie sur la vitrine
# (https://scolmali.ismaeldev.fr/downloads/scolmali.apk), en attendant la
# publication sur le Play Store.
#
# Usage : scripts/release-android.sh
# Voir aussi : make release-android (même chose via le Makefile).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

export JAVA_HOME="${JAVA_HOME:-/usr/local/opt/openjdk@21}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"

KEYSTORE_PATH="${SCOLMALI_KEYSTORE_PATH:-$HOME/.android-keys/scolmali-release.keystore}"
KEYSTORE_PASSWORD_FILE="$HOME/.android-keys/scolmali-release.password.txt"
DEPLOY_HOST="ismael@54.36.182.87"
DEPLOY_PATH="/var/www/scolmali-api/vitrine/downloads/scolmali.apk"

if [ ! -f "$KEYSTORE_PATH" ]; then
  echo "✗ Keystore introuvable : $KEYSTORE_PATH" >&2
  exit 1
fi
if [ -z "${SCOLMALI_KEYSTORE_PASSWORD:-}" ]; then
  if [ ! -f "$KEYSTORE_PASSWORD_FILE" ]; then
    echo "✗ SCOLMALI_KEYSTORE_PASSWORD non défini et $KEYSTORE_PASSWORD_FILE introuvable" >&2
    exit 1
  fi
  SCOLMALI_KEYSTORE_PASSWORD="$(cat "$KEYSTORE_PASSWORD_FILE")"
fi
export SCOLMALI_KEYSTORE_PATH="$KEYSTORE_PATH"
export SCOLMALI_KEYSTORE_PASSWORD

echo "▶ Build web (configuration mobile)…"
npm run build:mobile

echo "▶ Sync Capacitor Android…"
npx cap sync android

echo "▶ Build de l'APK release signé…"
(cd android && ./gradlew assembleRelease)

APK="android/app/build/outputs/apk/release/app-release.apk"
if [ ! -f "$APK" ]; then
  echo "✗ APK introuvable après le build : $APK" >&2
  exit 1
fi
echo "  ✓ $(du -h "$APK" | cut -f1)  $APK"

echo "▶ Publication sur la vitrine ($DEPLOY_HOST)…"
scp "$APK" "$DEPLOY_HOST:$DEPLOY_PATH"

echo
echo "✓ Terminé : https://scolmali.ismaeldev.fr/downloads/scolmali.apk"
