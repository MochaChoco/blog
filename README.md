# OGQ Comment Box

프레임워크 독립적인 Vanilla JS 댓글 모듈

## 특징

- **프레임워크 독립적**: React, Vue, Angular 등 어떤 프레임워크에서도 사용 가능
- **TypeScript 지원**: 완전한 타입 정의 제공
- **대댓글 지원**: 계층형 댓글 구조
- **다국어 지원**: 한국어, 영어 기본 제공
- **테마 지원**: 라이트/다크 테마
- **반응형**: 모바일 최적화

## 설치

```bash
npm install @nom/comment-box
```

## 사용법

### 기본 사용

```html
<div id="comment-box"></div>

<script type="module">
  import CommentBox from '@nom/comment-box';
  import '@nom/comment-box/style.css';

  CommentBox.init({
    container: '#comment-box',
    objectId: 'article-123',
  });
</script>
```

### UMD (브라우저 직접 로드)

```html
<link rel="stylesheet" href="path/to/comment-box.css">
<script src="path/to/comment-box.umd.js"></script>

<script>
  CommentBox.init({
    container: '#comment-box',
    objectId: 'article-123',
  });
</script>
```

### Vue 3 통합

```vue
<template>
  <div ref="commentBox"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import CommentBox from '@nom/comment-box';
import '@nom/comment-box/style.css';

const commentBox = ref(null);

onMounted(() => {
  CommentBox.init({
    container: commentBox.value,
    objectId: props.articleId,
    isManager: props.isAuthor,
  });
});

onUnmounted(() => {
  CommentBox.destroy(commentBox.value);
});
</script>
```

## 옵션

```typescript
interface CommentBoxOptions {
  // 필수
  container: string | HTMLElement;  // 마운트할 DOM 요소
  objectId: string;                 // 댓글 대상 ID

  // API 설정
  api?: CommentAPI;                 // 커스텀 API 인스턴스
  apiUrl?: string;                  // API URL

  // UI 설정
  pageSize?: number;                // 페이지당 댓글 수 (기본: 10)
  formation?: Formation[];          // UI 구성 ['count', 'write', 'list', 'page']
  isManager?: boolean;              // 관리자 여부

  // 테마
  theme?: 'light' | 'dark';         // 테마 (기본: light)
  responsive?: boolean;             // 반응형 (기본: true)

  // 다국어
  locale?: 'ko' | 'en';             // 언어 (기본: ko)

  // 인증
  auth?: {
    isLoggedIn: () => boolean;
    getUserInfo: () => UserInfo | null;
    onLoginRequired?: () => void;
  };

  // 콜백
  onReady?: () => void;
  onError?: (error: Error) => void;
  onCommentAdd?: (comment: Comment) => void;
  onCommentUpdate?: (comment: Comment) => void;
  onCommentDelete?: (commentId: string) => void;
  onReplyAdd?: (reply: Comment, parentId: string) => void;
}
```

## API

### CommentBox

```typescript
// 초기화
const instance = CommentBox.init(options);

// 인스턴스 조회
const instance = CommentBox.getInstance('#comment-box');

// 정리
CommentBox.destroy('#comment-box');

// 모든 인스턴스 정리
CommentBox.destroyAll();
```

### CommentBoxInstance

```typescript
// 새로고침
await instance.refresh();

// 이벤트 리스너
const unsubscribe = instance.on('comment:add', (comment) => {
  console.log('New comment:', comment);
});

// 상태 조회
const state = instance.getState();

// 정리
instance.destroy();
```

## 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 테스트
npm test

# 타입 체크
npm run typecheck
```

## 라이선스

MIT
