import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NotChatSelected";
import Sidebar from "../components/Sidebar";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const {selectedGroup} = useGroupStore();

  const isGroupChat = !!selectedGroup;
  

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {(selectedUser || selectedGroup) ?  <ChatContainer isGroupChat={isGroupChat} /> : <NoChatSelected />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;