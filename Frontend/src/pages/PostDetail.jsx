import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState("");
  const [modalMsg, setModalMsg] = useState(null); // <-- modal state
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function showModal(msg) {
    setModalMsg(msg);
    setTimeout(() => setModalMsg(null), 4000); // auto-hide
  }

  async function fetchPost() {
    setLoading(true);
    try {
      const res = await api.get(`posts/${id}/`);
      setPost(res.data);
    } catch (err) {
      console.error("Failed to fetch post:", err.response?.data || err.message);
      showModal("Failed to load post. Check console.");
    } finally {
      setLoading(false);
    }
  }

  function imageUrl(url) {
    if (!url) return null;
    try {
      return new URL(url, window.location.origin).href;
    } catch {
      return url;
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (!commentBody.trim()) return showModal("Comment cannot be empty.");
    try {
      await api.post("comments/", { post: id, body: commentBody });
      setCommentBody("");
      fetchPost();
      showModal("Comment posted successfully!");
    } catch (err) {
      console.error("Failed to post comment:", err.response?.data || err.message);
      showModal("Failed to post comment. See console.");
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm("Delete comment?")) return;
    try {
      await api.delete(`comments/${commentId}/`);
      fetchPost();
      showModal("Comment deleted successfully.");
    } catch (err) {
      console.error("Failed to delete comment:", err.response?.data || err.message);
      showModal("Failed to delete comment. See console.");
    }
  }

  async function handleDeletePost() {
    if (!window.confirm("Delete post? This action cannot be undone.")) return;
    try {
      await api.delete(`posts/${id}/`);
      showModal("Post deleted successfully.");
      navigate("/");
    } catch (err) {
      console.error("Failed to delete post:", err.response?.data || err.message);
      showModal("Failed to delete post. See console.");
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-24 text-gray-600">
        Loading post...
      </div>
    );

  if (!post)
    return <div className="py-12 text-center text-gray-600">Post not found.</div>;

  const isPostOwner = user && post.author && user.username === post.author.username;

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 relative">
      {/* Modal */}
      {modalMsg && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slideDown">
          {modalMsg}
        </div>
      )}

      {/* Post */}
      <article className="prose lg:prose-xl max-w-none bg-white p-6 rounded-2xl shadow-md">
        <h1 className="font-bold text-3xl">{post.title}</h1>
        <p className="text-sm text-gray-500">
          by {post.author?.username} • {new Date(post.created).toLocaleString()}
        </p>

        {post.image && (
          <img
            src={imageUrl(post.image)}
            alt={post.title}
            className="w-full max-h-[480px] object-contain rounded-lg my-4"
          />
        )}

        <div dangerouslySetInnerHTML={{ __html: post.body }} className="mt-4" />
      </article>

      {/* Post Actions */}
      {isPostOwner && (
        <div className="flex gap-3">
          <Link
            to={`/edit/${post.id}`}
            className="px-4 py-2 border rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
          >
            Edit
          </Link>
          <button
            onClick={handleDeletePost}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      )}

      {/* Comments */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">Comments</h3>
        {(!post.comments || post.comments.length === 0) && (
          <div className="text-gray-500">No comments yet.</div>
        )}

        <div className="space-y-3">
          {post.comments.map((c) => (
            <div key={c.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-semibold">{c.author?.username}</div>
                  <div className="text-xs text-gray-500">{new Date(c.created).toLocaleString()}</div>
                </div>

                {user && c.author && user.username === c.author.username && (
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        const newBody = window.prompt("Edit comment", c.body);
                        if (newBody !== null && newBody.trim() !== "") {
                          try {
                            await api.patch(`comments/${c.id}/`, { body: newBody });
                            fetchPost();
                            showModal("Comment edited successfully.");
                          } catch (err) {
                            console.error("Failed to edit comment:", err.response?.data || err.message);
                            showModal("Failed to edit comment. See console.");
                          }
                        }
                      }}
                      className="px-2 py-1 border rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Add Comment */}
      <section className="space-y-2">
        <h4 className="font-semibold">Leave a Comment</h4>
        <form onSubmit={handleComment} className="space-y-2">
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            required
            rows={4}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Write your comment..."
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Post Comment
            </button>
            {!user && (
              <Link
                to="/login"
                className="px-4 py-2 border rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
              >
                Login to Comment
              </Link>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
