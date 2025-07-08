import express from "express";
import session from "express-session";
import base64url from "base64url";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import cookieParser from "cookie-parser";
import crypto from "crypto";

const app = express();
const port = process.env.PORT || 8080;

// 메모리 사용자 저장소 (실제 프로덕션에서는 데이터베이스 사용 권장)
const users = new Map(); // username -> { id, credentials: [], counter: {} }

// 테스트용 사용자 추가
users.set("test", {
  id: "test",
  userId: "test",
  userPw: "test123",
  userNn: "테스트 사용자",
  userEmail: "test@example.com",
  userPhoneno: "010-1234-5678",
  credentials: [],
  counter: {},
  createdAt: new Date().toISOString(),
});

console.log("테스트 사용자 생성 완료: test / test123");

// 환경변수에서 시크릿 키 가져오기 (보안 강화)
const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // 보안 강화
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS 환경에서만 secure
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24시간
    },
    name: "webauthn-session", // 기본 세션명 변경
  })
);

// CORS 설정 추가
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // OPTIONS 요청 처리
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 인증되지 않으면 막기
const requireAuth = (req, res, next) => {
  if (!req.session.username) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// 사용자 정보 등록 요청
app.post("/api/auth/registerRequest", (req, res) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "Username is required" });
    }

    const userId = base64url.encode(Buffer.from(username));
    let user = users.get(username);

    if (!user) {
      user = { id: userId, credentials: [], counter: {} };
      users.set(username, user);
    }

    const options = generateRegistrationOptions({
      rpName: "WebAuthn Demo",
      rpID: process.env.RP_ID || "localhost",
      userID: userId,
      userName: username,
      attestationType: req.body.attestation || "none",
      excludeCredentials: user.credentials.map((c) => ({
        id: Buffer.from(c.credId, "base64url"),
        type: "public-key",
        transports: c.transports || ["internal"],
      })),
      authenticatorSelection: {
        authenticatorAttachment: req.body.authenticatorAttachment || "platform",
        userVerification: req.body.userVerification || "preferred",
        requireResidentKey: req.body.requireResidentKey || false,
        ...req.body.authenticatorSelection,
      },
      supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    });

    req.session.challenge = options.challenge;
    req.session.username = username;
    req.session.registrationInProgress = true;

    res.json(options);
  } catch (error) {
    console.error("Registration request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 사용자 정보 등록 응답
app.post("/api/auth/registerResponse", async (req, res) => {
  try {
    const body = req.body;
    const user = users.get(req.session.username);
    const expectedChallenge = req.session.challenge;

    if (!user || !expectedChallenge || !req.session.registrationInProgress) {
      return res.status(400).json({ error: "Invalid registration session" });
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: process.env.FRONTEND_URL || "https://localhost:3000",
      expectedRPID: process.env.RP_ID || "localhost",
      requireUserVerification: false,
    });

    if (!verification.verified) {
      return res
        .status(400)
        .json({ error: "Registration verification failed" });
    }

    const { credentialID, publicKey, counter } = verification.registrationInfo;
    const newCredential = {
      credId: credentialID.toString("base64url"),
      publicKey,
      counter: counter || 0,
      transports: body.response.transports || ["internal"],
      createdAt: new Date().toISOString(),
    };

    user.credentials.push(newCredential);
    user.counter[newCredential.credId] = counter || 0;

    // 세션 정리
    delete req.session.challenge;
    delete req.session.registrationInProgress;

    res.json({
      status: "ok",
      credentialId: newCredential.credId,
    });
  } catch (error) {
    console.error("Registration response error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// 등록된 키 조회
app.get("/auth/getKeys", requireAuth, (req, res) => {
  try {
    const user = users.get(req.session.username);
    const credentials = user.credentials.map((c) => ({
      credId: c.credId,
      counter: user.counter[c.credId] || 0,
      transports: c.transports,
      createdAt: c.createdAt,
    }));
    res.json({ credentials });
  } catch (error) {
    console.error("Get keys error:", error);
    res.status(500).json({ error: "Failed to get keys" });
  }
});

// 키 제거
app.delete("/auth/removeKey", requireAuth, (req, res) => {
  try {
    const { credId } = req.query;
    if (!credId) {
      return res.status(400).json({ error: "Credential ID is required" });
    }

    const user = users.get(req.session.username);
    const credentialIndex = user.credentials.findIndex(
      (c) => c.credId === credId
    );

    if (credentialIndex === -1) {
      return res.status(404).json({ error: "Credential not found" });
    }

    user.credentials.splice(credentialIndex, 1);
    delete user.counter[credId];

    res.json({ status: "deleted" });
  } catch (error) {
    console.error("Remove key error:", error);
    res.status(500).json({ error: "Failed to remove key" });
  }
});

// 인증 요청
app.post("/auth/signinRequest", (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = users.get(username);
    if (!user || user.credentials.length === 0) {
      return res.status(404).json({ error: "No credentials found for user" });
    }

    const options = generateAuthenticationOptions({
      timeout: 60000,
      allowCredentials: user.credentials.map((c) => ({
        id: Buffer.from(c.credId, "base64url"),
        type: "public-key",
        transports: c.transports || ["internal"],
      })),
      userVerification: "preferred",
      rpID: process.env.RP_ID || "localhost",
    });

    req.session.challenge = options.challenge;
    req.session.username = username;
    req.session.authenticationInProgress = true;

    res.json(options);
  } catch (error) {
    console.error("Signin request error:", error);
    res.status(500).json({ error: "Authentication request failed" });
  }
});

// 인증 응답
app.post("/auth/signinResponse", async (req, res) => {
  try {
    const user = users.get(req.session.username);
    const expectedChallenge = req.session.challenge;
    const body = req.body;

    if (!user || !expectedChallenge || !req.session.authenticationInProgress) {
      return res.status(400).json({ error: "Invalid authentication session" });
    }

    const credential = user.credentials.find((c) => c.credId === body.id);
    if (!credential) {
      return res.status(400).json({ error: "Credential not found" });
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: process.env.FRONTEND_URL || "https://localhost:3000",
      expectedRPID: process.env.RP_ID || "localhost",
      authenticator: {
        credentialID: Buffer.from(credential.credId, "base64url"),
        publicKey: credential.publicKey,
        counter: user.counter[credential.credId] || 0,
      },
      requireUserVerification: false,
    });

    if (!verification.verified) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    // 카운터 업데이트 (리플레이 공격 방지)
    user.counter[credential.credId] =
      verification.authenticationInfo.newCounter;

    // 세션 정리
    delete req.session.challenge;
    delete req.session.authenticationInProgress;

    res.json({
      status: "authenticated",
      username: req.session.username,
    });
  } catch (error) {
    console.error("Signin response error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// 일반 회원가입 API
app.post("/users/register", (req, res) => {
  try {
    const { userId, userPw, userNn, userEmail, userPhoneno } = req.body;

    if (!userId || !userPw || !userNn || !userEmail || !userPhoneno) {
      return res.status(400).json({ error: "모든 필수 항목을 입력하세요." });
    }

    // 사용자 ID 중복 확인
    if (users.has(userId)) {
      return res.status(400).json({ error: "이미 존재하는 사용자 ID입니다." });
    }

    // 새 사용자 생성
    const newUser = {
      id: userId,
      userId: userId,
      userPw: userPw, // 실제로는 해시화 필요
      userNn: userNn,
      userEmail: userEmail,
      userPhoneno: userPhoneno,
      credentials: [],
      counter: {},
      createdAt: new Date().toISOString(),
    };

    users.set(userId, newUser);

    res.status(200).json({
      message: "회원가입이 완료되었습니다!",
      user: { userId, userNn, userEmail },
    });
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).json({ error: "회원가입에 실패했습니다." });
  }
});

// 일반 로그인 API
app.post("/users/login", (req, res) => {
  try {
    const { userId, userPw } = req.body;

    if (!userId || !userPw) {
      return res.status(400).json({ error: "ID와 비밀번호를 입력하세요." });
    }

    const user = users.get(userId);

    if (!user) {
      return res.status(401).json({ error: "존재하지 않는 사용자입니다." });
    }

    // 비밀번호 확인 (실제로는 해시 비교 필요)
    if (user.userPw !== userPw) {
      return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });
    }

    // 세션에 사용자 정보 저장
    req.session.username = userId;
    req.session.userId = userId;

    res.status(200).json({
      message: "로그인 성공!",
      user: {
        userId: user.userId,
        userNn: user.userNn,
        userEmail: user.userEmail,
      },
      token: "dummy-token", // 실제로는 JWT 토큰 생성
    });
  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).json({ error: "로그인에 실패했습니다." });
  }
});

// API 라우트를 위한 로그인 엔드포인트 (클라이언트 호환성)
app.post("/api/auth/login", (req, res) => {
  try {
    const { userId, userPw, deviceInfo } = req.body;

    if (!userId || !userPw) {
      return res.status(400).json({ error: "ID와 비밀번호를 입력하세요." });
    }

    const user = users.get(userId);

    if (!user) {
      return res.status(401).json({ error: "존재하지 않는 사용자입니다." });
    }

    // 비밀번호 확인 (실제로는 해시 비교 필요)
    if (user.userPw !== userPw) {
      return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });
    }

    // 세션에 사용자 정보 저장
    req.session.username = userId;
    req.session.userId = userId;

    // 클라이언트가 기대하는 응답 형식으로 반환
    res.status(200).json({
      message: "로그인 성공!",
      username: user.userId,
      userId: user.userId,
      name: user.userNn,
      userNn: user.userNn,
      email: user.userEmail,
      userEmail: user.userEmail,
      accessToken: "dummy-token-" + Date.now(), // 실제로는 JWT 토큰 생성
      refreshToken: "dummy-refresh-token-" + Date.now(),
    });
  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).json({ error: "로그인에 실패했습니다." });
  }
});

// 비밀번호 로그인 (단순 예시)
app.post("/auth/password", (req, res) => {
  try {
    const { username, password } = req.body;

    // 실제 구현에서는 데이터베이스에서 사용자 검증
    if (username === "test" && password === "password") {
      req.session.username = username;
      res.json({ status: "signed in", username });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Password login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// 로그아웃
app.post("/auth/signout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ status: "logged out" });
  });
});

// 사용자 상태 확인
app.get("/auth/status", (req, res) => {
  res.json({
    authenticated: !!req.session.username,
    username: req.session.username || null,
  });
});

// 카카오 로그인 API
app.post("/auth/kakao/login", async (req, res) => {
  try {
    const { accessToken, userInfo } = req.body;

    if (!accessToken || !userInfo) {
      return res
        .status(400)
        .json({ error: "카카오 로그인 정보가 누락되었습니다." });
    }

    // 카카오 액세스 토큰 검증
    const kakaoUserInfo = await verifyKakaoToken(accessToken);

    // 기존 사용자 확인 또는 새 사용자 생성
    let user = users.get(`kakao_${userInfo.id}`);

    if (!user) {
      // 새 사용자 생성
      user = {
        id: `kakao_${userInfo.id}`,
        userId: `kakao_${userInfo.id}`,
        userPw: null, // 카카오 로그인은 비밀번호 없음
        userNn: userInfo.nickname || "카카오 사용자",
        userEmail: userInfo.email || "",
        userPhoneno: "",
        userProfileImageUrl: userInfo.profileImage || "",
        userDefloc: "",
        userStatus: 1,
        userSignUp: new Date(),
        userLastLogin: new Date(),
        userPoint: 0,
        userActivePoint: 0,
        credentials: [],
        counter: {},
        loginType: "kakao",
        kakaoId: userInfo.id,
      };
      users.set(`kakao_${userInfo.id}`, user);
    } else {
      // 기존 사용자 로그인 시간 업데이트
      user.userLastLogin = new Date();
    }

    // 세션에 사용자 정보 저장
    req.session.username = user.userId;
    req.session.userId = user.userId;
    req.session.loginType = "kakao";

    res.status(200).json({
      message: "카카오 로그인 성공!",
      user: {
        userId: user.userId,
        userNn: user.userNn,
        userEmail: user.userEmail,
        userProfileImageUrl: user.userProfileImageUrl,
      },
      token: "kakao-token-" + Date.now(), // 실제로는 JWT 토큰 생성
    });
  } catch (error) {
    console.error("카카오 로그인 오류:", error);
    res.status(500).json({ error: "카카오 로그인에 실패했습니다." });
  }
});

// 카카오 액세스 토큰 검증 함수
async function verifyKakaoToken(accessToken) {
  try {
    const response = await fetch(
      "https://kapi.kakao.com/v1/user/access_token_info",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Invalid access token");
    }

    return await response.json();
  } catch (error) {
    throw new Error("카카오 토큰 검증 실패");
  }
}

// 에러 핸들링 미들웨어
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(port, () => {
  console.log(`WebAuthn server running at https://localhost:8080`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
