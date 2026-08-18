package com.scolmali.app;

import android.os.Bundle;
import android.view.View;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;
import java.util.Locale;

/**
 * Injecte les zones de sécurité (encoche, barre de statut, barre de gestes)
 * en CSS nous-mêmes, sur toutes les versions d'Android supportées
 * (minSdk 24). Le plugin natif équivalent de Capacitor (SystemBars,
 * @capacitor/android/.../SystemBars.java) ne fait cette injection qu'à
 * partir d'Android 15 (Build.VERSION_CODES.VANILLA_ICE_CREAM) — en dessous,
 * les icônes du footer/de la nav se retrouvaient collées aux bords réels
 * de l'écran sur les téléphones plus anciens (edge-to-edge forcé par
 * targetSdk 36, mais sans compensation). Écrit les mêmes variables CSS
 * (--safe-area-inset-top/right/bottom/left) que SystemBars, donc aucun
 * changement nécessaire côté CSS (global.scss).
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        View webViewParent = (View) getBridge().getWebView().getParent();

        ViewCompat.setOnApplyWindowInsetsListener(webViewParent, (v, insets) -> {
            applySafeAreaInsets(insets);
            return insets;
        });

        WindowInsetsCompat initial = ViewCompat.getRootWindowInsets(webViewParent);
        if (initial != null) {
            applySafeAreaInsets(initial);
        }
    }

    private void applySafeAreaInsets(WindowInsetsCompat insets) {
        Insets safeArea = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
        float density = getResources().getDisplayMetrics().density;

        String script = String.format(
            Locale.US,
            "try {" +
                "document.documentElement.style.setProperty('--safe-area-inset-top','%dpx');" +
                "document.documentElement.style.setProperty('--safe-area-inset-right','%dpx');" +
                "document.documentElement.style.setProperty('--safe-area-inset-bottom','%dpx');" +
                "document.documentElement.style.setProperty('--safe-area-inset-left','%dpx');" +
            "} catch(e) {}",
            (int) (safeArea.top / density),
            (int) (safeArea.right / density),
            (int) (safeArea.bottom / density),
            (int) (safeArea.left / density)
        );

        getBridge().getWebView().post(() -> getBridge().getWebView().evaluateJavascript(script, null));
    }
}
