import { useState, useRef } from "react";
import {
  PaperClipIcon,
  FaceSmileIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import EmojiPicker from "emoji-picker-react";
import { useDropzone } from "react-dropzone";
import { sendMessage, sendTypingStatus } from "../api/messages";
import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext";
import { useTyping } from "../hooks/UseTyping";

const MessageInput = () => {
  const { user } = useAuth();
  const { activeConversation, addMessage } = useChat();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
      "video/*": [".mp4", ".mov"],
      "audio/*": [".mp3", ".wav"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    },
  });

  // typing handler
  const handleTyping = (isTyping) => {
    if (activeConversation) {
      sendTypingStatus(activeConversation.id, isTyping).catch((err) =>
        console.error("Typing status error:", err)
      );
    }
  };

  const { onKeyDown } = useTyping(handleTyping, 2000);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() && !file) return;

    try {
      const newMessage = { body: message, file: file };

      const { data } = await sendMessage(activeConversation.id, newMessage);
      addMessage(data.message);
      setMessage("");
      setFile(null);
      setShowEmojiPicker(false);
      handleTyping(false);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    inputRef.current.focus();
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="fixed bottom-0 right-0 w-[100%] bg-white dark:bg-gray-900 z-50">
      <div className="mx-auto w-[90%] border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
        {file && (
          <div className="relative mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              onClick={removeFile}
              className="absolute top-1 right-1 p-1 cursor-pointer rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              <XMarkIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Check if file is image */}
            {file.type.startsWith("image/") ? (
              <div className="flex flex-col items-start">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="max-h-40 rounded-lg mb-2"
                />
                <span className="text-sm truncate text-white">{file.name}</span>
              </div>
            ) : (
              <div className="flex items-center">
                <PaperClipIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <span className="text-sm truncate text-white">{file.name}</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type a message..."
              className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
            />
            <div className="absolute right-2 top-2 flex space-x-1">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 rounded-full cursor-pointer text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <FaceSmileIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="p-1 rounded-full cursor-pointer text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <PaperClipIcon className="h-5 w-5" />
              </button>
              <div {...getRootProps()} className="hidden">
                <input {...getInputProps()} ref={fileInputRef} />
              </div>
            </div>

            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0 z-10">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width={300}
                  height={350}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!message.trim() && !file}
            className="ml-2 p-2 bg-blue-500 cursor-pointer text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
