import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

function imageUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url, window.location.href);
    if (u.protocol.startsWith("http")) return url;
  } catch {}
  const apiRoot = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  if (!apiRoot) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return apiRoot + path;
}

function PostCard({ post }) {
  return (
    <article className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition transform">
      {post.image && (
        <div className="mb-3">
          <img
            src={imageUrl(post.image)}
            alt={post.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      <Link
        to={`/posts/${post.id}`}
        className="text-xl font-semibold text-indigo-700 hover:underline"
      >
        {post.title}
      </Link>

      <p className="text-sm text-gray-500 mt-1">
        by {post.author?.username || "Unknown"} •{" "}
        {new Date(post.created).toLocaleDateString()}
      </p>

      <p className="mt-2 text-gray-700">
        {post.excerpt ||
          (post.body
            ? post.body.replace(/(<([^>]+)>)/gi, "").slice(0, 160) + "..."
            : "")}
      </p>
    </article>
  );
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 👇 how many posts per page (must match backend pagination)
  const pageSize = 3;
  const totalPages = Math.ceil(count / pageSize);

  useEffect(() => {
    fetchPosts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchPosts(pageNum = 1) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`posts/?page=${pageNum}`);
      setPosts(res.data.results || []);
      setCount(res.data.count ?? 0);
      setNext(res.data.next ?? null);
      setPrevious(res.data.previous ?? null);
    } catch (err) {
      console.error("Failed to fetch posts:", err.response?.data || err.message);
      setError("Failed to load posts. See console for details.");
      setPosts([]);
      setCount(0);
      setNext(null);
      setPrevious(null);
    } finally {
      setLoading(false);
    }
  }

  function generatePageNumbers() {
    const pages = [];
    const maxVisible = 5; // show at most 5 page numbers
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);

    if (end - start + 1 < maxVisible) {
      if (start === 1) {
        end = Math.min(totalPages, start + maxVisible - 1);
      } else if (end === totalPages) {
        start = Math.max(1, end - maxVisible + 1);
      }
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  }

  return (
    <div>
      {/* Banner Section */}
      <div className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 py-12 text-center shadow-md">
        <h1 className="text-4xl font-bold mb-2">Welcome to BlogApp</h1>
        <p className="text-lg text-gray-900">
          Discover, share, and create amazing stories every day 🚀
        </p>
      </div>

      {/* Page header */}
      <div className="flex justify-between items-center mb-6 mt-8 container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800">Latest Posts</h2>
        <Link
          to="/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          + Create Post
        </Link>
      </div>

      <div className="container mx-auto px-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse border rounded-xl p-4 bg-white h-56"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-600 py-8 text-center">{error}</div>
        ) : posts.length === 0 ? (
          <div className="text-gray-600 py-8 text-center">No posts yet.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`px-3 py-1 rounded-md border ${
                  previous
                    ? "bg-gray-100 hover:bg-gray-200"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                disabled={!previous}
              >
                Prev
              </button>

              {generatePageNumbers().map((num, idx) =>
                num === "..." ? (
                  <span key={idx} className="px-2 text-gray-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={idx}
                    onClick={() => setPage(num)}
                    className={`px-3 py-1 rounded-md border ${
                      num === page
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {num}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => p + 1)}
                className={`px-3 py-1 rounded-md border ${
                  next
                    ? "bg-gray-100 hover:bg-gray-200"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                disabled={!next}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
