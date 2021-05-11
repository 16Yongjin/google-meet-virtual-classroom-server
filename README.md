# 구글 Meet를 3D 가상 교실로 만드는 크롬 확장 프로그램 서버

21-1 종합설계 프로젝트

## 기술 스택

- Node.js
- Express
- Socket.io

## 앱 실행 방법

### 사전 설치

- Node.js 14 +
- yarn

### 패키지 설치

프로젝트 디렉터리에서 `yarn install` 커맨드 실행

## 환경 변수 설정

1. `.env.example` 파일을 복사해서 `.env` 파일로 저장

2. https://sketchfab.com/settings/password 에 있는 API Token을 `SKETCHFAB_API_KEY`에 복붙하기

### 앱 실행

프로젝트 디렉터리에서 `yarn start` 커맨드 실행

## 진행사항

### 완료

- 다중 이용자 위치, 애니메이션 동기화
- SketchFab 3D 모델 다운로드

### 진행중

- 유저가 추가한 3D 모델 사용자 간 동기화
