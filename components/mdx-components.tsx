import type { MDXComponents } from 'mdx/types';
import { cn } from '@/lib/utils';
import { CopyButton } from './copy-button';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    pre: ({ children, className, ...props }) => {
       return (
        <div className="relative group">
           <pre className={cn("overflow-x-auto rounded-lg p-4 my-4 text-sm leading-6", className)} {...props}>
             {children}
           </pre>
           <CopyButton text="" className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
       )
    },
  };
}
