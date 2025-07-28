package kr.co.kh.advice;

import kr.co.kh.exception.*;
import kr.co.kh.model.payload.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * 전역 예외 처리 클래스
 * 
 * 역할:
 * 1. 모든 컨트롤러에서 발생하는 예외를 중앙에서 처리
 * 2. 일관된 에러 응답 형식 제공
 * 3. HTTP 상태 코드와 적절한 에러 메시지 매핑
 * 4. 다국어 지원을 위한 메시지 현지화
 * 5. 로깅을 통한 에러 추적
 */
@RestControllerAdvice
@Slf4j
public class AuthControllerAdvice {


    /**
     * 다국어 메시지 처리를 위한 MessageSource
     * - messages.properties 파일에서 에러 메시지를 가져옴
     * - 현재 로케일에 맞는 언어로 메시지 제공
     */
    private final MessageSource messageSource;

    /**
     * 생성자 주입
     * @param messageSource 다국어 메시지 소스
     */
    @Autowired
    public AuthControllerAdvice(MessageSource messageSource) {
        this.messageSource = messageSource;
    }


    /**
     * 유효성 검증 실패 예외 처리
     * 
     * 역할:
     * - @Valid, @Validated 어노테이션으로 검증된 객체의 유효성 검증 실패 시 호출
     * - 모든 검증 오류를 수집하여 하나의 문자열로 결합
     * - HTTP 400 Bad Request 상태 코드 반환
     * 
     * @param ex 유효성 검증 실패 예외
     * @param request 웹 요청 정보
     * @return 통일된 에러 응답 형식
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ApiResponse processValidationError(MethodArgumentNotValidException ex, WebRequest request) {
        BindingResult result = ex.getBindingResult();
        List<ObjectError> allErrors = result.getAllErrors();
        String data = processAllErrors(allErrors).stream().collect(Collectors.joining("\n"));
        return new ApiResponse(false, data, ex.getClass().getName(), resolvePathFromWebRequest(request));
    }

    /**
     * 모든 검증 오류를 현지화된 메시지로 변환
     * 
     * 역할:
     * - 검증 실패한 모든 필드의 오류 메시지를 현재 로케일에 맞게 변환
     * - Stream API를 사용하여 각 오류를 처리
     * 
     * @param allErrors 모든 검증 오류 목록
     * @return 현지화된 오류 메시지 목록
     */
    private List<String> processAllErrors(List<ObjectError> allErrors) {
        return allErrors.stream().map(this::resolveLocalizedErrorMessage).collect(Collectors.toList());
    }

    /**
     * 개별 오류 메시지를 현지화
     * 
     * 역할:
     * - 현재 사용자의 로케일 정보를 가져와서 해당 언어로 메시지 변환
     * - MessageSource를 통해 messages.properties에서 메시지 조회
     * - 변환된 메시지를 로그로 기록
     * 
     * @param objectError 개별 검증 오류
     * @return 현지화된 오류 메시지
     */
    private String resolveLocalizedErrorMessage(ObjectError objectError) {
        Locale currentLocale = LocaleContextHolder.getLocale();
        String localizedErrorMessage = messageSource.getMessage(objectError, currentLocale);
        log.info(localizedErrorMessage);
        return localizedErrorMessage;
    }

    /**
     * 웹 요청에서 요청 경로 추출
     * 
     * 역할:
     * - 에러가 발생한 API 엔드포인트 경로를 추출
     * - 에러 응답에 어떤 API에서 오류가 발생했는지 정보 제공
     * - 예외 발생 시 null 반환하여 안전성 보장
     * 
     * @param request 웹 요청 정보
     * @return 요청 경로 또는 null
     */
    private String resolvePathFromWebRequest(WebRequest request) {
        try {
            return ((ServletWebRequest) request).getRequest().getAttribute("javax.servlet.forward.request_uri").toString();
        } catch (Exception ex) {
            return null;
        }
    }

    /**
     * 애플리케이션 일반 예외 처리
     * 
     * 역할:
     * - 비즈니스 로직에서 발생하는 일반적인 예외 처리
     * - HTTP 500 Internal Server Error 상태 코드 반환
     * - 시스템 내부 오류임을 클라이언트에게 알림
     * 
     * @param ex 애플리케이션 예외
     * @param request 웹 요청 정보
     * @return 통일된 에러 응답 형식
     */
    @ExceptionHandler(value = AppException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ResponseBody
    public ApiResponse handleAppException(AppException ex, WebRequest request) {
        return new ApiResponse(false, ex.getMessage(), ex.getClass().getName(), resolvePathFromWebRequest(request));
    }

    /**
     * 리소스 중복 사용 예외 처리
     * 
     * 역할:
     * - 이미 존재하는 리소스(이메일, 사용자명 등)를 다시 생성하려 할 때 처리
     * - HTTP 409 Conflict 상태 코드 반환
     * - 클라이언트에게 리소스 충돌 상황을 알림
     * 
     * @param ex 리소스 중복 사용 예외
     * @param request 웹 요청 정보
     * @return 통일된 에러 응답 형식
     */
    @ExceptionHandler(value = ResourceAlreadyInUseException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    @ResponseBody
    public ApiResponse handleResourceAlreadyInUseException(ResourceAlreadyInUseException ex, WebRequest request) {
        return new ApiResponse(false, ex.getMessage(), ex.getClass().getName(), resolvePathFromWebRequest(request));
    }

    /**
     * 리소스 없음 예외 처리
     * 
     * 역할:
     * - 요청한 리소스(사용자, 게시글 등)가 존재하지 않을 때 처리
     * - HTTP 404 Not Found 상태 코드 반환
     * - 클라이언트에게 요청한 리소스를 찾을 수 없음을 알림
     * 
     * @param ex 리소스 없음 예외
     * @param request 웹 요청 정보
     * @return 통일된 에러 응답 형식
     */
    @ExceptionHandler(value = ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ApiResponse handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        return new ApiResponse(false, ex.getMessage(), ex.getClass().getName(), resolvePathFromWebRequest(request));
    }

    /**
     * 잘못된 요청 예외 처리
     * 
     * 역할:
     * - 클라이언트가 잘못된 형식의 요청을 보냈을 때 처리
     * - HTTP 400 Bad Request 상태 코드 반환
     * - 요청 형식이나 파라미터가 올바르지 않음을 알림
     * 
     * @param ex 잘못된 요청 예외
     * @param request 웹 요청 정보
     * @return 통일된 에러 응답 형식
     */
    @ExceptionHandler(value = BadRequestException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ApiResponse handleBadRequestException(BadRequestException ex, WebRequest request) {
        return new ApiResponse(false, ex.getMessage(), ex.getClass().getName(), resolvePathFromWebRequest(request));
    }

    /**
     * 사용자명 없음 예외 처리 (Spring Security)
     * 
     * 역할:
     * - Spring Security에서 사용자를 찾을 수 없을 때 발생
     * - HTTP 404 Not Found 상태 코드 반환
     * - 로그인 시도 시 존재하지 않는 사용자명에 대한 처리
     * 
     * @param ex 사용자명 없음 예외
     * @param request 웹 요청 정보
     * @return 통일된 에러 응답 형식
     */
    @ExceptionHandler(value = UsernameNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ApiResponse handleUsernameNotFoundException(UsernameNotFoundException ex, WebRequest request) {
        return new ApiResponse(false, ex.getMessage(), ex.getClass().getName(), resolvePathFromWebRequest(request));
    }

    /**
     * 사용자 로그인 예외 처리
     * 
     * 역할:
     * - 로그인 과정에서 발생하는 예외 처리 (비밀번호 오류, 계정 잠금 등)
     * - HTTP 417 Expectation Failed 상태 코드 반환
     * - 로그인 실패 원인을 클라이언트에게 명확히 전달
     * 
     * @param ex 사용자 로그인 예외
     * @param request 웹 요청 정보
     * @return 통일된 에러 응답 형식
     */
    @ExceptionHandler(value = UserLoginException.class)
    @ResponseStatus(HttpStatus.EXPECTATION_FAILED)
    @ResponseBody
    public ApiResponse handleUserLoginException(UserLoginException ex, WebRequest request) {
        return new ApiResponse(false, ex.getMessage(), ex.getClass().getName(), resolvePathFromWebRequest(request));
    }

    /**
     * 잘못된 인증 정보 예외 처리 (Spring Security)
     * 
     * 역할:
     * - Spring Security에서 비밀번호가 틀렸을 때 발생
     * - HTTP 417 Expectation Failed 상태 코드 반환
     * - 로그인 시도 시 잘못된 비밀번호에 대한 처리
     * 
     * @param ex 잘못된 인증 정보 예외
     * @param request 웹 요청 정보
     * @return 통일된 에러 응답 형식
     */
    @ExceptionHandler(value = BadCredentialsException.class)
    @ResponseStatus(HttpStatus.EXPECTATION_FAILED)
    @ResponseBody
    public ApiResponse handleBadCredentialsException(BadCredentialsException ex, WebRequest request) {
        return new ApiResponse(false, ex.getMessage(), ex.getClass().getName(), resolvePathFromWebRequest(request));
    }

    /**
     * 사용자 등록 예외 처리
     * 
     * 역할:
     * - 회원가입 과정에서 발생하는 예외 처리 (이메일 중복, 유효성 검증 실패 등)
     * - HTTP 417 Expectation Failed 상태 코드 반환
     * - 회원가입 실패 원인을 클라이언트에게 명확히 전달
     * 
     * @param ex 사용자 등록 예외
     * @param request 웹 요청 정보
     * @return 통일된 에러 응답 형식
     */
    @ExceptionHandler(value = UserRegistrationException.class)
    @ResponseStatus(HttpStatus.EXPECTATION_FAILED)
    @ResponseBody
    public ApiResponse handleUserRegistrationException(UserRegistrationException ex, WebRequest request) {
        return new ApiResponse(false, ex.getMessage(), ex.getClass().getName(), resolvePathFromWebRequest(request));
    }

    /**
     * 잘못된 토큰 요청 예외 처리
     * 
     * 역할:
     * - JWT 토큰이 유효하지 않거나 만료되었을 때 처리
     * - HTTP 406 Not Acceptable 상태 코드 반환
     * - 토큰 갱신이나 재인증이 필요함을 클라이언트에게 알림
     * 
     * @param ex 잘못된 토큰 요청 예외
     * @param request 웹 요청 정보
     * @return 통일된 에러 응답 형식
     */
    @ExceptionHandler(value = InvalidTokenRequestException.class)
    @ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
    @ResponseBody
    public ApiResponse handleInvalidTokenException(InvalidTokenRequestException ex, WebRequest request) {
        return new ApiResponse(false, ex.getMessage(), ex.getClass().getName(), resolvePathFromWebRequest(request));
    }



    /**
     * 토큰 갱신 예외 처리
     * 
     * 역할:
     * - JWT 토큰 갱신 과정에서 발생하는 예외 처리
     * - HTTP 417 Expectation Failed 상태 코드 반환
     * - Refresh Token이 만료되었거나 유효하지 않을 때 처리
     * 
     * @param ex 토큰 갱신 예외
     * @param request 웹 요청 정보
     * @return 통일된 에러 응답 형식
     */
    @ExceptionHandler(value = TokenRefreshException.class)
    @ResponseStatus(HttpStatus.EXPECTATION_FAILED)
    @ResponseBody
    public ApiResponse handleTokenRefreshException(TokenRefreshException ex, WebRequest request) {
        return new ApiResponse(false, ex.getMessage(), ex.getClass().getName(), resolvePathFromWebRequest(request));
    }

    /**
     * 사용자 로그아웃 예외 처리
     * 
     * 역할:
     * - 로그아웃 과정에서 발생하는 예외 처리
     * - HTTP 417 Expectation Failed 상태 코드 반환
     * - 세션 종료나 토큰 무효화 과정에서 문제가 발생할 때 처리
     * 
     * @param ex 사용자 로그아웃 예외
     * @param request 웹 요청 정보
     * @return 통일된 에러 응답 형식
     */
    @ExceptionHandler(value = UserLogoutException.class)
    @ResponseStatus(HttpStatus.EXPECTATION_FAILED)
    @ResponseBody
    public ApiResponse handleUserLogoutException(UserLogoutException ex, WebRequest request) {
        return new ApiResponse(false, ex.getMessage(), ex.getClass().getName(), resolvePathFromWebRequest(request));
    }

    /**
     * 파일 업로드 예외 처리
     * 
     * 역할:
     * - 파일 업로드 과정에서 발생하는 예외 처리 (파일 크기 초과, 지원하지 않는 형식 등)
     * - HTTP 400 Bad Request 상태 코드 반환
     * - 업로드 실패 원인을 클라이언트에게 명확히 전달
     * 
     * @param ex 파일 업로드 예외
     * @param request 웹 요청 정보
     * @return 통일된 에러 응답 형식
     */
    @ExceptionHandler(value = UploadException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ApiResponse handleUploadException(UploadException ex, WebRequest request) {
        return new ApiResponse(false, ex.getMessage(), ex.getClass().getName(), resolvePathFromWebRequest(request));
    }

    /**
     * 리소스 없음 예외 처리 (일반)
     * 
     * 역할:
     * - 일반적인 리소스를 찾을 수 없을 때 처리
     * - HTTP 404 Not Found 상태 코드 반환
     * - 게시글, 댓글, 파일 등 다양한 리소스에 대한 처리
     * 
     * @param ex 리소스 없음 예외
     * @param request 웹 요청 정보
     * @return 통일된 에러 응답 형식
     */
    @ExceptionHandler(value = NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public ApiResponse handleNotFoundException(NotFoundException ex, WebRequest request) {
        return new ApiResponse(false, ex.getMessage(), ex.getClass().getName(), resolvePathFromWebRequest(request));
    }

    /**
     * 리소스 이미 존재 예외 처리
     * 
     * 역할:
     * - 이미 존재하는 리소스를 생성하려 할 때 처리
     * - HTTP 409 Conflict 상태 코드 반환
     * - 중복 생성 방지를 위한 처리
     * 
     * @param ex 리소스 이미 존재 예외
     * @param request 웹 요청 정보
     * @return 통일된 에러 응답 형식
     */
    @ExceptionHandler(value = AlreadyExistException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    @ResponseBody
    public ApiResponse handleAlreadyExistException(AlreadyExistException ex, WebRequest request) {
        return new ApiResponse(false, ex.getMessage(), ex.getClass().getName(), resolvePathFromWebRequest(request));
    }

}
