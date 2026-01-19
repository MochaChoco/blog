import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function addBasePath(src: string): string {
  if (!src) return src;
  if (!BASE_PATH) return src;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith(BASE_PATH)) return src;
  if (src.startsWith("/")) return `${BASE_PATH}${src}`;
  return src;
}

interface MdxJsxAttribute {
  type: "mdxJsxAttribute";
  name: string;
  value: string | { type: string; value: string } | null;
}

interface MdxJsxElement {
  type: "mdxJsxFlowElement" | "mdxJsxTextElement";
  name: string | null;
  attributes: MdxJsxAttribute[];
}

export function rehypeBasePath() {
  return (tree: Root) => {
    // Handle regular HTML img elements
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "img" && node.properties?.src) {
        const src = node.properties.src;
        if (typeof src === "string") {
          node.properties.src = addBasePath(src);
        }
      }
    });

    // Handle MDX JSX img elements
    visit(tree, ["mdxJsxFlowElement", "mdxJsxTextElement"], (node: unknown) => {
      const jsxNode = node as MdxJsxElement;
      if (jsxNode.name === "img" && jsxNode.attributes) {
        const srcAttr = jsxNode.attributes.find(
          (attr): attr is MdxJsxAttribute =>
            attr.type === "mdxJsxAttribute" && attr.name === "src"
        );
        if (srcAttr && typeof srcAttr.value === "string") {
          srcAttr.value = addBasePath(srcAttr.value);
        }
      }
    });
  };
}
