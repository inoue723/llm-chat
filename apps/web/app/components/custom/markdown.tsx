import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/cjs/styles/prism";

export function getMarkdown(theme?: string) {
  return ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        components={{
          code(props) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || "");
            const language = match?.[1];

            return language ? (
              <SyntaxHighlighter
                PreTag="div"
                language={language}
                style={theme === "dark" ? oneDark : oneLight}
                customStyle={{
                  margin: 0,
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className="bg-muted text-muted-foreground px-1 py-0.5 rounded text-sm font-mono"
                {...rest}
              >
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <div>{children}</div>;
          },
          blockquote(props) {
            const { node, ...rest } = props;
            return (
              <blockquote
                className="border-l-4 border-border pl-4 italic text-muted-foreground my-4"
                {...rest}
              >
                {props.children}
              </blockquote>
            );
          },
          table(props) {
            const { node, ...rest } = props;
            return (
              <div className="overflow-x-auto">
                <table
                  className="min-w-full border border-border rounded-lg"
                  {...rest}
                >
                  {props.children}
                </table>
              </div>
            );
          },
          th(props) {
            const { node, ...rest } = props;
            return (
              <th
                className="border border-border bg-secondary px-3 py-2 text-left font-semibold"
                {...rest}
              >
                {props.children}
              </th>
            );
          },
          td(props) {
            const { node, ...rest } = props;
            return (
              <td
                className="border border-border px-3 py-2"
                {...rest}
              >
                {props.children}
              </td>
            );
          },
          ul(props) {
            const { node, ...rest } = props;
            return (
              <ul className="list-disc list-inside space-y-1 my-4" {...rest}>
                {props.children}
              </ul>
            );
          },
          ol(props) {
            const { node, ...rest } = props;
            return (
              <ol className="list-decimal list-inside space-y-1 my-4" {...rest}>
                {props.children}
              </ol>
            );
          },
          h1(props) {
            const { node, ...rest } = props;
            return (
              <h1
                className="text-2xl font-bold text-foreground mt-6 mb-4"
                {...rest}
              >
                {props.children}
              </h1>
            );
          },
          h2(props) {
            const { node, ...rest } = props;
            return (
              <h2
                className="text-xl font-bold text-foreground mt-5 mb-3"
                {...rest}
              >
                {props.children}
              </h2>
            );
          },
          h3(props) {
            const { node, ...rest } = props;
            return (
              <h3
                className="text-lg font-semibold text-foreground mt-4 mb-3"
                {...rest}
              >
                {props.children}
              </h3>
            );
          },
          p(props) {
            const { node, ...rest } = props;
            return (
              <p className="my-3 leading-relaxed" {...rest}>
                {props.children}
              </p>
            );
          },
          a(props) {
            const { node, ...rest } = props;
            return (
              <a
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                target="_blank"
                rel="noopener noreferrer"
                {...rest}
              >
                {props.children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };
}
