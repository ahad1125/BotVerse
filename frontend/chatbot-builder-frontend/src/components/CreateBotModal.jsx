import React, { useEffect, useState } from "react";
import useCreateBot from "../hooks/useCreateBot";
import useUpdateBot from "../hooks/useUpdateBot";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/toast";

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

function CreateBotModal({ isOpen, isClose, bot }) {
  const createBotMutation = useCreateBot();
  const updateBotMutation = useUpdateBot();

  const isPending = createBotMutation.isPending || updateBotMutation.isPending;

  const [botName, setBotName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [language, setLanguage] = useState("english");
  const [category, setCategory] = useState("other");
  const [tone, setTone] = useState("formal");
  const [greetingMsg, setGreetingMsg] = useState(
    "Hi! How can I help you today?",
  );
  const [fallbackMsg, setFallbackMsg] = useState(
    "Sorry, I don't know the answer to that.",
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [timezone, setTimezone] = useState("Asia/Karachi");
  const [primaryColour, setPrimaryColour] = useState("#4F46E5");

  const mutationError = createBotMutation.error || updateBotMutation.error;
  const hasError = createBotMutation.isError || updateBotMutation.isError;

  const resetForm = () => {
    setBotName("");
    setBusinessName("");
    setLanguage("english");
    setCategory("other");
    setTone("formal");
    setGreetingMsg("Hi! How can I help you today?");
    setFallbackMsg("Sorry, I don't know the answer to that.");
    setTimezone("Asia/Karachi");
    setPrimaryColour("#4F46E5");
    setAvatarFile(null);
  };

  useEffect(() => {
    if (!bot) {
      resetForm();
      return;
    }
    setBotName(bot.name);
    setBusinessName(bot.business_name);
    setLanguage(bot.language);
    setCategory(bot.category);
    setTone(bot.tone);
    setGreetingMsg(bot.greeting_message);
    setFallbackMsg(bot.fallback_message);
    setTimezone(bot.timezone);
    setPrimaryColour(bot.primary_color);
  }, [bot]);

  const handleClose = () => {
    resetForm();
    isClose();
    createBotMutation.reset();
    updateBotMutation.reset();
  };

  const onSubmit = (e) => {
    e.preventDefault();

    let payload;

    if (avatarFile) {
      payload = new FormData();
      payload.append("name", botName);
      payload.append("business_name", businessName);
      payload.append("language", language);
      payload.append("category", category);
      payload.append("tone", tone);
      payload.append("greeting_message", greetingMsg);
      payload.append("fallback_message", fallbackMsg);
      payload.append("timezone", timezone);
      payload.append("primary_color", primaryColour);
      payload.append("avatar", avatarFile);
    } else {
      payload = {
        name: botName,
        business_name: businessName,
        language,
        category,
        tone,
        greeting_message: greetingMsg,
        fallback_message: fallbackMsg,
        timezone,
        primary_color: primaryColour,
      };
    }

    if (bot) {
      updateBotMutation.mutate(
        { botId: bot.id, botData: payload },
        {
          onSuccess: () => {
            toast.add({
              title: "Bot updated",
              description: `Successfully updated ${botName}.`,
              type: "success",
            });
            handleClose();
          },
          onError: (err) => {
            toast.add({
              title: "Update failed",
              description: err?.message || "Failed to update bot.",
              type: "error",
            });
          }
        },
      );
    } else {
      createBotMutation.mutate(payload, {
        onSuccess: () => {
          toast.add({
            title: "Bot created",
            description: `Successfully created ${botName}.`,
            type: "success",
          });
          handleClose();
        },
        onError: (err) => {
          toast.add({
            title: "Creation failed",
            description: err?.message || "Failed to create bot.",
            type: "error",
          });
        }
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{bot ? "Edit Bot" : "Create New Bot"}</DialogTitle>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onSubmit={onSubmit}
          className="space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="botName">Bot name</Label>
              <Input
                id="botName"
                required
                disabled={isPending}
                placeholder="e.g. Al Shifa Assistant"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                disabled={isPending}
                placeholder="e.g. Al Shifa Clinic"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar</Label>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              disabled={isPending}
              onChange={(e) => setAvatarFile(e.target.files[0])}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="urdu">Urdu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="ecommerce">E-Commerce</SelectItem>
                  <SelectItem value="real_estate">Real Estate</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Karachi">Asia/Karachi</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                  <SelectItem value="America/New_York">
                    America/New York
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryColour">Primary color</Label>
              <div className="flex items-center gap-3">
                <input
                  id="primaryColour"
                  type="color"
                  disabled={isPending}
                  value={primaryColour}
                  onChange={(e) => setPrimaryColour(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded-md border"
                />
                <span className="text-sm text-muted-foreground">
                  {primaryColour}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="greetingMsg">Greeting message</Label>
            <Textarea
              id="greetingMsg"
              rows={3}
              disabled={isPending}
              value={greetingMsg}
              onChange={(e) => setGreetingMsg(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fallbackMsg">Fallback message</Label>
            <Textarea
              id="fallbackMsg"
              rows={3}
              disabled={isPending}
              value={fallbackMsg}
              onChange={(e) => setFallbackMsg(e.target.value)}
            />
          </div>

          {hasError && (
            <p className="text-sm text-destructive">
              {JSON.stringify(
                mutationError?.response?.data ?? "Failed to save bot.",
              )}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 border-t pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? bot
                  ? "Saving…"
                  : "Creating…"
                : bot
                  ? "Save Changes"
                  : "Create Bot"}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateBotModal;
