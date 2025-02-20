import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
// import { axiosInstance } from "../lib/axios";
// import { useAuthStore } from "./useAuthStore";

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isGroupMessagesLoading: false,
  isCreatingGroup: false,
  isUpdatingGroup: false,

  // Get all groups for the current user
  getUserGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  // Create a new group
  createGroup: async (groupData) => {
    set({ isCreatingGroup: true });
    try {
      const res = await axiosInstance.post("/groups/create", groupData);
      set({ groups: [...get().groups, res.data] });
      toast.success("Group created successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      throw error;
    } finally {
      set({ isCreatingGroup: false });
    }
  },

  // Get group details
  getGroupDetails: async (groupId) => {
    try {
      const res = await axiosInstance.get(`/groups/${groupId}`);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load group details");
      throw error;
    }
  },

  // Update group
  updateGroup: async (groupId, data) => {
    set({ isUpdatingGroup: true });
    try {
      const res = await axiosInstance.put(`/groups/${groupId}/update`, data);
      
      // Update the groups list and selected group if it's the one being updated
      set(state => ({
        groups: state.groups.map(g => g._id === groupId ? res.data : g),
        selectedGroup: state.selectedGroup?._id === groupId ? res.data : state.selectedGroup
      }));
      
      toast.success("Group updated successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update group");
      throw error;
    } finally {
      set({ isUpdatingGroup: false });
    }
  },

  // Delete group
  deleteGroup: async (groupId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}`);
      
      // Remove from groups list and clear selection if it was selected
      set(state => ({
        groups: state.groups.filter(g => g._id !== groupId),
        selectedGroup: state.selectedGroup?._id === groupId ? null : state.selectedGroup
      }));
      
      toast.success("Group deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete group");
      throw error;
    }
  },

  // Add members to group
  addMembers: async (groupId, memberIds) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/members`, { members: memberIds });
      
      // Update groups list and selected group if needed
      set(state => ({
        groups: state.groups.map(g => g._id === groupId ? res.data : g),
        selectedGroup: state.selectedGroup?._id === groupId ? res.data : state.selectedGroup
      }));
      
      toast.success("Members added successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add members");
      throw error;
    }
  },

  // Remove member from group
  removeMember: async (groupId, memberId) => {
    try {
      const res = await axiosInstance.delete(`/groups/${groupId}/members/${memberId}`);
      
      // Update groups list and selected group if needed
      set(state => ({
        groups: state.groups.map(g => g._id === groupId ? res.data : g),
        selectedGroup: state.selectedGroup?._id === groupId ? res.data : state.selectedGroup
      }));
      
      toast.success("Member removed successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
      throw error;
    }
  },

  // Get messages for a group
  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  // Send message to group
  sendGroupMessage: async (messageData) => {
    const { selectedGroup, groupMessages } = get();
    try {
      const res = await axiosInstance.post(`/groups/${selectedGroup._id}/messages`, messageData);
      set({ groupMessages: [...groupMessages, res.data] });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      throw error;
    }
  },

  // Subscribe to group message updates
  subscribeToGroupMessages: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;

    const socket = useAuthStore.getState().socket;
    
    socket.on("newGroupMessage", (newMessage) => {
      if (newMessage.groupId === selectedGroup._id) {
        set({
          groupMessages: [...get().groupMessages, newMessage],
        });
      }
    });
    
    // Subscribe to group updates
    socket.on("groupUpdated", (updatedGroup) => {
      if (updatedGroup._id === selectedGroup._id) {
        set({
          selectedGroup: updatedGroup,
          groups: get().groups.map(g => g._id === updatedGroup._id ? updatedGroup : g)
        });
      }
    });
    
    // Handle being removed from group
    socket.on("removedFromGroup", ({groupId}) => {
      if (groupId === selectedGroup._id) {
        set({ selectedGroup: null });
      }
      set({
        groups: get().groups.filter(g => g._id !== groupId)
      });
    });
  },

  // Unsubscribe from group updates
  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newGroupMessage");
    socket.off("groupUpdated");
    socket.off("removedFromGroup");
  },

  // Set the selected group
  setSelectedGroup: (group) => set({ selectedGroup: group }),

  // Join a group's socket room
  joinGroupRoom: (groupId) => {
    const socket = useAuthStore.getState().socket;
    socket.emit("joinGroup", groupId);
  },

  // Leave a group's socket room
  leaveGroupRoom: (groupId) => {
    const socket = useAuthStore.getState().socket;
    socket.emit("leaveGroup", groupId);
  },
}));