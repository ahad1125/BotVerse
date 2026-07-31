import React, { useState } from "react";
import { useCreateKnowledgeSources } from "../hooks/useCreateKnowledgeSources";
import { toast } from "./ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloud } from "lucide-react";

function CreateKnowledgeSourceUpload({ isOpen, onClose, botId }) {
  const createKnowledgeSourceMutation = useCreateKnowledgeSources(botId);

  const [sourceType, setSourceType] = useState("pdf");
  const [selectedFile, setSelectedFile] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const resetForm = () => {
    setSourceType("pdf");
    setSelectedFile(null);
    setTextContent("");
    setSourceUrl("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
    createKnowledgeSourceMutation.reset();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (["pdf", "docx", "csv"].includes(sourceType) && !selectedFile) {
      toast.add({
        title: "Validation Error",
        description: "Please select a file to upload.",
        type: "error",
      });
      return;
    }

    if (sourceType === "text" && !textContent.trim()) {
      toast.add({
        title: "Validation Error",
        description: "Please enter some text content.",
        type: "error",
      });
      return;
    }

    if (
      (sourceType === "youtube" || sourceType === "url") &&
      !sourceUrl.trim()
    ) {
      toast.add({
        title: "Validation Error",
        description: "Please enter a valid URL.",
        type: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("source_type", sourceType);

    if (["pdf", "csv", "docx"].includes(sourceType)) {
      formData.append("file", selectedFile);
    } else if (sourceType === "text") {
      formData.append("text_content", textContent);
    } else if (sourceType === "url" || sourceType === "youtube") {
      formData.append("source_url", sourceUrl);
    }

    createKnowledgeSourceMutation.mutate(formData, {
      onSuccess: () => {
        toast.add({
          title: "Source uploaded",
          description: "Knowledge source has been queued for training.",
          type: "success",
        });
        handleClose();
      },
      onError: (err) => {
        toast.add({
          title: "Upload failed",
          description: err?.message || "Failed to process source.",
          type: "error",
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Knowledge Source</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label>Select Source Type</Label>
            <Select value={sourceType} onValueChange={(val) => { setSourceType(val); setSelectedFile(null); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="text">Raw Text Note</SelectItem>
                <SelectItem value="youtube">YouTube Video</SelectItem>
                <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                <SelectItem value="url">Website URL</SelectItem>
                <SelectItem value="docx">Word Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {["pdf", "csv", "docx"].includes(sourceType) && (
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload File</Label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors border-border">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-muted-foreground uppercase">{sourceType} (Max 10MB)</p>
                  </div>
                  <input
                    id="file-upload"
                    accept={
                      sourceType === "pdf"
                        ? ".pdf"
                        : sourceType === "docx"
                          ? ".doc,.docx"
                          : ".csv"
                    }
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
              {selectedFile && (
                <div className="rounded-lg border bg-muted/40 p-2 text-xs font-medium text-emerald-600 flex items-center justify-between">
                  <span className="truncate">{selectedFile.name}</span>
                  <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              )}
            </div>
          )}

          {sourceType === "text" && (
            <div className="space-y-2">
              <Label htmlFor="text-content">Text Content</Label>
              <Textarea
                id="text-content"
                rows={6}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste the documentation or text data here..."
                disabled={createKnowledgeSourceMutation.isPending}
              />
            </div>
          )}

          {(sourceType === "url" || sourceType === "youtube") && (
            <div className="space-y-2">
              <Label htmlFor="source-url">
                {sourceType === "url" ? "Website Link" : "YouTube Video Link"}
              </Label>
              <Input
                id="source-url"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder={
                  sourceType === "url"
                    ? "https://example.com/about-us"
                    : "https://www.youtube.com/watch?v=..."
                }
                disabled={createKnowledgeSourceMutation.isPending}
              />
            </div>
          )}

          {createKnowledgeSourceMutation.isError && (
            <div className="rounded-lg bg-destructive/10 p-3 text-destructive text-xs border border-destructive/20 font-medium">
              {JSON.stringify(
                createKnowledgeSourceMutation.error?.response?.data ??
                  "Upload failed. Please check files/URLs and try again."
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createKnowledgeSourceMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createKnowledgeSourceMutation.isPending}
            >
              {createKnowledgeSourceMutation.isPending
                ? "Processing..."
                : "Train Bot"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateKnowledgeSourceUpload;
