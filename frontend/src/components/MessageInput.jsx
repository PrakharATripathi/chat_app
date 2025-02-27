import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useGroupStore } from "../store/useGroupStore";

const MessageInput = ({ isGroupChat }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();
  const { sendGroupMessage } = useGroupStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    // Clear form immediately for a responsive feel
    const messageText = text.trim();
    const messageImage = imagePreview;
    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    try {
      setIsSubmitting(true);
      if (isGroupChat) {
        await sendGroupMessage({
          text:messageText,
          image: messageImage,
        })
      } else {
        await sendMessage({
          text: messageText,
          image: messageImage,
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className={`flex items-center justify-center w-10 h-10 rounded-full
            ${(!text.trim() && !imagePreview || isSubmitting) 
              ? "bg-base-200 text-base-content/50"
              : "bg-primary text-primary-foreground"
            } transition-colors`}
          disabled={!text.trim() && !imagePreview || isSubmitting}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;