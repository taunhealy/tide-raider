import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface Comment {
  id: string;
  text: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
}

interface CommentThreadProps {
  comments: Comment[];
  entityId: string; // ID of the board, beach, etc. that comments are for
  entityType: "board" | "beach" | "story"; // Type of entity
  onAddComment: (text: string) => Promise<void>;
}

function Avatar({
  src,
  alt,
  fallback,
}: {
  src?: string;
  alt: string;
  fallback: string;
}) {
  if (src) {
    return (
      <div className="h-10 w-10 rounded-full overflow-hidden">
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center font-medium">
      {fallback}
    </div>
  );
}

export function CommentThread({
  comments,
  entityId,
  entityType,
  onAddComment,
}: CommentThreadProps) {
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session?.user) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 font-primary">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>

      {comments.length > 0 ? (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <Avatar
                src={comment.user.image || ""}
                alt={comment.user.name}
                fallback={comment.user.name.charAt(0)}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.user.name}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-6">
          No comments yet. Be the first to comment!
        </p>
      )}

      {session?.user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-3 border rounded-lg font-primary"
            rows={3}
          />
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      ) : (
        <p className="text-gray-500">Please sign in to leave a comment.</p>
      )}
    </div>
  );
}
