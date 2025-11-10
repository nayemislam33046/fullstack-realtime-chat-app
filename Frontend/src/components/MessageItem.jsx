import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../contexts/ChatContext";
import { formatDistanceToNow } from "date-fns";
import {
  EllipsisHorizontalIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { deleteMessage, updateMessage, markAsSeen } from "../api/messages";
import { Fragment, useEffect, useState } from "react";
import axios from "axios";

const MessageItem = ({ message, isLastMessage }) => {
  const { user } = useAuth();
  const { updateMessage: updateMessageInContext, removeMessage } = useChat();
  const isMe = message.user_id === user.id;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editText, setEditText] = useState(message.body);

  const [isImageOpen, setIsImageOpen] = useState(false);

  useEffect(() => {
    if (!isMe && isLastMessage) {
      const seenByMe = message.statuses?.find((s) => s.user_id === user.id);
      if (seenByMe && !seenByMe.is_seen) {
        markAsSeen(message.id).catch((err) =>
          console.error("Mark as seen failed", err)
        );
      }
    }
  }, [isLastMessage, isMe, message, user.id]);

  // message delete handler
  const handleDeleteMessage = async () => {
    try {
      await deleteMessage(message.id);
      removeMessage(message);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // message update handler

  const handleUpdateMessage = async () => {
    try {
      const res = await updateMessage(message.id, { body: editText });
      updateMessageInContext(res.data);
      setIsEditOpen(false);
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  // file icon based on mime type

  const getFileIcon = (fileType) => {
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("video")) return "🎥";
    if (fileType.includes("audio")) return "🎵";
    if (fileType.includes("pdf")) return "📄";
    return "📎";
  };

  // format file size

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // render seen status
  const renderSeenStatus = () => {
    if (!isMe || !isLastMessage || message.unsent_at) return null;
    const seenStatuses = message.statuses || [];
    const allSeen =
      seenStatuses.length > 0 && seenStatuses.every((s) => s.is_seen);
    if (allSeen) {
      return <span className="text-xs text-green-400 ml-2">Seen</span>;
    }
    return <span className="text-xs text-gray-400 ml-2">Delivered</span>;
  };

  const fileUrl = `https://chat-app-backend-xz9q.onrender.com/api/proxy-image/${message.data?.drive_file_id}`;

  // file download handler
  const handleDownload = async (messageId) => {
    try {
      const response = await axios.get(
        `https://chat-app-backend-xz9q.onrender.com/api/messages/${messageId}/download`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // extract filename from headers
      const disposition = response.headers["content-disposition"];
      let filename = "downloaded_file";

      if (disposition && disposition.includes("filename=")) {
        filename = disposition.split("filename=")[1].replace(/"/g, "").trim();
      }

      // trigger download
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <>
      {/* Message Box */}
      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div
          className={`relative max-w-xs lg:max-w-sm px-2 py-1 rounded-lg ${
            isMe
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none"
          }`}
        >
          {message.unsent_at ? (
            <div className="italic text-sm">Message unsent</div>
          ) : (
            <>
              {!isMe && (
                <div className="text-xs font-semibold mb-1">
                  {message?.user?.name}
                </div>
              )}

              {message.data?.path && (
                <div className="mt-2">
                  {message.data?.mimeType?.includes("image") ? (
                    <img
                      src={fileUrl}
                      alt="Sent file"
                      className="md:max-w-full md:w-[200px] md:h-[250px] sm:w-40 sm:h-40 w-32 h-32 rounded cursor-pointer"
                      onClick={() => setIsImageOpen(true)}
                    />
                  ) : (
                    <div className="border border-gray-300 dark:border-gray-600 rounded p-3 bg-white dark:bg-gray-800">
                      <div className="flex items-center">
                        <div className="mr-3">
                          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                            <span className="text-gray-500 dark:text-gray-300">
                              {getFileIcon(message.data?.mimeType)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {message.data?.file_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(message.data?.fileSize)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => handleDownload(message.id)}
                          className="text-sm text-blue-500 cursor-pointer hover:text-blue-700 dark:hover:text-blue-400 flex items-center"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                          Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {message.body && (
                <div className="text-sm mb-2 my-1">{message.body}</div>
              )}
            </>
          )}
          <div className="flex items-center justify-end mt-1 space-x-2">
            <span className="text-xs opacity-70">
              {formatDistanceToNow(new Date(message.created_at), {
                addSuffix: true,
              })}
            </span>
            {renderSeenStatus()}
            {isMe && !message.unsent_at && (
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 bottom-6 w-56 origin-bottom-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setIsEditOpen(true)}
                            className={`${
                              active ? "bg-gray-100 dark:bg-gray-700" : ""
                            } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                          >
                            Edit Message
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this message?"
                                )
                              ) {
                                handleDeleteMessage();
                              }
                            }}
                            className={`${
                              active ? "bg-red-100 dark:bg-red-900" : ""
                            } block w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-300`}
                          >
                            Delete
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {isImageOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={fileUrl}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] rounded-lg"
            />
            {/* Download Icon */}
            <button
              onClick={() => handleDownload(message.id)}
              className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-gray-200"
            >
              <ArrowDownTrayIcon className="h-6 w-6 text-gray-700" />
            </button>
            {/* Close Button */}
            <button
              onClick={() => setIsImageOpen(false)}
              className="absolute top-3 left-3 bg-white p-2 rounded-full shadow hover:bg-red-600"
            >
              ❌
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4 text-white">
              Edit Message
            </h2>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white"
              rows="3"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateMessage}
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default MessageItem;
