package kr.co.kh.model.payload.response;

public class JwtAuthenticationResponse {

    private String accessToken;

    private String refreshToken;

    private String tokenType;

    private Long expiryDuration;

    private String username;
    
    private String userId; // 프론트엔드 호환성을 위해 추가
    
    private String email;
    
    private String name;
    
    private String userNn; // 닉네임 필드 추가
    
    private String userEmail; // 이메일 필드 추가


    public JwtAuthenticationResponse(String accessToken, String refreshToken, Long expiryDuration) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiryDuration = expiryDuration;
        tokenType = "Bearer ";
    }


    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public Long getExpiryDuration() {
        return expiryDuration;
    }

    public void setExpiryDuration(Long expiryDuration) {
        this.expiryDuration = expiryDuration;
    }
    
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getUserNn() {
        return userNn;
    }

    public void setUserNn(String userNn) {
        this.userNn = userNn;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public void setUserInfo(String username, String email, String name) {
        System.out.println("=== JwtAuthenticationResponse.setUserInfo ===");
        System.out.println("username: " + username);
        System.out.println("email: " + email);
        System.out.println("name: " + name);
        System.out.println("================================");
        
        this.username = username;
        this.userId = username; // userId도 함께 설정
        this.email = email;
        this.name = name;
        this.userNn = name; // 닉네임도 함께 설정
        this.userEmail = email; // 이메일도 함께 설정
    }
}
