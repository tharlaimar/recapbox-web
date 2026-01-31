"use client";

import { pb, R2_DOMAIN } from "@/lib/pocketbase"; 
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CommentProps {
  type: string; 
  itemId: string; 
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CommentSection({ type, itemId }: CommentProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchComments() {
      try {
        const result = await pb.collection('comments').getList(1, 50, {
          filter: `content_id = "${itemId}"`, 
          sort: '-created',
          expand: 'user', 
        });
        setComments(result.items);
      } catch (e) {
        console.log("Comment Error:", e);
      }
    }
    fetchComments();
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pb.authStore.isValid || !newComment.trim()) return;

    setLoading(true);
    try {
      const data = {
        user: pb.authStore.model?.id,
        text: newComment,
        content_id: itemId, 
        type: type,        
      };
      
      const record = await pb.collection('comments').create(data);
      const expandedRecord = { 
          ...record, 
          expand: { user: pb.authStore.model } 
      };
      setComments([expandedRecord, ...comments]);
      setNewComment("");
      router.refresh();
    } catch (e) {
      console.error("Post Error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 w-full max-w-4xl mx-auto">
      <h3 className="text-center text-gray-400 text-sm font-bold mb-4 uppercase tracking-widest">
        Comments ({comments.length})
      </h3>

      {/* Scrollable Area */}
      <div className="space-y-3 mb-4 h-[400px] overflow-y-auto pr-2 custom-scrollbar pb-24 touch-pan-y overscroll-contain"> 
        {comments.length > 0 ? (
          comments.map((comment) => {
            const user = comment.expand?.user;
            const isVip = user?.is_vip === true; 
            
            // 🔥 FINAL FIX: photoURL ကို အရင်ယူမယ်။ မရှိမှ Upload ပုံ (avatar) ကို ရှာမယ်
            const avatarUrl = user?.photoURL || (user?.avatar ? `${R2_DOMAIN}/${user.collectionId}/${user.id}/${user.avatar}` : null);

            return (
              <div key={comment.id} className="flex gap-3 bg-[#112240] p-4 rounded-2xl border border-white/5 shadow-lg">
                
                {/* 👤 User Avatar */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 bg-gray-700 ${isVip ? 'border-yellow-500' : 'border-white/10'}`}>
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        className="w-full h-full object-cover" 
                        alt="User"
                        onError={(e) => {
                           e.currentTarget.style.display = 'none'; // Link ပျက်နေရင် ဖျောက်မယ်
                        }}
                      />
                    ) : (
                      // Default Icon
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* Content Area */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <span className={`text-sm font-black truncate ${isVip ? 'text-yellow-500' : 'text-gray-200'}`}>
                        {user?.name || user?.username || "Unknown User"}
                      </span>
                      {isVip && (
                        <span className="bg-yellow-500 text-black text-[8px] px-1 rounded font-black">VIP</span>
                      )}
                    </div>

                    <span className="text-[10px] text-gray-500 flex-shrink-0 whitespace-nowrap mt-0.5">
                      {timeAgo(comment.created)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-300 mt-1 leading-relaxed break-words font-medium">
                    {comment.text}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 text-gray-600 text-sm flex flex-col items-center justify-center h-full">
            <p>No comments yet.</p>
            <p className="text-xs mt-1">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>

      {/* ✍️ Bottom Fixed Input Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-[#051139]/95 backdrop-blur-xl border-t border-white/10 p-4 z-50">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-3">
          
          {/* Current User Avatar Preview */}
          <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
             {(() => {
                const currentUser = pb.authStore.model;
                // ကိုယ့်ပုံကိုလည်း photoURL ကနေ အရင်ယူမယ်
                const myAvatar = currentUser?.photoURL || (currentUser?.avatar ? `${R2_DOMAIN}/${currentUser.collectionId}/${currentUser.id}/${currentUser.avatar}` : null);
                
                return myAvatar ? (
                    <img src={myAvatar} className="w-full h-full object-cover" />
                ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                );
             })()}
          </div>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={pb.authStore.isValid ? "Write a comment..." : "Login to comment"}
              disabled={!pb.authStore.isValid || loading}
              className="w-full bg-black/40 text-white text-sm rounded-full pl-4 pr-12 py-3 border border-white/10 focus:outline-none focus:border-blue-500 transition-all placeholder-gray-500 focus:bg-black/60"
            />
            <button 
              type="submit" 
              disabled={!pb.authStore.isValid || loading || !newComment.trim()}
              className="absolute right-1 top-1 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-500 disabled:opacity-0 transition-all active:scale-90"
            >
              <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}