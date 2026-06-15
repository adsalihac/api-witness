"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Check, Copy, Terminal } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
  terminal?: boolean;
  highlight?: boolean;
  typing?: boolean;
  lines?: boolean;
}

function highlightSyntax(code: string): React.ReactNode[] {
  const lines = code.split("\n");
  return lines.map((line, i) => {
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let key = 0;

    const patterns: [RegExp, string][] = [
      [/\/\/.*$/g, "text-neutral-500 italic"],
      [/"([^"\\]|\\.)*"/g, "text-emerald-400"],
      [/'([^'\\]|\\.)*'/g, "text-emerald-400"],
      [/\`([^\`\\]|\\.)*\`/g, "text-emerald-400"],
      [/\b(import|from|export|default|return|function|const|let|var|async|await|if|else|for|of|in|true|false|null|undefined|new|try|catch|throw|class|extends|type|interface|enum|as)\b/g, "text-violet-400"],
      [/\b\d+\.?\d*\b/g, "text-amber-400"],
      [/\b(useEffect|useState|useCallback|useRef|useMemo|useLayoutEffect|useReducer|useContext)\b/g, "text-cyan-400"],
      [/\b(Stack|StatusBar|axios|AxiosInstance|AxiosResponse|AxiosError)\b/g, "text-blue-400"],
      [/\/\*[\s\S]*?\*\//g, "text-neutral-500 italic"],
    ];

    let lastIndex = 0;
    const matches: { index: number; end: number; text: string; cls: string }[] = [];

    patterns.forEach(([regex, cls]) => {
      regex.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = regex.exec(line)) !== null) {
        matches.push({ index: m.index, end: m.index + m[0].length, text: m[0], cls });
      }
    });

    matches.sort((a, b) => a.index - b.index);

    let pos = 0;
    for (const match of matches) {
      if (match.index < pos) continue;
      if (match.index > pos) {
        tokens.push(<span key={key++} className="text-neutral-300">{escapeHtml(line.slice(pos, match.index))}</span>);
      }
      tokens.push(<span key={key++} className={match.cls}>{escapeHtml(match.text)}</span>);
      pos = match.end;
    }
    if (pos < line.length) {
      tokens.push(<span key={key++} className="text-neutral-300">{escapeHtml(line.slice(pos))}</span>);
    }
    if (tokens.length === 0) {
      tokens.push(<span key={key++} className="text-neutral-500">&nbsp;</span>);
    }

    return (
      <div key={i} className="flex">
        <span className="w-8 flex-shrink-0 text-right pr-3 text-neutral-600 select-none text-xs leading-relaxed">{i + 1}</span>
        <span className="flex-1">{tokens}</span>
      </div>
    );
  });
}

function escapeHtml(text: string): string {
  return text;
}

function TypingCode({ code, onComplete }: { code: string; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      indexRef.current++;
      if (indexRef.current > code.length) {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
        return;
      }
      setDisplayed(code.slice(0, indexRef.current));
    }, 12);
    return () => clearInterval(interval);
  }, [code, done, onComplete]);

  return (
    <span>
      {displayed}
      {!done && <span className="inline-block w-[2px] h-4 bg-neutral-400 ml-0.5 animate-pulse align-middle" />}
    </span>
  );
}

export function CodeBlock({ code, language, filename, className, terminal, highlight, typing, lines }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [dotsHover, setDotsHover] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const content = () => {
    if (typing) {
      return <TypingCode code={code} />;
    }
    if (highlight) {
      return <>{highlightSyntax(code)}</>;
    }
    return <span className="text-neutral-300">{code}</span>;
  };

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden border shadow-lg transition-all duration-300",
        terminal
          ? "border-neutral-700 bg-neutral-950 shadow-neutral-900/30 hover:shadow-neutral-900/50 hover:border-neutral-600"
          : "border-neutral-800 bg-neutral-900 shadow-neutral-900/20 hover:shadow-neutral-900/40 hover:border-neutral-700",
        className
      )}
      onMouseEnter={() => setDotsHover(true)}
      onMouseLeave={() => setDotsHover(false)}
    >
      {/* Title bar */}
      <div className={cn(
        "flex items-center justify-between px-4 py-2.5 border-b transition-colors",
        terminal
          ? "bg-neutral-900/80 border-neutral-800"
          : "bg-neutral-800/50 border-neutral-800"
      )}>
        <div className="flex items-center gap-2">
          <span className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300", dotsHover ? "bg-red-500" : "bg-red-500/60")} />
          <span className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300", dotsHover ? "bg-amber-500" : "bg-amber-500/60")} />
          <span className={cn("w-2.5 h-2.5 rounded-full transition-all duration-300", dotsHover ? "bg-emerald-500" : "bg-emerald-500/60")} />
          {terminal && (
            <span className="ml-2 flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
              <Terminal className="w-3 h-3" />
              {filename || "terminal"}
            </span>
          )}
          {!terminal && filename && (
            <span className="ml-2 text-xs text-neutral-500 font-mono">{filename}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-neutral-500 hover:text-white transition-colors rounded-md hover:bg-neutral-700/50"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code area */}
      <pre className={cn(
        "p-4 sm:p-5 overflow-x-auto text-sm leading-relaxed font-mono relative",
        terminal ? "bg-neutral-950" : "bg-neutral-900"
      )}>
        {terminal ? (
          <code className="font-mono flex">
            <span className="text-emerald-400 select-none mr-2">$</span>
            <span className="flex-1 text-neutral-200">{code}</span>
            {!typing && <span className="inline-block w-[2px] h-4 bg-neutral-500 ml-0.5 animate-pulse" />}
          </code>
        ) : (
          <code className={cn("font-mono", highlight ? "" : "text-neutral-300", lines ? "" : "")}>
            {content()}
          </code>
        )}
      </pre>

      {/* Language badge */}
      {language && (
        <div className="absolute bottom-2 right-3 text-[0.6rem] text-neutral-600 font-mono bg-neutral-800 px-1.5 py-0.5 rounded">
          {language}
        </div>
      )}
    </div>
  );
}
