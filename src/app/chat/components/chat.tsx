"use client"

import { useEffect } from "react"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { ConversationList } from "./conversation-list"
import { ChatHeader } from "./chat-header"
import { MessageList } from "./message-list"
import { MessageInput } from "./message-input"
import { useChat, type Conversation, type Message, type User } from "@/app/chat/use-chat"

interface ChatProps {
  conversations: Conversation[]
  messages: Record<string, Message[]>
  users: User[]
}

export function Chat({
  conversations,
  messages,
  users,
}: ChatProps) {
  const {
    selectedConversation,
    setSelectedConversation,
    setConversations,
    setMessages,
    setUsers,
    addMessage,
    toggleMute,
  } = useChat()



  // Initialize data
  useEffect(() => {
    setConversations(conversations)
    setUsers(users)
    
    // Set messages for all conversations
    Object.entries(messages).forEach(([conversationId, conversationMessages]) => {
      setMessages(conversationId, conversationMessages)
    })

    // Auto-select first conversation if none selected (desktop only to prevent immediate navigation on mobile)
    if (!selectedConversation && conversations.length > 0 && window.innerWidth >= 1024) {
      setSelectedConversation(conversations[0].id)
    }
  }, [conversations, messages, users, selectedConversation, setConversations, setMessages, setUsers, setSelectedConversation])

  const currentConversation = conversations.find(conv => conv.id === selectedConversation)
  const currentMessages = selectedConversation ? messages[selectedConversation] || [] : []

  const handleSendMessage = (content: string) => {
    if (!selectedConversation) return

    const newMessage = {
      id: `msg-${Date.now()}`,
      content,
      timestamp: new Date().toISOString(),
      senderId: "current-user",
      type: "text" as const,
      isEdited: false,
      reactions: [],
      replyTo: null,
    }

    addMessage(selectedConversation, newMessage)
  }

  const handleToggleMute = () => {
    if (selectedConversation) {
      toggleMute(selectedConversation)
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-full min-h-[600px] max-h-[calc(100vh-200px)] flex rounded-lg border overflow-hidden bg-background">
        {/* Conversations Sidebar - Responsive */}
        <div className={cn(
          "border-r bg-background flex-shrink-0 w-full lg:w-96 flex-col lg:flex",
          selectedConversation ? "hidden lg:flex" : "flex"
        )}>
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={(id) => {
              setSelectedConversation(id)
            }}
          />
        </div>

        {/* Chat Panel - Flexible Width */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0 bg-background lg:flex",
          selectedConversation ? "flex" : "hidden lg:flex"
        )}>
          {/* Chat Header with Hamburger/Back Button */}
          <div className="flex items-center h-16 px-4 border-b bg-background">
            {/* Back Button - Only visible on mobile when a chat is selected */}
            {selectedConversation && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedConversation(null)}
                className="cursor-pointer lg:hidden mr-2 shrink-0 h-9 w-9 rounded-md"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}

            <div className="flex-1 min-w-0">
              <ChatHeader
                conversation={currentConversation || null}
                users={users}
                onToggleMute={handleToggleMute}
              />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 flex flex-col min-h-0">
            {selectedConversation ? (
              <>
                <MessageList
                  messages={currentMessages}
                  users={users}
                />
                
                {/* Message Input */}
                <MessageInput
                  onSendMessage={handleSendMessage}
                  placeholder={`Message ${currentConversation?.name || ""}...`}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Welcome to Chat</h3>
                  <p className="text-muted-foreground">
                    Select a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
