import React, { useState } from "react";
import { toast } from "./ui/toast";
import { Button } from "@/components/ui/button";
import { Copy, Check, Code } from "lucide-react";

function EmbedCodeSection({ botId }) {
  const [copied, setCopied] = useState(false);

  const snippet = `<script src='http://127.0.0.1:8000/static/widget.js' data-bot-id=${botId}></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      toast.add({
        title: "Copied!",
        description: "Embed snippet copied to clipboard.",
        type: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.add({
        title: "Copy failed",
        description: "Failed to copy embed snippet.",
        type: "error",
      });
    }
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 shadow-xs">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Code className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Embed Chatbot</h3>
          <p className="text-xs text-muted-foreground">
            Embed this bot on any website by adding the script snippet.
          </p>
        </div>
      </div>

      <div className="relative">
        <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs text-zinc-100 border border-zinc-800 leading-relaxed">
          <code>{snippet}</code>
        </pre>
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Paste this snippet before the closing <code>&lt;/body&gt;</code> tag on your website.
        </p>
        <Button
          onClick={handleCopy}
          size="sm"
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy Code
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default EmbedCodeSection;
