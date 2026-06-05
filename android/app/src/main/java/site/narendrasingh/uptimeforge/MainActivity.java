package site.narendrasingh.uptimeforge;

import android.os.Bundle;
import android.webkit.CookieManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void load() {
        super.load();
        // Enable cookies and third-party cookies so session persists across app restarts
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(this.bridge.getWebView(), true);
        cookieManager.flush();
    }
}
