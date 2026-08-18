.PHONY: release-android mobile-build mobile-run

# Build l'APK Android release signé et le publie sur la vitrine
# (voir scripts/release-android.sh).
release-android:
	./scripts/release-android.sh

# Build web (config mobile) + sync Capacitor, sans lancer d'émulateur.
mobile-build:
	npm run build:mobile
	npx cap sync android

# Build + déploie le build debug sur un émulateur/device connecté.
mobile-run: mobile-build
	npx cap run android
