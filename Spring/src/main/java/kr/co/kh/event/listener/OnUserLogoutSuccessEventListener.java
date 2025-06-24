package kr.co.kh.event.listener;

import kr.co.kh.cache.LoggedOutJwtTokenCache;
import kr.co.kh.event.OnUserLogoutSuccessEvent;
import kr.co.kh.model.payload.DeviceInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class OnUserLogoutSuccessEventListener implements ApplicationListener<OnUserLogoutSuccessEvent> {

    private final LoggedOutJwtTokenCache tokenCache;

    @Autowired
    public OnUserLogoutSuccessEventListener(LoggedOutJwtTokenCache tokenCache) {
        this.tokenCache = tokenCache;
    }

    public void onApplicationEvent(OnUserLogoutSuccessEvent event) {
        if (null != event) {
            DeviceInfo deviceInfo = event.getLogOutRequest().getDeviceInfo();
            log.info("Log out success event received for user [{}] for device [{}]", event.getUserEmail(), deviceInfo);
            tokenCache.markLogoutEventForToken(event);
        }
    }
}
