export const registerCredential = async () => {
  const opts = {
    attestation: "none", //증명 전달에 관한 환경설정: none, indirect 또는 direct. 필요하지 않다면 none을 선택합니다.
    authenticatorSelection: {
      authenticatorAttachment: "platform", //사용 가능한 인증자를 필터링합니다. 인증자를 기기에 연결하려면 'platform'을 사용하세요. 로밍 인증자의 경우 'cross-platform'을 사용하세요.
      userVerification: "required", //인증자 로컬 사용자 확인이 'required', 'preferred' 또는 'discouraged'인지 판단합니다. 지문 또는 화면 잠금 인증을 원한다면 'required'를 사용하세요.
      requireResidentKey: false, //생성된 사용자 인증 정보를 향후 계정 선택 도구 UX에 사용할 수 있다면 true를 사용합니다.
    },
  };
  
  //  이 Codelab의 _fetch() 함수는 POST로 사전 정의되며,
  // application/json 유형을 본문으로 지정하는 옵션을 사용합니다.
  // 서버에서 결과 JSON을 파싱하고 반환합니다.

  const options = await _fetch("/auth/registerRequest", opts);

  options.user.id = base64url.decode(options.user.id);
  options.challenge = base64url.decode(options.challenge);

  if (options.excludeCredentials) {
    //인증자가 중복 항목의 생성을 방지할 수 있는 PublicKeyCredentialDescriptor의 배열.
    for (let cred of options.excludeCredentials) {
      cred.id = base64url.decode(cred.id);
    }
  }

  const cred = await navigator.credentials.create({   //메서드를 호출하여 새 사용자 인증 정보를 만듭니다. 브라우저는 이 호출을 통해 인증자와 상호작용하며 UVPA를 통해 사용자 ID를 확인하려고 시도합니다.
    publicKey: options,
  });
  // 사용자가 생체 인식 센서를 사용하여 새 사용자 인증 정보를 만드는 경우에도 
  // 서버에는 생체 인식 정보가 표시되지 않습니다. 
  // 인증자는 사용자가 새 사용자 인증 정보를 생성하거나 그러한 정보로 기기에 
  // 서명하기 전에 저장한 생체 인식 정보가 기기 앞에 있는 사용자와 일치하는지 확인합니다. 
  // 생체 인식 정보는 인증자 외부로 유출되지 않습니다.

  const credential = {};
  credential.id = cred.id;
  credential.rawId = base64url.encode(cred.rawId);
  credential.type = cred.type;

  if (cred.response) {
    const clientDataJSON = base64url.encode(cred.response.clientDataJSON);
    const attestationObject = base64url.encode(cred.response.attestationObject);
    credential.response = {
      clientDataJSON,
      attestationObject,
    };
  }
  //사용자가 돌아오면 인증에 사용할 수 있도록 사용자 인증 정보 ID를 로컬에 저장합니다.

  localStorage.setItem(`credId`, credential.id);

  return await _fetch("/auth/registerResponse", credential);
};
//이제 전체 registerCredential() 함수가 있습니다.

export const unregisterCredential = async (credId) => {
  localStorage.removeItem("credId");
  return _fetch(`/auth/removeKey?credId=${encodeURIComponent(credId)}`);
};

//  지문으로 사용자의 신원을 확인하는 authenticate()라는 함수를 만듭니다. 
//  여기에 자바스크립트 코드를 추가합니다.
export const authenticate = async () => {

  //사용자에게 인증을 요청하기 전에 서버에 본인 확인 요청 및 기타 매개변수를 다시 
  // 전송하도록 요청하세요. opts를 인수로 _fetch()를 호출하여 POST 요청을 서버에 전송합니다.
  const opts = {};

  let url = "/auth/signinRequest";
  const credId = localStorage.getItem(`credId`);
  if (credId) {
    url += `?credId=${encodeURIComponent(credId)}`;
  }

  //  PublicKeyCredentialRequestOptions에 부합
  const options = await _fetch(url, opts);

  if (options.allowCredentials.length === 0) {
    console.info("No registered credentials found.");
    return Promise.resolve(null);
  }

  options.challenge = base64url.decode(options.challenge);

  for (let cred of options.allowCredentials) {
    cred.id = base64url.decode(cred.id);
  }

  const cred = await navigator.credentials.get({
    publicKey: options,
  });


  //  객체를 서버로 전송하고 객체가 HTTP code 200을 반환하면 사용자가 로그인된 것으로 간주합니다.
  const credential = {};
  credential.id = cred.id;
  credential.type = cred.type;
  credential.rawId = base64url.encode(cred.rawId);

  if (cred.response) {
    const clientDataJSON = base64url.encode(cred.response.clientDataJSON);
    const authenticatorData = base64url.encode(cred.response.authenticatorData);
    const signature = base64url.encode(cred.response.signature);
    const userHandle = base64url.encode(cred.response.userHandle);
    credential.response = {
      clientDataJSON,
      authenticatorData,
      signature,
      userHandle,
    };
  }


  return await _fetch(`/auth/signinResponse`, credential);
};
