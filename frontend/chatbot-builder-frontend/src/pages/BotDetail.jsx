import { useNavigate, useParams } from "react-router-dom";
import useBot from "../hooks/useBot";
import { useState } from "react";
import CreateKnowledgeSourceUpload from "../components/CreateKnowledgeSourceUpload";
import useKnowledgeSources from "../hooks/useKnowledgeSources";
import useDeleteKnowledgeSource from "../hooks/useDeleteKnowledgeSource";
import useRetryKnowledgeSource from "../hooks/useRetryKnowledgeSource";
import CreateBotModal from "../components/CreateBotModal";
import api from "../api/axios";
import { motion } from "framer-motion";

import { ArrowLeft } from "lucide-react";
import EmbedCodeSection from "@/components/EmbedCodeSection";
import QuickRepliesManager from "@/components/QuickRepliesManager";
import LeadsTable from "@/components/LeadsTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

function BotDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { data: bot, isLoading, isError } = useBot(id);
  const retryMutation = useRetryKnowledgeSource(id);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { data: knowledgeSources, isLoading: sourcesLoading } =
    useKnowledgeSources(id);
  const deleteMutation = useDeleteKnowledgeSource(id);
  const [deleteSourceId, setDeleteSourceId] = useState(null);

  const getSourceName = (source) => {
    if (source.file) return source.file.split("/").pop();
    if (source.source_url) return source.source_url;
    if (source.text_content) return source.text_content.slice(0, 50) + "...";
    return "Unknown Source";
  };

  const statusStyles = {
    processed: "bg-green-100 text-green-700",
    processing: "bg-yellow-100 text-yellow-700",
    pending: "bg-muted text-muted-foreground",
    failure: "bg-red-100 text-red-700",
  };

  const handleDelete = (sourceId) => {
    setDeleteSourceId(sourceId);
  };

  const handleConfirmDelete = () => {
    if (!deleteSourceId) return;
    deleteMutation.mutate(deleteSourceId, {
      onSuccess: () => {
        toast.add({
          title: "Source deleted",
          description: "Successfully deleted the knowledge source.",
          type: "success",
        });
        setDeleteSourceId(null);
      },
      onError: (err) => {
        toast.add({
          title: "Error",
          description: err?.message || "Failed to delete knowledge source.",
          type: "error",
        });
        setDeleteSourceId(null);
      }
    });
  };

  const handleRetry = (sourceId) => {
    retryMutation.mutate(sourceId, {
      onSuccess: () => {
        toast.add({
          title: "Retry queued",
          description: "Processing retry for the knowledge source.",
          type: "success",
        });
      },
      onError: (err) => {
        toast.add({
          title: "Error",
          description: err?.message || "Failed to queue retry.",
          type: "error",
        });
      }
    });
  };

  const handleDownloadQR = async () => {
    try {
      const res = await api.get(`/bots/${id}/qr-code/`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${bot.name}-qr-code.png`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.add({
        title: "Download complete",
        description: "QR code has been successfully downloaded.",
        type: "success",
      });
    } catch (err) {
      toast.add({
        title: "Download failed",
        description: "Failed to download QR code.",
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto mt-10 max-w-lg rounded-xl border p-6 text-center">
        <p className="text-sm text-destructive">Bot not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 gap-1 text-muted-foreground -ml-2"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {bot.avatar ? (
              <img
                src={bot.avatar}
                alt={bot.name}
                className="h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground shrink-0">
                {bot.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                  {bot.name}
                </h1>
                <Badge variant={bot.is_active ? "default" : "secondary"}>
                  {bot.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                {bot.business_name || "No business name"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none text-xs"
              onClick={() => navigate(`/bots/${id}/chat`)}
            >
              Open Playground
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none text-xs"
              onClick={() => navigate(`/bots/${id}/analytics`)}
            >
              Analytics
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none text-xs"
              onClick={handleDownloadQR}
            >
              QR Code
            </Button>
            <Button
              size="sm"
              className="flex-1 sm:flex-none text-xs"
              onClick={() => setIsEditOpen(true)}
            >
              Edit Bot
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <div className="w-full overflow-x-auto no-scrollbar pb-1">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sources">Knowledge Sources</TabsTrigger>
            <TabsTrigger value="quick-replies">Quick Replies</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
          </TabsList>
        </div>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6 pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-4">
              <h3 className="text-sm text-muted-foreground">Language</h3>
              <p className="mt-1 font-medium capitalize">{bot.language}</p>
            </div>
            <div className="rounded-xl border p-4">
              <h3 className="text-sm text-muted-foreground">Category</h3>
              <p className="mt-1 font-medium capitalize">{bot.category}</p>
            </div>
            <div className="rounded-xl border p-4">
              <h3 className="text-sm text-muted-foreground">Tone</h3>
              <p className="mt-1 font-medium capitalize">{bot.tone}</p>
            </div>
            <div className="rounded-xl border p-4">
              <h3 className="text-sm text-muted-foreground">Timezone</h3>
              <p className="mt-1 font-medium">{bot.timezone}</p>
            </div>
            <div className="rounded-xl border p-4">
              <h3 className="text-sm text-muted-foreground">Primary Color</h3>
              <div className="mt-2 flex items-center gap-3">
                <div
                  className="h-6 w-6 rounded-full border"
                  style={{ backgroundColor: bot.primary_color }}
                />
                <span className="font-medium">{bot.primary_color}</span>
              </div>
            </div>
            <div className="rounded-xl border p-4">
              <h3 className="text-sm text-muted-foreground">Created</h3>
              <p className="mt-1 font-medium">
                {new Date(bot.created_at).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="mb-2 font-medium">Greeting Message</h2>
            <p className="text-sm text-muted-foreground">
              {bot.greeting_message}
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="mb-2 font-medium">Fallback Message</h2>
            <p className="text-sm text-muted-foreground">
              {bot.fallback_message}
            </p>
          </div>
        </TabsContent>

        {/* Knowledge Sources */}
        <TabsContent value="sources" className="space-y-4 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-semibold">Knowledge Sources</h2>
              <Badge variant="secondary">{knowledgeSources?.count ?? 0}</Badge>
            </div>
            <Button onClick={() => setIsUploadOpen(true)} size="sm">+ Add Source</Button>
          </div>

          {sourcesLoading ? (
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-lg bg-muted" />
              <div className="h-20 animate-pulse rounded-lg bg-muted" />
              <div className="h-20 animate-pulse rounded-lg bg-muted" />
            </div>
          ) : knowledgeSources?.results?.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 sm:p-10 text-center">
              <h3 className="font-medium text-base">No knowledge sources yet</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                Upload PDFs, websites, YouTube videos, or text to train this
                chatbot.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {knowledgeSources?.results?.map((source) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3.5 sm:p-4"
                >
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm sm:text-base truncate">{getSourceName(source)}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Uploaded {new Date(source.created_at).toLocaleString()}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground mt-0.5">
                      {source.source_type}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-border/60">
                    <Dialog>
                      <DialogTrigger className="text-xs text-muted-foreground hover:text-foreground hover:underline px-2 py-1">
                        View Text
                      </DialogTrigger>
                      <DialogContent className="w-[calc(100vw-2rem)] sm:w-full max-h-[75vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-base truncate">{getSourceName(source)}</DialogTitle>
                        </DialogHeader>
                        <p className="whitespace-pre-wrap text-xs sm:text-sm text-muted-foreground">
                          {source.extracted_text ||
                            "No extracted text available."}
                        </p>
                      </DialogContent>
                    </Dialog>

                    {source.file && (
                      <a
                        href={source.file}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline px-2 py-1"
                      >
                        Open
                      </a>
                    )}

                    {source.source_url && (
                      <a
                        href={source.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline px-2 py-1"
                      >
                        Open
                      </a>
                    )}

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        statusStyles[source.status] || statusStyles.pending
                      }`}
                    >
                      {source.status}
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive h-8 px-2 text-xs"
                      onClick={() => handleDelete(source.id)}
                    >
                      Delete
                    </Button>

                    {(source.status === "failure" ||
                      source.status === "pending") && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 px-2.5 text-xs"
                        onClick={() => handleRetry(source.id)}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <CreateKnowledgeSourceUpload
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            botId={id}
          />
        </TabsContent>

        {/* Quick Replies */}
        <TabsContent value="quick-replies" className="pt-6">
          <QuickRepliesManager botId={id} />
        </TabsContent>

        {/* Leads */}
        <TabsContent value="leads" className="pt-6">
          <LeadsTable botId={id} />
        </TabsContent>

        {/* Embed */}
        <TabsContent value="embed" className="pt-6">
          <EmbedCodeSection botId={id} />
        </TabsContent>
      </Tabs>

      <CreateBotModal
        isOpen={isEditOpen}
        isClose={() => setIsEditOpen(false)}
        bot={bot}
      />

      <ConfirmationDialog
        isOpen={deleteSourceId !== null}
        onClose={() => setDeleteSourceId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Knowledge Source"
        description="Are you sure you want to delete this knowledge source? This will remove all learned embeddings associated with this source and cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default BotDetail;
