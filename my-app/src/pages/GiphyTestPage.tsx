import React from "react";

const GiphyTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            🏃‍♂️ GIF 기능 완료
          </h1>

          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-8">
            <h2 className="font-semibold text-green-800 mb-2">✅ 구현 완료:</h2>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• 혼합 랜덤 GIF 기능이 메인 페이지에 적용되었습니다</li>
              <li>• Giphy API + 사용자 URL 혼합 표시</li>
              <li>• 429 에러 시 자동 대체 기능</li>
              <li>• 5초 간격 자동 진행</li>
              <li>• 깔끔한 중앙 정렬 디자인</li>
            </ul>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">
              메인 페이지에서 GIF 기능을 확인하세요!
            </p>
            <a
              href="/"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🏠 메인 페이지로 이동
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiphyTestPage;
