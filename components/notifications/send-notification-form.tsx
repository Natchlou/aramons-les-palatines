// → components/send-notification-form.tsx
"use client";

import { useState, useTransition } from "react";
import { SendIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sendPushToAll, type SendResult } from "@/lib/push";

export function SendNotificationForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [result, setResult] = useState<SendResult | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    startTransition(async () => {
      const res = await sendPushToAll({ title, body, url });
      setResult(res);
      if (res.success) {
        setTitle("");
        setBody("");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex : Planning de ménage mis à jour"
          maxLength={80}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="body">Message</Label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Contenu de la notification"
          maxLength={240}
          rows={4}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="url">Lien à l&apos;ouverture</Label>
        <Input
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/"
        />
      </div>

      <Button type="submit" disabled={pending || !title.trim() || !body.trim()}>
        <SendIcon />
        {pending ? "Envoi..." : "Envoyer à tous"}
      </Button>

      {result && (
        <p
          className={
            result.success ? "text-sm text-muted-foreground" : "text-sm text-destructive"
          }
        >
          {result.success
            ? `${result.sent} envoyée(s) sur ${result.total} appareil(s)` +
              (result.failed ? ` · ${result.failed} échec(s)` : "") +
              (result.removed ? ` · ${result.removed} abonnement(s) expiré(s) supprimé(s)` : "")
            : result.error}
        </p>
      )}
    </form>
  );
}