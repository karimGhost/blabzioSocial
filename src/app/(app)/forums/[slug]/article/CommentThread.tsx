import { useState, useEffect } from "react";
import { MessageSquare, Heart, Reply } from "lucide-react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { dbForums } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function CommentThread({ forumId, articleId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyMap, setReplyMap] = useState({});
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (!showComments) return;

    const q = query(
      collection(dbForums, "forums", forumId, "articles", articleId, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const allComments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setComments(allComments);
    });

    return () => unsub();
  }, [forumId, articleId, showComments]);

  const handleAddComment = async (content, parentId = null) => {
    if (!content.trim()) return;
    await addDoc(
      collection(dbForums, "forums", forumId, "articles", articleId, "comments"),
      {
        content: content.trim(),
        author: {
          id: user?.uid,
          name: user?.displayName,
          avatarUrl: user?.photoURL || "",
        },
        createdAt: serverTimestamp(),
        likes: [],
        parentId,
      }
    );
  };

  const handleToggleLike = async (commentId, likes) => {
    const commentRef = doc(
      dbForums,
      "forums",
      forumId,
      "articles",
      articleId,
      "comments",
      commentId
    );
    const newLikes = likes.includes(user?.uid)
      ? likes.filter((uid) => uid !== user?.uid)
      : [...likes, user?.uid];
    await updateDoc(commentRef, { likes: newLikes });
  };

  const renderComments = (parentId = null, depth = 0) => {
    return comments
      .filter((c) => c.parentId === parentId)
      .map((comment) => (
        <div
          key={comment.id}
          className={`mt-3 pl-3 ${
            depth > 0 ? "bg-muted/50 rounded-lg p-3" : ""
          }`}
          style={{ marginLeft: depth * 20 }}
        >
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment?.author.avatarUrl} />
              <AvatarFallback>
                {comment?.author.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">
                  {comment?.author.name}
                </span>
              </div>
              <p className="text-sm mt-1">{comment?.content}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <button
                  onClick={() =>
                    handleToggleLike(comment.id, comment.likes || [])
                  }
                  className="flex items-center gap-1 hover:text-primary transition"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      comment.likes?.includes(user?.uid)
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                  {comment.likes?.length || 0}
                </button>

                <button
                  onClick={() =>
                    setReplyMap((prev) => ({
                      ...prev,
                      [comment.id]: prev[comment.id] ?? "",
                    }))
                  }
                  className="flex items-center gap-1 hover:text-primary transition"
                >
                  <Reply className="h-4 w-4" /> Reply
                </button>
              </div>

              {replyMap[comment.id] !== undefined && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={replyMap[comment.id]}
                    onChange={(e) =>
                      setReplyMap((prev) => ({
                        ...prev,
                        [comment.id]: e.target.value,
                      }))
                    }
                    className="border border-muted-foreground/30 rounded px-2 py-1 text-sm flex-1 focus:ring focus:ring-primary"
                    placeholder="Write a reply..."
                  />
                  <Button
                    size="sm"
                    onClick={async () => {
                      await handleAddComment(replyMap[comment.id], comment.id);
                      setReplyMap((prev) => ({ ...prev, [comment.id]: "" }));
                    }}
                  >
                    Reply
                  </Button>
                </div>
              )}
            </div>
          </div>

          {renderComments(comment.id, depth + 1)}
        </div>
      ));
  };

  return (
    <div className="mt-1">
      <div
        className="flex items-center gap-1.5 cursor-pointer text-sm text-muted-foreground hover:text-primary transition"
        onClick={() => setShowComments((prev) => !prev)}
      >
        <MessageSquare className="h-4 w-4" />
        {comments.filter((c) => !c.parentId).length} Comments
      </div>

      {showComments && (
        <div className="mt-4 border rounded-lg shadow-sm bg-card p-4 space-y-4">
          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="border border-muted-foreground/30 rounded px-3 py-2 text-sm flex-1 focus:ring focus:ring-primary"
              placeholder="Write a comment..."
            />
            <Button
              onClick={() => {
                handleAddComment(newComment);
                setNewComment("");
              }}
            >
              Post
            </Button>
          </div>

          <div className="divide-y divide-muted-foreground/20">
            {renderComments()}
          </div>
        </div>
      )}
    </div>
  );
}

export default CommentThread;
