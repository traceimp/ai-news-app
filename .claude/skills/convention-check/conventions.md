## 네이밍
- 변수명, 함수명: 카멜 케이스(예: fetchNews, isLoading)
- 컴포넌트명: 파스칼 케이스(예: NewsCard, Dashboard)
- 상수: UPPER_SNAKE_CASE(EX: MAX_NEWS_COUNT)

## 포메팅
- 들여쓰기: 2칸
- 한 함수는 하나의 역할을 담당

## 코드 품질
- console.log는 커밋 전에 반드시 제거
- URL, 숫자 등 하드코딩된 값은 환경 변수로 분리 (예: process.env.API_URL)
- DB 조작 코드를 반드시 try-catch로 감싸기
- 오류 응답은 적절한 HTTP 상태 코드와 함께 반환(예: 500, 404, 400)
