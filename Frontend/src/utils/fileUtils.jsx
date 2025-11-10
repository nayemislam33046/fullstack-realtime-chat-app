export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i]);
};

export const getFileIcon = (type) => {
  if (type.includes("image")) return "photo";
  if (type.includes("video")) return "video-camera";
  if (type.includes("audio")) return "musical-note";
  if (type.includes("pdf")) return "document-text";
  return "document";
};
