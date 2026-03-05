# --- Builder Stage ---
FROM node:22.17.0-alpine AS builder

# pnpm 활성화
RUN corepack enable

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 패키지 파일 복사
COPY package.json pnpm-lock.yaml ./

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY . .

# Nest.js 빌드 (dist 폴더 생성)
RUN pnpm run build

# --- Production Stage ---
FROM node:22.17.0-alpine

# 실행 단계에서도 pnpm 필요
RUN corepack enable

WORKDIR /usr/src/app

# 환경 변수 설정 (Production 모드)
ENV NODE_ENV production

# 패키지 파일 복사
COPY package.json pnpm-lock.yaml ./

# 프로덕션 의존성만 설치 (--production 옵션)
RUN pnpm install --prod --frozen-lockfile

# 빌드 단계에서 생성된 dist 폴더 복사
COPY --from=builder /usr/src/app/dist ./dist

# 서버 실행
CMD ["node", "dist/main"]