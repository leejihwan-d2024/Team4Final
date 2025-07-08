//  FIDO, 사용자의 인증 장치(Authenticator)**에 새로운 공개키 기반
//  자격증명(PublicKeyCredential)을 생성하는 것을 목적으로 합니다.

import React, { useState } from "react";

const WebAuthnRegister: React.FC = () => {
  const [status, setStatus] = useState<string>("준비 완료");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState<boolean>(false);

  // 디버그 로그 추가
  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${info}`,
    ]);
  };

  // Base64URL <-> ArrayBuffer 변환 함수
  const base64urlToBuffer = (base64url: string): ArrayBuffer => {
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };
  const bufferToBase64url = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window
      .btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  // 등록 시작
  const startRegistration = async () => {
    setIsLoading(true);
    setError("");
    setDebugInfo([]);
    setStatus("서버에서 등록 옵션을 가져오는 중...");

    try {
      addDebugInfo("지문/생체 등록 프로세스 시작");
      // 서버 주소 자동 감지 (포트 3000)??
      const currentHost = window.location.hostname;
      const serverUrl = `https://${currentHost}:8080`;
      addDebugInfo(`서버 URL: ${serverUrl}`);

      // 서버에서 등록 옵션 가져오기
      const response = await fetch(`${serverUrl}/auth/registerRequest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "test" }),
      });
      if (!response.ok) throw new Error("서버 응답 오류");
      const options = await response.json();
      addDebugInfo("서버에서 옵션을 성공적으로 받음");

      // 옵션 변환
      const challenge = base64urlToBuffer(options.challenge);
      const userId = base64urlToBuffer(options.user.id);

      // 브라우저 지원 확인
      if (!window.PublicKeyCredential)
        throw new Error("이 브라우저는 WebAuthn을 지원하지 않습니다.");
      if (
        !window.PublicKeyCredential
          .isUserVerifyingPlatformAuthenticatorAvailable
      ) {
        throw new Error("지문/생체 인증을 사용할 수 없습니다.");
      }
      const isAvailable =
        await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!isAvailable)
        throw new Error("이 기기에서 생체인증을 사용할 수 없습니다.");
      addDebugInfo("WebAuthn 및 플랫폼 인증기 사용 가능");

      // WebAuthn 등록 옵션 구성
      const publicKey: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: options.rp,
        user: {
          id: userId,
          name: options.user.name,
          displayName: options.user.displayName,
        },
        pubKeyCredParams: options.pubKeyCredParams,
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          requireResidentKey: false,
          residentKey: "discouraged",
        },
        timeout: options.timeout,
        attestation: options.attestation,
        extensions: options.extensions,
      };

      setStatus("지문/생체 인증을 진행해주세요...");
      addDebugInfo("브라우저에서 자격 증명 생성 시도");
      // 브라우저에서 자격 증명 생성 (지문/FaceID 등)
      const credential = await navigator.credentials.create({ publicKey });
      if (!credential) throw new Error("자격 증명 생성 실패");
      addDebugInfo("자격 증명 생성 성공");

      // PublicKeyCredential로 타입 캐스팅
      const publicKeyCredential = credential as PublicKeyCredential;
      // 서버로 응답 전송
      const credentialResponse = {
        id: publicKeyCredential.id,
        type: publicKeyCredential.type,
        rawId: bufferToBase64url(publicKeyCredential.rawId),
        response: {
          clientDataJSON: bufferToBase64url(
            (publicKeyCredential.response as any).clientDataJSON
          ),
          attestationObject: bufferToBase64url(
            (publicKeyCredential.response as any).attestationObject
          ),
        },
      };
      const verifyResponse = await fetch(`${serverUrl}/auth/registerResponse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentialResponse),
      });
      if (verifyResponse.ok) {
        setStatus("✅ 생체인증 등록이 완료되었습니다!");
        addDebugInfo("서버 검증 성공");
      } else {
        setStatus("⚠️ 등록은 성공했지만 서버 검증에 실패했습니다.");
        addDebugInfo("서버 검증 실패");
      }
    } catch (err: any) {
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
      setStatus("등록 실패");
      addDebugInfo(`최종 오류: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "2rem auto",
        background: "#fff",
        color: "#222",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        padding: 32,
      }}
    >
      <h2 style={{ color: "#764ba2" }}>WebAuthn 생체인증 등록</h2>
      <p>
        이 페이지에서 지문, FaceID 등 <b>플랫폼 생체인증</b>을 등록할 수
        있습니다.
      </p>
      <button
        onClick={startRegistration}
        disabled={isLoading}
        style={{
          padding: "12px 24px",
          borderRadius: 8,
          background: "linear-gradient(45deg,#667eea,#764ba2)",
          color: "#fff",
          fontWeight: 600,
          fontSize: 16,
          border: "none",
          margin: "1rem 0",
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "진행 중..." : "생체인증 등록 시작"}
      </button>
      <div style={{ margin: "1rem 0", fontWeight: 500 }}>
        <span>상태: </span>
        <span
          style={{
            color: status.includes("실패")
              ? "#e74c3c"
              : status.includes("완료")
              ? "#27ae60"
              : "#333",
          }}
        >
          {status}
        </span>
      </div>
      {error && (
        <div style={{ color: "#e74c3c", marginBottom: 12 }}>오류: {error}</div>
      )}
      <button
        onClick={() => setShowDebug((v) => !v)}
        style={{
          fontSize: 13,
          background: "none",
          border: "none",
          color: "#764ba2",
          cursor: "pointer",
          marginBottom: 8,
        }}
      >
        {showDebug ? "디버그 로그 숨기기" : "디버그 로그 보기"}
      </button>
      {showDebug && (
        <div
          style={{
            background: "#f4f4f4",
            color: "#333",
            borderRadius: 8,
            padding: 12,
            fontSize: 13,
            maxHeight: 200,
            overflowY: "auto",
            textAlign: "left",
          }}
        >
          {debugInfo.length === 0 ? (
            <div>로그 없음</div>
          ) : (
            debugInfo.map((line, i) => <div key={i}>{line}</div>)
          )}
        </div>
      )}
    </div>
  );
};

export default WebAuthnRegister;
