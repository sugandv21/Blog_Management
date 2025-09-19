import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

export default function PostEditor() {
  const { id } = useParams();
  const isEditing = !!id;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [keepImage, setKeepImage] = useState(true);

  const [modalMsg, setModalMsg] = useState(null); // <-- modal state
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    if (isEditing) {
      api
        .get(`posts/${id}/`)
        .then((res) => {
          if (!active) return;
          setTitle(res.data.title);
          setBody(res.data.body);
          setPublished(res.data.published);
          setImagePreview(res.data.image || null);
          setKeepImage(!!res.data.image);
        })
        .catch((err) => {
          console.error("Failed to load post:", err.response?.data || err.message);
          showModal("Failed to load post. Check console.");
        });
    }
    return () => { active = false; };
  }, [id, isEditing]);

  function handleFileChange(e) {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setKeepImage(Boolean(file) || imagePreview);
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
    setKeepImage(false);
  }

  function showModal(msg) {
    setModalMsg(msg);
    setTimeout(() => setModalMsg(null), 4000); // auto-hide after 4s
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("body", body);
      formData.append("published", String(published));

      if (imageFile) formData.append("image_file", imageFile);
      else if (isEditing && !keepImage) formData.append("image_file", "");

      if (isEditing) {
        await api.patch(`posts/${id}/`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        navigate(`/posts/${id}`);
      } else {
        const res = await api.post("posts/", formData, { headers: { "Content-Type": "multipart/form-data" } });
        navigate(`/posts/${res.data.id}`);
      }
    } catch (err) {
      console.error("Error saving post:", err.response?.data || err.message);
      const errMsg = err.response?.data && typeof err.response.data === "object"
        ? JSON.stringify(err.response.data)
        : err.message;
      showModal("Error saving post: " + errMsg);
    }
  }

  return (
    <div className="flex justify-center py-8 bg-gray-50 px-4 relative">
      {modalMsg && (
        <div className="absolute top-4 inset-x-4 md:inset-x-auto md:left-1/2 transform md:-translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-center z-50 animate-slideDown">
          {modalMsg}
        </div>
      )}

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
          {isEditing ? "Edit Post" : "Create Post"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Post title"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium mb-1">Body (HTML allowed)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Write your post content here..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Image (optional)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1" />

            {imagePreview ? (
              <div className="mt-3 flex items-start gap-4">
                <img src={imagePreview} alt="preview" className="max-w-xs max-h-48 rounded-lg border" />
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setKeepImage((k) => !k)}
                    className="px-3 py-1 border rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                  >
                    {keepImage ? "Keep image" : "Do not keep"}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Remove image
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-500">No image selected</div>
            )}
          </div>

          {/* Published & Submit */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="accent-indigo-600"
              />
              <span>Published</span>
            </label>

            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 transition"
            >
              {isEditing ? "Save Changes" : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
