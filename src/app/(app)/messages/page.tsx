import { ChatSidebar } from "@/components/message/chat-sidebar";
export default function MessagesPage() {
  return (
    <div className="  max-w-[900px] 
  grid grid-cols-1 sm:grid-cols-[320px_1fr] h-[calc(100svh-var(--header-height,4rem))] ">
      <ChatSidebar />
      {/* <ChatPlaceholder /> Show placeholder on the main /messages route */}
       <div className="flex items-center justify-center h-full text-gray-500">
    Select a conversation to start chatting.
  </div>
    </div>
  );
}
