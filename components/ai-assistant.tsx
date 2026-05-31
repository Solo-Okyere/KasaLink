"use client";

import { useState } from "react";
import { Bot, Sparkles } from "@/components/icons";
import { replyModes } from "@/lib/constants";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";

export function AiAssistant({ otherUserId }: { otherUserId: string }) {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<(typeof replyModes)[number]>("friendly");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAi(feature: "reply" | "opener") {
    setLoading(true);
    const response = await fetch(`/api/ai/${feature}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feature === "reply" ? { message, mode } : { user_id: otherUserId })
    });
    const data = await response.json();
    setResult(data.text ?? "");
    setLoading(false);
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <Bot className="text-primary" />
        <h2 className="font-semibold">AI assistant</h2>
        <div className="grid gap-2">
          <Button type="button" variant="outline" onClick={() => askAi("opener")} disabled={loading}>
            <Sparkles size={18} /> Suggest openers
          </Button>
          <Select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}>
            {replyModes.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
          <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Paste their message for reply ideas..." />
          <Button type="button" onClick={() => askAi("reply")} disabled={loading || message.length < 2}>
            {loading ? "Thinking..." : "Suggest replies"}
          </Button>
        </div>
        {result ? <div className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm leading-6">{result}</div> : null}
      </CardContent>
    </Card>
  );
}
