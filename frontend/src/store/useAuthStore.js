import { create } from "zustand";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "./useChatStore";
import { useGroupStore } from "./useGroupStore";

const BASE_URL = "https://chat-app-8wm6.onrender.com" 

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      // get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      if (res.status === 200) {
        set({ authUser: null });
        toast.success("Logged out successfully");
        get().disconnectSocket();
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: async() => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

      // Get the user's groups to join those rooms
      let userGroups = [];
      try {
        const res = await axiosInstance.get("/groups");
        userGroups = res.data.map(g => g._id);
      } catch (error) {
        console.log("Error loading user groups for socket:", error);
      }

      // Close existing socket if any
    if (get().socket) {
      get().socket.disconnect();
    }

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
        groups: JSON.stringify(userGroups)
      },
      transports: ["websocket"] 
    });
    socket.connect();
    console.log("Socket connecting...");

    socket.on("connect", () => {
      console.log("Socket connected successfully");
    });
    
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

     // Handle group-related events
     socket.on("newGroup", (group) => {
      // Alert about new group addition
      toast.success(`You've been added to group: ${group.name}`);
      // Join the new group's room
      socket.emit("joinGroup", group._id);
      // Update groups list
      useGroupStore.getState().getUserGroups();
    });

    socket.on("groupDeleted", ({ groupId, groupName }) => {
      toast.info(`Group "${groupName}" has been deleted`);
       // Leave the group room
       socket.emit("leaveGroup", groupId);
       // Update groups list
       useGroupStore.getState().getUserGroups();
    });

    socket.on("addedToGroup", (group) => {
      toast.success(`You've been added to group: ${group.name}`);
       // Join the group room
       socket.emit("joinGroup", group._id);
       // Update groups list
       useGroupStore.getState().getUserGroups();
    });

    socket.on("newGroupMessage", (message) => {
      console.log("New group message received via socket:", message);
      // The handling of this event is now in useGroupStore
    });

      // Subscribe to unread messages
      setTimeout(() => {
        useChatStore.getState().subscribeToUnreadMessages();
        useGroupStore.getState().subscribeToUnreadGroupMessages();
      }, 500);
      
  },

  disconnectSocket: () => {
    if (get().socket?.connected){
      get().socket.disconnect();
      set({ socket: null });
      console.log("Socket disconnected");
    }
  },
}));