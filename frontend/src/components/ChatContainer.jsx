import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";
import { useGroupStore } from "../store/useGroupStore";

const ChatContainer = ({ isGroupChat = false }) => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const {
    groupMessages,
    getGroupMessages,
    isGroupMessagesLoading,
    selectedGroup,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
    joinGroupRoom
  } = useGroupStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Determine which state to use based on chat type
  const currentMessages = isGroupChat ? groupMessages : messages;
  const isLoading = isGroupChat ? isGroupMessagesLoading : isMessagesLoading;

  // Effect for handling direct messages
  useEffect(() => {
    if (!isGroupChat && selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [
    isGroupChat,
    selectedUser?._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages
  ]);

  // Separate effect for handling group messages
  useEffect(() => {
    if (isGroupChat && selectedGroup?._id) {
      console.log("Loading and subscribing to group:", selectedGroup._id);
      getGroupMessages(selectedGroup._id);      
      // Make sure to join the group room
      joinGroupRoom(selectedGroup._id);  
      // Set up subscription for real-time updates
      subscribeToGroupMessages();  
      return () => {
        console.log("Unsubscribing from group:", selectedGroup._id);
        unsubscribeFromGroupMessages();
      };
    }
  }, [
    isGroupChat,
    selectedGroup?._id,
    getGroupMessages,
    joinGroupRoom,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages
  ]);

  useEffect(() => {
    if (messageEndRef.current && currentMessages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader isGroupChat={isGroupChat} />
        <MessageSkeleton />
        <MessageInput isGroupChat={isGroupChat} />
      </div>
    );
  }

  const renderMessageSender = (message) => {
    if (isGroupChat && message.senderId && message.senderId._id !== authUser._id) {
      // Find the group member who sent this message
      const sender = selectedGroup.members.find(member => member._id === message.senderId._id);
      return sender?.fullName || "Unknown user";
    }
    return null;
  };

  const getSenderProfilePic = (message) => {
    if (isGroupChat) {
      const senderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
      const member = selectedGroup.members?.find(m => m._id === senderId);
      return member?.profilePic || "/avatar.png";
    }
    return selectedUser.profilePic || "/avatar.png";
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader isGroupChat={isGroupChat} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentMessages.map((message, index) => (
          <div
            key={message._id}
            className={`chat ${(isGroupChat ? message.senderId._id === authUser._id : message.senderId === authUser._id) ? "chat-end" : "chat-start"}`}
            ref={index === currentMessages.length - 1 ? messageEndRef : null}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={getSenderProfilePic(message)}
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header">
              {isGroupChat && message.senderId !== authUser._id && (
                <span className="font-bold mr-1">{renderMessageSender(message)}</span>
              )}
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput isGroupChat={isGroupChat} />
    </div>
  );
};

export default ChatContainer;