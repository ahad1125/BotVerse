import React, { useState } from "react";
import { toast } from "./ui/toast";
import { Button } from "@/components/ui/button";
import { Copy, Check, Code, Link2, ExternalLink } from "lucide-react";

function EmbedCodeSection({ botId }) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const apiHost = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://127.0.0.1:8000';
  const snippet = `<script src='${apiHost}/static/widget.js' data-bot-id=${botId}></script>`;
  const publicLink = `${window.location.origin}/chat/${botId}`;

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopiedLink(true);
      toast.add({
        title: "Copied!",
        description: "Public link copied to clipboard.",
        type: "success",
      });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      toast.add({
        title: "Copy failed",
        description: "Failed to copy public link.",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Embed Snippet Card */}
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Paste this snippet before the closing <code>&lt;/body&gt;</code> tag on your website.
          </p>
          <Button
            onClick={handleCopy}
            size="sm"
            className="gap-2 w-full sm:w-auto shrink-0"
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

      {/* Public Link Card */}
      <div className="rounded-xl border bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Link2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight">Public Chat Link</h3>
            <p className="text-xs text-muted-foreground">
              Share this link directly with your users.
            </p>
          </div>
        </div>

        <div className="relative">
          <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs text-zinc-100 border border-zinc-800 leading-relaxed">
            <code>{publicLink}</code>
          </pre>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Anyone with this link can chat with your bot — no login required.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => window.open(publicLink, '_blank', 'noreferrer')}
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </Button>
            <Button
              onClick={handleCopyLink}
              size="sm"
              className="gap-2 w-full sm:w-auto shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmbedCodeSection;
