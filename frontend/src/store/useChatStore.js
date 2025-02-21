import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: true,
  unreadMessages: {}, // userId -> count of unread messages

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({
        messages: res?.data,
        // Clear unread messages when opening a chat
        unreadMessages: {
          ...get().unreadMessages,
          [userId]: 0
        }
      });
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  // Listen for any new messages to track unread counts
  subscribeToUnreadMessages: () => {
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    const { selectedUser } = get();

    socket.on("newMessage", (newMessage) => {
      // Only count messages sent to the current user (receiver) and not from the currently selected chat
      if (newMessage.receiverId === authUser._id &&
        (!selectedUser || newMessage.senderId !== selectedUser._id)) {
        set(state => {
          const currentCount = state.unreadMessages[newMessage.senderId] || 0;
          return {
            unreadMessages: {
              ...state.unreadMessages,
              [newMessage.senderId]: currentCount + 1
            }
          };
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    set(state => {
      if (selectedUser) {
        // Clear unread messages when selecting a user
        return {
          selectedUser,
          unreadMessages: {
            ...state.unreadMessages,
            [selectedUser._id]: 0
          }
        };
      } else {
        return { selectedUser: null };
      }
    })
  },

  clearUnreadMessages: (userId) => {
    set(state => ({
      unreadMessages: {
        ...state.unreadMessages,
        [userId]: 0
      }
    }));
  },
}));