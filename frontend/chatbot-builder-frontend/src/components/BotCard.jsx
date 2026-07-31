import { useNavigate } from "react-router-dom";
import useDeleteBot from "../hooks/useDeleteBot";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "@/components/ui/toast";

function BotCard({ bot, onEdit }) {
  const navigate = useNavigate();
  const deleteBotMutation = useDeleteBot();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDelete = () => {
    deleteBotMutation.mutate(bot.id, {
      onSuccess: () => {
        toast.add({
          title: "Bot deleted",
          description: `Successfully deleted ${bot.name}.`,
          type: "success",
        });
        setIsDeleteOpen(false);
      },
      onError: (err) => {
        toast.add({
          title: "Error",
          description: err?.message || "Failed to delete bot.",
          type: "error",
        });
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card
        onClick={() => navigate(`/bots/${bot.id}`)}
        className="cursor-pointer transition-colors hover:bg-muted/40"
      >
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="flex items-center gap-3">
            {bot.avatar ? (
              <img
                src={bot.avatar}
                alt={bot.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground">
                {bot.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <h3 className="font-medium leading-none">{bot.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {bot.business_name || "No business name"}
              </p>
            </div>
          </div>

          <Badge variant={bot.is_active ? "default" : "secondary"}>
            {bot.is_active ? "Active" : "Inactive"}
          </Badge>
        </CardHeader>

        <CardContent>
          <div className="space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium capitalize">
                {bot.category || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Language</span>
              <span className="font-medium capitalize">{bot.language}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tone</span>
              <span className="font-medium capitalize">{bot.tone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">
                {new Date(bot.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="gap-3 border-t pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(bot);
            }}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            disabled={deleteBotMutation.isPending}
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteOpen(true);
            }}
          >
            Delete
          </Button>
        </CardFooter>
      </Card>

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Chatbot"
        description={`Are you sure you want to delete ${bot.name}? This action cannot be undone and will permanently delete all associated conversations and settings.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteBotMutation.isPending}
      />
    </motion.div>
  );
}

export default BotCard;
