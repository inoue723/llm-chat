import { marked } from "marked";
import { memo, useMemo } from "react";

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

const MemoizedMarkdownBlock = memo(
  ({
    content,
    Markdown,
  }: {
    content: string;
    Markdown: React.FunctionComponent<{ content: string }>;
  }) => {
    return <Markdown content={content} />;
  },
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false;
    return true;
  },
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

export const MemoizedMarkdown = memo(
  ({
    content,
    id,
    Markdown,
  }: {
    content: string;
    id: string;
    Markdown: React.FunctionComponent<{ content: string }>;
  }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return blocks.map((block, index) => (
      <MemoizedMarkdownBlock
        content={block}
        Markdown={Markdown}
        // eslint-disable-next-line react/no-array-index-key
        key={`${id}-block_${index}`}
      />
    ));
  },
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";
