import Image from "next/image";
import { Bookmark, Pencil, Send, Trash2 } from "@/components/icons";
import { AiAssistant } from "@/components/ai-assistant";
import { RealtimeChatRefresh } from "@/components/realtime-chat-refresh";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteMessageAction, editMessageAction, saveMessageAction, sendMessageAction } from "@/lib/actions";
import { requireActiveUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase-admin";
import { formatTime } from "@/lib/utils";

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  const { user } = await requireActiveUser();
  const service = createServiceClient();

  const { data: chat } = await service
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .single();

  if (!chat) {
    return <Card><CardContent className="p-6">Chat not found or unavailable.</CardContent></Card>;
  }

  const otherId = chat.user_a === user.id ? chat.user_b : chat.user_a;
  const [{ data: other }, { data: messages }, { data: saved }] = await Promise.all([
    service.from("profiles").select("*").eq("user_id", otherId).single(),
    service
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    service.from("saved_messages").select("message_id")
  ]);

  const savedIds = new Set((saved ?? []).map((item) => item.message_id));
  const visibleMessages = (messages ?? []).filter((message) => new Date(message.expires_at) > new Date() || savedIds.has(message.id));

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <RealtimeChatRefresh chatId={chatId} />
      <section className="min-w-0">
        <div className="mb-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Chat</p>
          <h1 className="mt-2 text-3xl font-bold">{other?.display_name ?? other?.username ?? "Campus match"}</h1>
          <p className="text-sm text-muted-foreground">Messages expire after 24 hours unless saved.</p>
        </div>
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="max-h-[58vh] space-y-3 overflow-y-auto pr-1">
              {visibleMessages.map((message) => {
                const mine = message.sender_id === user.id;
                return (
                  <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] rounded-lg border p-3 ${mine ? "bg-primary text-primary-foreground" : "bg-white"}`}>
                      {message.image_url ? <Image src={message.image_url} alt="" width={320} height={220} className="mb-2 rounded-md object-cover" /> : null}
                      {message.content ? <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p> : null}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] opacity-75">
                        <span>{formatTime(message.created_at)}</span>
                        {message.is_edited ? <span>edited</span> : null}
                        {savedIds.has(message.id) ? <span>saved</span> : null}
                      </div>
                      {mine ? (
                        <div className="mt-2 flex gap-2">
                          <form action={saveMessageAction}>
                            <input type="hidden" name="chat_id" value={chatId} />
                            <input type="hidden" name="message_id" value={message.id} />
                            <Button variant="secondary" size="sm"><Bookmark size={14} /> Save</Button>
                          </form>
                          <form action={deleteMessageAction}>
                            <input type="hidden" name="chat_id" value={chatId} />
                            <input type="hidden" name="message_id" value={message.id} />
                            <Button variant="destructive" size="sm"><Trash2 size={14} /> Delete</Button>
                          </form>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              {!visibleMessages.length ? <p className="py-10 text-center text-sm text-muted-foreground">Start the conversation when you are ready.</p> : null}
            </div>
            <form action={sendMessageAction} className="grid gap-3 border-t pt-4">
              <input type="hidden" name="chat_id" value={chatId} />
              <Textarea name="content" placeholder="Write a message..." />
              <Input name="image_url" placeholder="Optional image URL" />
              <Button><Send size={18} /> Send</Button>
            </form>
          </CardContent>
        </Card>
      </section>
      <aside className="space-y-4">
        <AiAssistant otherUserId={otherId} />
        <Card>
          <CardContent className="space-y-3 p-5">
            <Pencil className="text-primary" />
            <h2 className="font-semibold">Edit message helper</h2>
            <form action={editMessageAction} className="grid gap-2">
              <input type="hidden" name="chat_id" value={chatId} />
              <Input name="message_id" placeholder="Message ID" />
              <Textarea name="content" placeholder="Replacement text" />
              <Button variant="outline">Update own message</Button>
            </form>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
