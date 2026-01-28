import type { CommentAPI } from '../api/CommentAPI';
import type { Comment } from '../types/comment';
import type { NormalizedOptions } from '../types/options';
import { EventEmitter, EVENTS } from './EventEmitter';
import { formatMessage } from '../i18n';
import {
  containerTemplate,
  headerTemplate,
  editorTemplate,
  commentItemTemplate,
  replyItemTemplate,
  emptyTemplate,
  loadingTemplate,
  paginationTemplate,
  loginRequiredTemplate,
} from '../ui/templates';
import {
  createElement,
  delegate,
  empty,
  show,
  hide,
  scrollToElement,
} from '../utils/dom';

interface State {
  comments: Comment[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  expandedReplies: Set<string>;
  replyEditors: Set<string>;
  editingComment: string | null;
}

/**
 * CommentBox 개별 인스턴스
 */
export class CommentBoxInstance {
  private options: NormalizedOptions;
  private api: CommentAPI;
  private emitter: EventEmitter;
  private state: State;
  private container: HTMLElement;
  private elements: {
    header: HTMLElement | null;
    editorWrapper: HTMLElement | null;
    listWrapper: HTMLElement | null;
    paginationWrapper: HTMLElement | null;
  };
  private cleanupFunctions: (() => void)[] = [];

  constructor(options: NormalizedOptions) {
    this.options = options;
    this.api = options.api;
    this.emitter = new EventEmitter();
    this.container = options.container;
    this.elements = {
      header: null,
      editorWrapper: null,
      listWrapper: null,
      paginationWrapper: null,
    };
    this.state = {
      comments: [],
      totalCount: 0,
      currentPage: 0,
      totalPages: 0,
      isLoading: false,
      error: null,
      expandedReplies: new Set(),
      replyEditors: new Set(),
      editingComment: null,
    };

    this.init();
  }

  private async init(): Promise<void> {
    try {
      this.renderContainer();
      this.setupEventDelegation();
      await this.loadComments();
      this.emitter.emit(EVENTS.READY);
      this.options.onReady?.();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private renderContainer(): void {
    const prefix = this.options.cssPrefix;
    const { formation, theme, responsive } = this.options;

    // 메인 컨테이너 생성
    const containerHtml = containerTemplate(prefix);
    const containerEl = createElement<HTMLElement>(containerHtml);

    // 테마 및 반응형 클래스 추가
    if (theme === 'dark') {
      containerEl.classList.add(`${prefix}-container--dark`);
    }
    if (responsive) {
      containerEl.classList.add(`${prefix}-container--responsive`);
    }

    // 기존 내용 비우고 새 컨테이너 추가
    empty(this.container);
    this.container.appendChild(containerEl);

    // 요소 참조 저장
    this.elements.header = containerEl.querySelector(`.${prefix}-header`);
    this.elements.editorWrapper = containerEl.querySelector(
      `.${prefix}-editor-wrapper`
    );
    this.elements.listWrapper = containerEl.querySelector(
      `.${prefix}-list-wrapper`
    );
    this.elements.paginationWrapper = containerEl.querySelector(
      `.${prefix}-pagination-wrapper`
    );

    // formation에 따라 요소 표시/숨김
    if (!formation.includes('count') && this.elements.header) {
      hide(this.elements.header);
    }
    if (!formation.includes('write') && this.elements.editorWrapper) {
      hide(this.elements.editorWrapper);
    }
    if (!formation.includes('page') && this.elements.paginationWrapper) {
      hide(this.elements.paginationWrapper);
    }
  }

  private setupEventDelegation(): void {
    const prefix = this.options.cssPrefix;

    // 에디터 제출
    const cleanupSubmit = delegate(
      this.container,
      `.${prefix}-editor-submit`,
      'click',
      (_, target) => {
        const editor = target.closest(`.${prefix}-editor`) as HTMLElement;
        this.handleEditorSubmit(editor);
      }
    );
    this.cleanupFunctions.push(cleanupSubmit);

    // 에디터 취소
    const cleanupCancel = delegate(
      this.container,
      `.${prefix}-editor-cancel`,
      'click',
      (_, target) => {
        const editor = target.closest(`.${prefix}-editor`) as HTMLElement;
        this.handleEditorCancel(editor);
      }
    );
    this.cleanupFunctions.push(cleanupCancel);

    // 댓글 액션 (답글, 수정, 삭제)
    const cleanupAction = delegate(
      this.container,
      `.${prefix}-action-btn`,
      'click',
      (_, target) => {
        const action = target.dataset.action;
        const commentId = target.dataset.commentId;
        if (action && commentId) {
          this.handleAction(action, commentId);
        }
      }
    );
    this.cleanupFunctions.push(cleanupAction);

    // 대댓글 토글
    const cleanupReplyToggle = delegate(
      this.container,
      `.${prefix}-reply-toggle`,
      'click',
      (_, target) => {
        const commentId = target.dataset.commentId;
        if (commentId) {
          this.toggleReplies(commentId);
        }
      }
    );
    this.cleanupFunctions.push(cleanupReplyToggle);

    // 페이지네이션
    const cleanupPage = delegate(
      this.container,
      `.${prefix}-page-btn`,
      'click',
      (_, target) => {
        const page = target.dataset.page;
        const isDisabled = (target as HTMLButtonElement).disabled;
        if (page !== undefined && !isDisabled) {
          this.goToPage(parseInt(page, 10));
        }
      }
    );
    this.cleanupFunctions.push(cleanupPage);
  }

  private async loadComments(): Promise<void> {
    const { objectId, pageSize } = this.options;

    this.setState({ isLoading: true, error: null });
    this.renderLoading();

    try {
      const response = await this.api.getComments({
        objectId,
        page: this.state.currentPage,
        pageSize,
      });

      this.setState({
        comments: response.comments,
        totalCount: response.totalCount,
        totalPages: Math.ceil(response.totalCount / pageSize),
        isLoading: false,
      });

      this.render();
      this.emitter.emit(EVENTS.COMMENTS_LOADED, response);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private render(): void {
    this.renderHeader();
    this.renderEditor();
    this.renderList();
    this.renderPagination();
  }

  private renderHeader(): void {
    if (!this.elements.header) return;
    const { cssPrefix, messages } = this.options;

    this.elements.header.innerHTML = headerTemplate(
      cssPrefix,
      this.state.totalCount,
      messages
    );
  }

  private renderEditor(): void {
    if (!this.elements.editorWrapper) return;
    const { cssPrefix, messages, auth } = this.options;

    // 로그인 확인
    if (auth && !auth.isLoggedIn()) {
      this.elements.editorWrapper.innerHTML = loginRequiredTemplate(
        cssPrefix,
        messages
      );
      return;
    }

    this.elements.editorWrapper.innerHTML = editorTemplate(cssPrefix, messages);
  }

  private renderList(): void {
    if (!this.elements.listWrapper) return;
    const { cssPrefix, messages, isManager, auth } = this.options;
    const { comments } = this.state;

    if (comments.length === 0) {
      this.elements.listWrapper.innerHTML = emptyTemplate(cssPrefix, messages);
      return;
    }

    const currentUserId = auth?.getUserInfo()?.id;

    const commentsHtml = comments
      .map((comment) =>
        commentItemTemplate(cssPrefix, comment, messages, {
          isOwner: currentUserId === comment.author.id,
          showManagerBadge: isManager,
        })
      )
      .join('');

    this.elements.listWrapper.innerHTML = commentsHtml;

    // 확장된 대댓글 복원
    this.state.expandedReplies.forEach((commentId) => {
      this.loadReplies(commentId);
    });
  }

  private renderLoading(): void {
    if (!this.elements.listWrapper) return;
    this.elements.listWrapper.innerHTML = loadingTemplate(this.options.cssPrefix);
  }

  private renderPagination(): void {
    if (!this.elements.paginationWrapper) return;
    const { cssPrefix } = this.options;
    const { currentPage, totalPages } = this.state;

    this.elements.paginationWrapper.innerHTML = paginationTemplate(
      cssPrefix,
      currentPage,
      totalPages
    );
  }

  private async handleEditorSubmit(editor: HTMLElement): Promise<void> {
    const { cssPrefix, auth, objectId } = this.options;
    const textarea = editor.querySelector(
      `.${cssPrefix}-editor-textarea`
    ) as HTMLTextAreaElement;
    const content = textarea?.value.trim();

    if (!content) return;

    // 로그인 확인
    if (auth && !auth.isLoggedIn()) {
      auth.onLoginRequired?.();
      return;
    }

    const parentId = editor.dataset.parentId;
    const isReply = !!parentId;
    const isEdit = editor.classList.contains(`${cssPrefix}-editor--edit`);

    try {
      if (isEdit) {
        const commentId = editor.dataset.commentId;
        if (commentId) {
          const updated = await this.api.updateComment(commentId, { content });
          this.emitter.emit(EVENTS.COMMENT_UPDATE, updated);
          this.options.onCommentUpdate?.(updated);
        }
      } else if (isReply && parentId) {
        const userInfo = auth?.getUserInfo();
        const reply = await this.api.createReply(parentId, {
          content,
          author: userInfo
            ? {
                id: userInfo.id,
                nickname: userInfo.nickname,
                profileUrl: userInfo.profileUrl,
                isManager: this.options.isManager,
              }
            : undefined,
        });
        this.emitter.emit(EVENTS.REPLY_ADD, { reply, parentId });
        this.options.onReplyAdd?.(reply, parentId);
      } else {
        const userInfo = auth?.getUserInfo();
        const comment = await this.api.createComment(objectId, {
          content,
          author: userInfo
            ? {
                id: userInfo.id,
                nickname: userInfo.nickname,
                profileUrl: userInfo.profileUrl,
                isManager: this.options.isManager,
              }
            : undefined,
        });
        this.emitter.emit(EVENTS.COMMENT_ADD, comment);
        this.options.onCommentAdd?.(comment);
      }

      // 새로고침
      await this.loadComments();
      textarea.value = '';

      // 답글 에디터인 경우 숨기기
      if (isReply && parentId) {
        this.hideReplyEditor(parentId);
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private handleEditorCancel(editor: HTMLElement): void {
    const parentId = editor.dataset.parentId;
    if (parentId) {
      this.hideReplyEditor(parentId);
    }

    const commentId = editor.dataset.commentId;
    if (commentId) {
      this.cancelEdit(commentId);
    }
  }

  private handleAction(action: string, commentId: string): void {
    switch (action) {
      case 'reply':
        this.showReplyEditor(commentId);
        break;
      case 'edit':
        this.startEdit(commentId);
        break;
      case 'delete':
        this.deleteComment(commentId);
        break;
    }
  }

  private showReplyEditor(parentId: string): void {
    const { cssPrefix, messages } = this.options;
    const wrapper = this.container.querySelector(
      `.${cssPrefix}-reply-editor-wrapper[data-parent-id="${parentId}"]`
    ) as HTMLElement;

    if (!wrapper) return;

    wrapper.innerHTML = editorTemplate(cssPrefix, messages, {
      mode: 'reply',
      parentId,
    });
    show(wrapper);

    const textarea = wrapper.querySelector(
      `.${cssPrefix}-editor-textarea`
    ) as HTMLTextAreaElement;
    textarea?.focus();

    this.state.replyEditors.add(parentId);
  }

  private hideReplyEditor(parentId: string): void {
    const { cssPrefix } = this.options;
    const wrapper = this.container.querySelector(
      `.${cssPrefix}-reply-editor-wrapper[data-parent-id="${parentId}"]`
    ) as HTMLElement;

    if (wrapper) {
      empty(wrapper);
      hide(wrapper);
    }

    this.state.replyEditors.delete(parentId);
  }

  private async toggleReplies(commentId: string): Promise<void> {
    const { cssPrefix, messages } = this.options;
    const { expandedReplies } = this.state;

    const repliesEl = this.container.querySelector(
      `.${cssPrefix}-replies[data-parent-id="${commentId}"]`
    ) as HTMLElement;
    const toggleBtn = this.container.querySelector(
      `.${cssPrefix}-reply-toggle[data-comment-id="${commentId}"]`
    ) as HTMLButtonElement;

    if (!repliesEl || !toggleBtn) return;

    if (expandedReplies.has(commentId)) {
      // 접기
      hide(repliesEl);
      expandedReplies.delete(commentId);

      const comment = this.state.comments.find((c) => c.id === commentId);
      if (comment) {
        toggleBtn.textContent = formatMessage(messages.showReplies, {
          count: comment.replyCount,
        });
      }
    } else {
      // 펼치기
      expandedReplies.add(commentId);
      toggleBtn.textContent = messages.hideReplies;
      await this.loadReplies(commentId);
      show(repliesEl);
    }

    this.emitter.emit(EVENTS.REPLY_TOGGLE, { commentId, expanded: expandedReplies.has(commentId) });
  }

  private async loadReplies(parentId: string): Promise<void> {
    const { cssPrefix, messages, isManager, auth } = this.options;
    const repliesEl = this.container.querySelector(
      `.${cssPrefix}-replies[data-parent-id="${parentId}"]`
    ) as HTMLElement;

    if (!repliesEl) return;

    repliesEl.innerHTML = loadingTemplate(cssPrefix);
    show(repliesEl);

    try {
      const response = await this.api.getReplies(parentId, {
        page: 0,
        pageSize: 50,
      });

      const currentUserId = auth?.getUserInfo()?.id;

      const repliesHtml = response.replies
        .map((reply) =>
          replyItemTemplate(cssPrefix, reply, messages, {
            isOwner: currentUserId === reply.author.id,
            showManagerBadge: isManager,
          })
        )
        .join('');

      repliesEl.innerHTML = repliesHtml || emptyTemplate(cssPrefix, messages);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private startEdit(commentId: string): void {
    // 기존 구현에서는 간단하게 알림 처리
    // 실제로는 인라인 에디터로 교체해야 함
    console.warn('Edit feature - to be implemented inline', commentId);
  }

  private cancelEdit(_commentId: string): void {
    this.setState({ editingComment: null });
    this.render();
  }

  private async deleteComment(commentId: string): Promise<void> {
    const { messages } = this.options;

    if (!confirm(messages.confirmDelete)) {
      return;
    }

    try {
      await this.api.deleteComment(commentId);
      this.emitter.emit(EVENTS.COMMENT_DELETE, commentId);
      this.options.onCommentDelete?.(commentId);
      await this.loadComments();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private async goToPage(page: number): Promise<void> {
    if (page < 0 || page >= this.state.totalPages) return;

    this.setState({ currentPage: page });
    await this.loadComments();

    // 스크롤 이동
    scrollToElement(this.container);
    this.emitter.emit(EVENTS.PAGE_CHANGE, page);
  }

  private setState(partial: Partial<State>): void {
    this.state = { ...this.state, ...partial };
    this.emitter.emit(EVENTS.STATE_CHANGE, this.state);
  }

  private handleError(error: Error): void {
    console.error('[CommentBox Error]', error);
    this.setState({ error, isLoading: false });
    this.emitter.emit(EVENTS.ERROR, error);
    this.options.onError?.(error);
  }

  // Public API

  /**
   * 댓글 목록 새로고침
   */
  async refresh(): Promise<void> {
    await this.loadComments();
  }

  /**
   * 이벤트 리스너 등록
   */
  on<T = unknown>(event: string, handler: (data: T) => void): () => void {
    return this.emitter.on(event, handler);
  }

  /**
   * 현재 상태 조회
   */
  getState(): Readonly<State> {
    return { ...this.state };
  }

  /**
   * 인스턴스 정리
   */
  destroy(): void {
    this.cleanupFunctions.forEach((cleanup) => cleanup());
    this.cleanupFunctions = [];
    this.emitter.removeAllListeners();
    empty(this.container);
  }
}
