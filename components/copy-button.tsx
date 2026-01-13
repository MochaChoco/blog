"use client";

import { Check, Copy } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [hasCopied, setHasCopied] = React.useState(false);

  const onClick = () => {
    // Attempt to copy from the closest code block if explicit text isn't provided or is empty
    const codeElement = document.querySelector('.group:hover pre code') || document.querySelector('.group:hover pre');
    const textToCopy = text || codeElement?.textContent || "";
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <button
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background p-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      onClick={onClick}
    >
      {hasCopied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="sr-only">Copy code</span>
    </button>
  );
}
