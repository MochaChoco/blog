/**
 * HTML 문자열로부터 DOM 엘리먼트 생성
 */
export function createElement<T extends HTMLElement>(html: string): T {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild as T;
}

/**
 * 엘리먼트에 이벤트 리스너 추가 (자동 정리를 위한 래퍼)
 */
export function addEvent<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (ev: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): () => void {
  element.addEventListener(type, listener, options);
  return () => element.removeEventListener(type, listener, options);
}

/**
 * 이벤트 위임을 위한 헬퍼
 */
export function delegate<T extends HTMLElement>(
  container: HTMLElement,
  selector: string,
  eventType: keyof HTMLElementEventMap,
  handler: (event: Event, target: T) => void
): () => void {
  const listener = (event: Event) => {
    const target = (event.target as Element).closest(selector) as T | null;
    if (target && container.contains(target)) {
      handler(event, target);
    }
  };

  container.addEventListener(eventType, listener);
  return () => container.removeEventListener(eventType, listener);
}

/**
 * 엘리먼트 표시/숨김
 */
export function show(element: HTMLElement): void {
  element.style.display = '';
  element.removeAttribute('hidden');
}

export function hide(element: HTMLElement): void {
  element.style.display = 'none';
  element.setAttribute('hidden', '');
}

export function toggle(element: HTMLElement, visible?: boolean): void {
  const shouldShow = visible ?? element.style.display === 'none';
  if (shouldShow) {
    show(element);
  } else {
    hide(element);
  }
}

/**
 * CSS 클래스 헬퍼
 */
export function addClass(element: HTMLElement, ...classes: string[]): void {
  element.classList.add(...classes);
}

export function removeClass(element: HTMLElement, ...classes: string[]): void {
  element.classList.remove(...classes);
}

export function toggleClass(
  element: HTMLElement,
  className: string,
  force?: boolean
): void {
  element.classList.toggle(className, force);
}

/**
 * 스크롤 관련 헬퍼
 */
export function scrollToElement(
  element: HTMLElement,
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' }
): void {
  element.scrollIntoView(options);
}

/**
 * 엘리먼트 내용 비우기
 */
export function empty(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * 컨테이너 셀렉터 또는 엘리먼트를 HTMLElement로 변환
 */
export function resolveContainer(
  container: string | HTMLElement
): HTMLElement | null {
  if (typeof container === 'string') {
    return document.querySelector(container);
  }
  return container;
}
