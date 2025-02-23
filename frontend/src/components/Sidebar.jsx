import { useState, useEffect } from "react";
import { PenSquare, Plus, Users } from "lucide-react";

import CreateGroupModal from "./CreateGroupModel";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";


const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("chats");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const { users, getUsers, isUsersLoading, selectedUser, setSelectedUser,unreadMessages } = useChatStore();
  const { groups, getUserGroups, isGroupsLoading, selectedGroup, setSelectedGroup,unreadGroupMessages } = useGroupStore();
  const { authUser, onlineUsers, logout } = useAuthStore();

  useEffect(() => {
    getUsers();
    getUserGroups();
  }, [getUsers, getUserGroups]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSelectedGroup(null);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
  };

   // Calculate total unread messages for badge on tabs
   const totalUnreadDirectMessages = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);
   const totalUnreadGroupMessages = Object.values(unreadGroupMessages).reduce((sum, count) => sum + count, 0);

   console.log(totalUnreadGroupMessages)
   console.log(totalUnreadDirectMessages)


  return (
    <div className="w-full max-w-xs border-r border-base-300 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full">
                <img src={authUser?.profilePic || "/default-avatar.png"} alt="Profile" />
              </div>
            </div>
            <div>
              <h3 className="font-medium">{authUser?.fullName || "User"}</h3>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
          <button onClick={logout} className="btn btn-ghost btn-sm">
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-100 m-4">
        <button
          className={`tab ${activeTab === "chats" ? "tab-active" : ""}relative`}
          onClick={() => setActiveTab("chats")}
        >
          Chats
          {totalUnreadDirectMessages > 0 && (
            <span className="absolute -top-2 -right-2 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalUnreadDirectMessages}
            </span>
          )}
        </button>
        <button
          className={`tab ${activeTab === "groups" ? "tab-active" : ""}relative`}
          onClick={() => setActiveTab("groups")}
        >
          Groups
          {totalUnreadGroupMessages > 0 && (
            <span className="absolute -top-2 -right-2 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalUnreadGroupMessages}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto p-4">
        {activeTab === "chats" ? (
          <>
            <h2 className="text-lg font-semibold mb-4">Direct Messages</h2>
            {isUsersLoading ? (
              <div className="loading loading-spinner mx-auto"></div>
            ) : (
              <ul className="space-y-2">
                {users.map((user) => (
                  <li
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-base-200 ${
                      selectedUser?._id === user._id ? "bg-base-200" : ""
                    }`}
                  >
                    <div className="avatar online relative">
                      <div className="w-10 h-10 rounded-full">
                        <img src={user.profilePic || "/avatar.png"} alt={user.fullName} />
                        {unreadMessages[user._id] > 0 && (
                          <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadMessages[user._id]}
                          </span>
                        )}
                         {onlineUsers.includes(user._id) && (
                           <span
                          className="absolute bottom-0 right-0 size-3 bg-green-500 
                          rounded-full ring-2 ring-zinc-900"
                          />
                          )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">{user.fullName}</h3>
                      <p className="text-sm text-gray-500">
                        {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Groups</h2>
              <button
                onClick={() => setIsCreateGroupOpen(true)}
                className="btn btn-circle btn-sm"
              >
                <Plus size={18} />
              </button>
            </div>
            {isGroupsLoading ? (
              <div className="loading loading-spinner mx-auto"></div>
            ) : (
              <ul className="space-y-2">
                {groups.map((group) => (
                  <li
                    key={group._id}
                    onClick={() => handleGroupSelect(group)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-base-200 ${
                      selectedGroup?._id === group._id ? "bg-base-200" : ""
                    }`}
                  >
                    <div className="avatar relative">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-center">
                        <Users size={18}className="text-center mt-2 mx-3" />
                        {unreadGroupMessages[group._id] > 0 && (
                          <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadGroupMessages[group._id]}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.members.length} members</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Create Group Modal */}
      {isCreateGroupOpen && (
        <CreateGroupModal 
          isOpen={isCreateGroupOpen}
          onClose={() => setIsCreateGroupOpen(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;