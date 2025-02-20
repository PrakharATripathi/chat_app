import { useState, useEffect } from "react";
import { PenSquare, Plus, Users } from "lucide-react";

import CreateGroupModal from "./CreateGroupModel";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";


const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("chats");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const { users, getUsers, isUsersLoading, selectedUser, setSelectedUser } = useChatStore();
  const { groups, getUserGroups, isGroupsLoading, selectedGroup, setSelectedGroup } = useGroupStore();
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
              <h3 className="font-medium">{authUser?.name || "User"}</h3>
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
          className={`tab ${activeTab === "chats" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("chats")}
        >
          Chats
        </button>
        <button
          className={`tab ${activeTab === "groups" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("groups")}
        >
          Groups
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
                    <div className="avatar online">
                      <div className="w-10 h-10 rounded-full">
                        <img src={user.profilePic || "/avatar.png"} alt={user.fullName} />
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
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                        <Users size={18} />
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