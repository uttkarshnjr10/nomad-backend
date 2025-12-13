import React, { useState } from "react";
import { postService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from "date-fns"; 

const PostCard = ({ post }) => {
  const { user } = useAuth();

  const [isLiked, setIsLiked] = useState(post.likes.includes(user?.username));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [comments, setComments] = useState(post.comments || []);
  
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/400";
    if (path.startsWith("http")) return path;
    
    // Fallback for old local images during migration
    const API_URL = import.meta.env.VITE_CONTENT_API_URL;
    return `${API_URL}/${path}`;
  };

  const handleLike = async () => {
    const previousState = isLiked;
    setIsLiked(!previousState);
    setLikesCount(prev => previousState ? prev - 1 : prev + 1);

    try {
      await postService.toggleLike(post._id);
    } catch (err) {
      setIsLiked(previousState);
      setLikesCount(prev => previousState ? prev + 1 : prev - 1);
      console.error("Like failed", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data } = await postService.addComment(post._id, newComment);
      setComments(data.data); 
      setNewComment("");
    } catch (err) {
      console.error("Comment failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          {post.username?.[0]?.toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{post.username}</h3>
          <p className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Content Image */}
      <img 
        src={getImageUrl(post.contentUrl)} 
        alt="Post content" 
        className="w-full h-auto object-cover max-h-[500px] bg-slate-50"
        loading="lazy"
        onError={(e) => {
            e.target.src = "https://via.placeholder.com/400?text=Image+Not+Found";
        }} 
      />

      {/* Actions Bar */}
      <div className="p-4">
        <div className="flex items-center gap-6 mb-3">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isLiked ? "text-pink-500" : "text-slate-600 hover:text-pink-500"
            }`}
          >
            <span className="text-xl">{isLiked ? "♥" : "♡"}</span>
            {likesCount} Likes
          </button>

          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <span className="text-xl">💬</span>
            {comments.length} Comments
          </button>
        </div>

        <p className="text-slate-800 text-sm leading-relaxed mb-2">
          <span className="font-semibold mr-2">{post.username}</span>
          {post.caption}
        </p>

        {/* Comment Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {comments.map((comment, idx) => (
                <div key={idx} className="flex gap-2 text-sm">
                  <span className="font-semibold text-slate-900">{comment.username}</span>
                  <span className="text-slate-700">{comment.content}</span>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button 
                type="submit" 
                disabled={isSubmitting || !newComment.trim()}
                className="text-indigo-600 font-semibold text-sm px-3 disabled:opacity-50"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;