package kr.co.kh.model.vo;

import com.fasterxml.jackson.annotation.JsonValue;

public enum DeviceType {

    /**
     * Android device type
     */
    DEVICE_TYPE_ANDROID("android"),

    /**
     * IOS device type
     */
    DEVICE_TYPE_IOS("ios"),

    DEVICE_TYPE_WINDOWS("windows"),
    DEVICE_TYPE_MACOS("macos"),
    WEB("WEB"),
    web("web"),
    OTHER("other");

    private final String value;

    DeviceType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}

