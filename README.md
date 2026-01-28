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

---

## 아키텍처

### 프로젝트 구조

```
ogq-comment-box/
├── src/
│   ├── core/                    # 핵심 로직
│   │   ├── CommentBox.ts        # 싱글톤 매니저
│   │   ├── CommentBoxInstance.ts # 개별 인스턴스
│   │   └── EventEmitter.ts      # 이벤트 시스템
│   ├── api/                     # API 레이어
│   │   ├── CommentAPI.ts        # 인터페이스 정의
│   │   └── MockAPI.ts           # Mock 구현
│   ├── ui/
│   │   ├── templates/           # DOM 템플릿
│   │   └── styles/              # SCSS 스타일
│   ├── utils/                   # 유틸리티
│   │   ├── sanitize.ts          # XSS 방지
│   │   ├── datetime.ts          # 시간 포맷
│   │   └── dom.ts               # DOM 헬퍼
│   ├── i18n/                    # 다국어 (ko, en)
│   ├── types/                   # TypeScript 타입
│   └── index.ts                 # 엔트리포인트
├── dist/                        # 빌드 결과물
├── examples/                    # 데모
└── tests/                       # 테스트
```

### 댓글 생성 흐름 (Mock API 기준)

사용자가 댓글을 작성하고 등록 버튼을 클릭했을 때의 전체 흐름입니다.

#### 1단계: 사용자 액션

```
textarea에 "안녕하세요!" 입력 → "등록" 버튼 클릭
```

#### 2단계: 이벤트 위임으로 클릭 감지

`CommentBoxInstance.ts`의 `setupEventDelegation()`에서 등록된 이벤트 리스너가 클릭을 감지합니다.

```typescript
// .cb-editor-submit 버튼 클릭 시
delegate(container, '.cb-editor-submit', 'click', (_, target) => {
  const editor = target.closest('.cb-editor');
  this.handleEditorSubmit(editor);  // 다음 단계로 이동
});
```

#### 3단계: handleEditorSubmit() 실행

```typescript
private async handleEditorSubmit(editor: HTMLElement): Promise<void> {
  // 1) textarea에서 내용 추출
  const content = textarea?.value.trim();  // "안녕하세요!"

  // 2) 로그인 확인 (auth가 설정된 경우)
  if (auth && !auth.isLoggedIn()) {
    auth.onLoginRequired?.();
    return;
  }

  // 3) API 호출
  const comment = await this.api.createComment(objectId, {
    content: "안녕하세요!",
    author: userInfo,
  });

  // 4) 목록 새로고침
  await this.loadComments();
  textarea.value = '';
}
```

#### 4단계: MockAPI.createComment() 실행

```typescript
async createComment(objectId: string, data: CreateCommentData): Promise<Comment> {
  // 1) 네트워크 지연 시뮬레이션 (300ms)
  await this.simulateDelay();

  // 2) 새 댓글 객체 생성
  const newComment: Comment = {
    id: this.generateId(),        // "comment-100"
    objectId,                     // "notice-123"
    parentId: null,
    content: data.content,        // "안녕하세요!"
    author: data.author || { id: 'anonymous', nickname: '익명' },
    createdAt: now,
    replyCount: 0,
  };

  // 3) 메모리 배열 맨 앞에 추가
  this.comments.unshift(newComment);

  return newComment;
}
```

**MockAPI 내부 상태 변화:**

```javascript
// Before
this.comments = [
  { id: 'comment-1', content: '첫 번째 댓글...', ... },
  { id: 'comment-2', content: '두 번째 댓글...', ... },
];

// After
this.comments = [
  { id: 'comment-100', content: '안녕하세요!', ... },  // NEW
  { id: 'comment-1', content: '첫 번째 댓글...', ... },
  { id: 'comment-2', content: '두 번째 댓글...', ... },
];
```

#### 5단계: loadComments()로 목록 새로고침

```typescript
private async loadComments(): Promise<void> {
  // 1) MockAPI.getComments() 호출
  const response = await this.api.getComments({
    objectId,
    page: 0,
    pageSize: 10,
  });

  // 2) 상태 업데이트
  this.setState({
    comments: response.comments,
    totalCount: response.totalCount,
  });

  // 3) 화면 렌더링
  this.render();
}
```

#### 6단계: MockAPI.getComments() 실행

```typescript
async getComments(params): Promise<GetCommentsResponse> {
  // 1) 필터링: objectId 일치 + parentId가 null (일반 댓글만)
  const filtered = this.comments.filter(
    (c) => c.objectId === params.objectId && c.parentId === null
  );

  // 2) 최신순 정렬
  const sorted = filtered.sort((a, b) => b.createdAt - a.createdAt);

  // 3) 페이지네이션
  const paginated = sorted.slice(0, params.pageSize);

  return {
    comments: paginated,
    totalCount: filtered.length,
    hasNext: false,
    currentPage: 0,
  };
}
```

#### 7단계: render()로 화면 갱신

```typescript
private render(): void {
  this.renderHeader();      // "댓글 N개"
  this.renderEditor();      // 입력 폼 (비워진 상태)
  this.renderList();        // 댓글 목록
  this.renderPagination();  // 페이지네이션
}
```

#### 8단계: renderList()에서 HTML 생성

```typescript
private renderList(): void {
  const commentsHtml = comments.map((comment) =>
    commentItemTemplate(prefix, comment, messages, options)
  ).join('');

  this.elements.listWrapper.innerHTML = commentsHtml;
}
```

#### 최종 결과: 화면에 표시되는 HTML

```html
<div class="cb-comment-item" data-comment-id="comment-100">
  <div class="cb-comment-main">
    <div class="cb-avatar">
      <span class="cb-avatar-placeholder">익</span>
    </div>
    <div class="cb-comment-body">
      <div class="cb-comment-header">
        <span class="cb-author">익명</span>
        <span class="cb-time">오늘</span>
      </div>
      <div class="cb-comment-content">안녕하세요!</div>
      <div class="cb-comment-footer">
        <button class="cb-action-btn" data-action="reply">답글</button>
      </div>
    </div>
  </div>
</div>
```

### 전체 흐름 다이어그램

```
[사용자] "안녕하세요!" 입력 → 등록 클릭
         │
         ▼
[이벤트 위임] .cb-editor-submit 클릭 감지
         │
         ▼
[handleEditorSubmit] textarea 값 추출
         │
         ▼
[MockAPI.createComment]
  ├─ 새 Comment 객체 생성 (id: comment-100)
  ├─ this.comments 배열 맨 앞에 추가
  └─ 생성된 댓글 반환
         │
         ▼
[loadComments]
  ├─ MockAPI.getComments() 호출
  ├─ 필터링 + 정렬 + 페이지네이션
  └─ state.comments 업데이트
         │
         ▼
[render → renderList]
  ├─ commentItemTemplate()으로 HTML 생성
  └─ listWrapper.innerHTML에 삽입
         │
         ▼
[화면] 새 댓글이 목록 최상단에 표시됨
```

---

## 커스텀 API 연동

실제 백엔드 API와 연동하려면 `CommentAPI` 인터페이스를 구현합니다.

### API 인터페이스

```typescript
interface CommentAPI {
  getComments(params: GetCommentsParams): Promise<GetCommentsResponse>;
  createComment(objectId: string, data: CreateCommentData): Promise<Comment>;
  updateComment(commentId: string, data: UpdateCommentData): Promise<Comment>;
  deleteComment(commentId: string): Promise<void>;
  getReplies(parentId: string, params: GetRepliesParams): Promise<GetRepliesResponse>;
  createReply(parentId: string, data: CreateCommentData): Promise<Comment>;
}
```

### HttpAPI 구현 예시

```typescript
class HttpAPI implements CommentAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getComments(params: GetCommentsParams): Promise<GetCommentsResponse> {
    const url = new URL(`${this.baseUrl}/comments/${params.objectId}`);
    url.searchParams.set('page', String(params.page));
    url.searchParams.set('pageSize', String(params.pageSize));

    const response = await fetch(url.toString());
    return response.json();
  }

  async createComment(objectId: string, data: CreateCommentData): Promise<Comment> {
    const response = await fetch(`${this.baseUrl}/comments/${objectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // ... 나머지 메서드 구현
}
```

### 사용 예시

```typescript
import CommentBox, { HttpAPI } from '@nom/comment-box';

const api = new HttpAPI('/api');

CommentBox.init({
  container: '#comment-box',
  objectId: 'article-123',
  api,  // 커스텀 API 주입
});
```

---

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

### npm link로 로컬 개발

```bash
# ogq-comment-box 폴더에서
npm link

# nom-market-front 폴더에서
npm link @nom/comment-box
```

---

## 라이선스

MIT
