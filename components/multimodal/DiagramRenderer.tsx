'use client';
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface Props {
  code?: string | null;
}

/** Sanitize Mermaid code for better compatibility with Mermaid 10. */
function sanitizeMermaidCode(raw: string): string {
  let code = raw.trim();
  // Strip markdown code fences
  code = code.replace(/^```(?:mermaid)?\s*\n?|\n?```$/g, '').trim();
  // Mermaid 10 uses "flowchart" not "graph"
  code = code.replace(/\bgraph\s+(TD|LR|BT|RL)\b/gi, 'flowchart $1');
  // Wrap node labels that contain space/comma/parens in double quotes (Mermaid 10)
  code = code.replace(/\[([^["\]]+)\]/g, (_, label) => {
    if (!/[\s(),]/.test(label)) return `[${label}]`;
    const escaped = label.replace(/"/g, '#quot;');
    return `["${escaped}"]`;
  });
  return code;
}

/** Minimal valid Mermaid diagram used as fallback when render fails. */
const FALLBACK_DIAGRAM = 'flowchart TD\n  A["Concept"] --> B["Overview"]';

export default function DiagramRenderer({ code }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const rawCode = typeof code === 'string' && code.trim() ? code.trim() : null;

    if (!container) return;
    setError(null);

    if (!rawCode) {
      container.innerHTML = '';
      return;
    }

    const safeCode = sanitizeMermaidCode(rawCode);
    let cancelled = false;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });

    const tryRender = (mermaidCode: string): Promise<void> => {
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      container.innerHTML = `<div class="mermaid" id="${id}">${mermaidCode}</div>`;
      // suppressErrors: false so we catch syntax errors and can show fallback
      return mermaid.run({
        querySelector: `#${id}`,
        suppressErrors: false,
        postRenderCallback: () => {
          if (!cancelled) setError(null);
        },
      });
    };

    tryRender(safeCode)
      .catch(() => {
        if (cancelled) return;
        return tryRender(FALLBACK_DIAGRAM);
      })
      .then(() => {
        if (!cancelled) setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.warn('Mermaid render error:', err);
        setError('Diagram could not be rendered. Try a simpler topic.');
        if (containerRef.current) {
          containerRef.current.innerHTML =
            '<p class="text-gray-500 text-sm p-4">Diagram could not be rendered. The AI may have generated invalid Mermaid syntax.</p>';
        }
      });

    return () => {
      cancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [code]);

  if (typeof code !== 'string' || !code.trim()) {
    return (
      <div className="w-full overflow-x-auto bg-gray-900/50 p-6 rounded-xl border border-white/10 flex justify-center">
        <p className="text-gray-500 text-sm">No diagram provided.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-gray-900/50 p-6 rounded-xl border border-white/10 flex justify-center">
      {error ? (
        <p className="text-amber-400/90 text-sm">{error}</p>
      ) : (
        <div ref={containerRef} className="min-w-[300px]" />
      )}
    </div>
  );
}
