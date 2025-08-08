import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, MessageSquare, Send } from 'lucide-react';
import { useProductComments } from '@/hooks/useProductComments';
import { cn } from '@/lib/utils';

interface ProductCommentsProps {
  productId: string;
}

export const ProductComments: React.FC<ProductCommentsProps> = ({ productId }) => {
  const { comments, loading, addComment, toggleReaction } = useProductComments(productId);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    await addComment(newComment.trim());
    setNewComment('');
    setSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Customer Reviews ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Share your thoughts about this product..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button 
            type="submit" 
            disabled={submitting || !newComment.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Posting...' : 'Post Review'}
          </Button>
        </form>

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No reviews yet. Be the first to share your thoughts!
          </div>
        ) : (
          <div className="space-y-3">
            {(showAllComments ? comments : comments.slice(0, 3)).map((comment) => (
              <div key={comment.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={comment.profiles?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {comment.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-xs">
                        {comment.profiles?.full_name || 'Anonymous User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {comment.comment}
                    </p>
                  </div>
                </div>

                {/* Like/Dislike Buttons */}
                <div className="flex items-center gap-1 ml-8">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReaction(comment.id, true)}
                    className={cn(
                      "h-6 px-2 text-xs gap-1",
                      comment.user_reaction === 'like' 
                        ? "bg-green-50 text-green-700 hover:bg-green-100" 
                        : "hover:bg-gray-50"
                    )}
                  >
                    <ThumbsUp className="w-2.5 h-2.5" />
                    {comment.likes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReaction(comment.id, false)}
                    className={cn(
                      "h-6 px-2 text-xs gap-1",
                      comment.user_reaction === 'dislike' 
                        ? "bg-red-50 text-red-700 hover:bg-red-100" 
                        : "hover:bg-gray-50"
                    )}
                  >
                    <ThumbsDown className="w-2.5 h-2.5" />
                    {comment.dislikes}
                  </Button>
                </div>
              </div>
            ))}
            
            {comments.length > 3 && (
              <div className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllComments(!showAllComments)}
                  className="text-xs"
                >
                  {showAllComments ? 'Show Less' : `Show ${comments.length - 3} More Reviews`}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};