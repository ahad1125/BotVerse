import {
  useCreateQuickReply,
  useDeleteQuickReply,
  useQuickReplies,
} from "@/hooks/useQuickReplies";
import React, { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { X, MessageSquareReply } from "lucide-react";

function QuickRepliesManager({ botId }) {
  const [text, setText] = useState("");
  const { data } = useQuickReplies(botId);

  const createMutation = useCreateQuickReply(botId);
  const deleteMutation = useDeleteQuickReply(botId);

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    createMutation.mutate(trimmed, {
      onSuccess: () => {
        toast.add({
          title: "Quick reply added",
          description: `Successfully added suggestion: "${trimmed}"`,
          type: "success",
        });
        setText("");
      },
      onError: (err) => {
        toast.add({
          title: "Failed to add",
          description: err?.message || "Something went wrong.",
          type: "error",
        });
      }
    });
  };

  const handleDelete = (qrId, qrText) => {
    deleteMutation.mutate(qrId, {
      onSuccess: () => {
        toast.add({
          title: "Quick reply removed",
          description: `Successfully deleted suggestion: "${qrText}"`,
          type: "success",
        });
      },
      onError: (err) => {
        toast.add({
          title: "Failed to delete",
          description: err?.message || "Something went wrong.",
          type: "error",
        });
      }
    });
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 shadow-xs">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessageSquareReply className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Quick Replies</h3>
          <p className="text-xs text-muted-foreground">
            Suggested questions shown to users when a conversation starts.
          </p>
        </div>
      </div>

      {data?.results?.length > 0 ? (
        <div className="flex flex-wrap gap-2 py-2">
          {data.results.map((qr) => (
            <Badge key={qr.id} variant="secondary" className="pl-3 pr-1 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border">
              {qr.text}
              <button
                type="button"
                onClick={() => handleDelete(qr.id, qr.text)}
                disabled={deleteMutation.isPending}
                className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground py-2 italic">
          No quick replies configured. Add some below to help users start the chat.
        </p>
      )}

      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. What are your timings?"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          disabled={createMutation.isPending}
          className="flex-1"
        />

        <Button onClick={handleAdd} disabled={createMutation.isPending || !text.trim()}>
          {createMutation.isPending ? "Adding..." : "Add"}
        </Button>
      </div>
    </div>
  );
}

export default QuickRepliesManager;
