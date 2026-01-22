import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata("/about");

export default function AboutPage() {
  return (
    <div className="space-y-10 max-w-3xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          About Me
        </h1>
        <p className="text-lg text-muted-foreground sm:text-xl">
          안녕하세요. 프론트엔드 개발자 소원진입니다. 사용자 경험과 성능, 그리고
          팀의 개발 경험(DX)을 함께 개선하는 일을 좋아합니다.
        </p>
      </div>
      <hr />
      <section className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight">Summary</h2>
        <p className="text-muted-foreground">
          Next.js/Nuxt 기반 프로젝트에서 성능·인증·배포 이슈를 해결해왔습니다.
          시행착오와 해결 과정을 글로 정리하며 더 나은 구조를 고민합니다.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight">Focus</h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-2">
          <li>SSR/CSR 경계에서의 성능 최적화와 캐싱</li>
          <li>다국어(i18n) 및 URL/서브도메인 기반 라우팅 설계</li>
          <li>Docker 멀티 스테이지 빌드와 배포 효율화</li>
          <li>웹 보안 및 인증 흐름 강화 (XSS, 세션 검증 등)</li>
          <li>브라우저 호환성/인터랙션 이슈 해결 (Safari, 애니메이션 등)</li>
        </ul>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight">Experience</h2>
        <p className="text-muted-foreground">
          관리/통계용 내부 시스템과 브랜드 사이트를 개발했습니다. WebView 환경
          대응을 포함해 i18n·도메인 구성부터 빌드/배포 최적화, 보안 대응까지
          제품의 완성도를 끌어올리는 일에 집중해왔습니다.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight">Links</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <a
            href="https://github.com/MochaChoco"
            className="font-semibold text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </section>
    </div>
  );
}
