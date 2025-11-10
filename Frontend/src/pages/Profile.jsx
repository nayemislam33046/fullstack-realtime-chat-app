import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", name);
    if (file) data.append("file", file);
    data.append("_method", "PUT");

    try {
      await axios.post(
        "https://chat-app-backend-xz9q.onrender.com/api/users/profile",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error.response?.data || error);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Edit Profile
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile picture */}
        <div className="flex flex-col items-center">
          <img
            src={
              preview
                ? preview
                : user?.avatar
                ? `https://chat-app-backend-xz9q.onrender.com/api/proxy-image/${user.avatar}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    name
                  )}&background=random`
            }
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />

          <label className="mt-2 text-sm text-blue-500 cursor-pointer">
            Change Photo
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;
