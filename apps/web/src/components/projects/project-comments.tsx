'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Send, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorMessage } from '@/components/ui/error-message';
import { useAuthStore } from '@/stores/auth.store';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface ProjectCommentsProps {
  projectId: string;
  isAdmin: boolean;
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function ProjectComments({ projectId, isAdmin }: ProjectCommentsProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['project-comments', projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${projectId}/comments`);
      return data?.data || data;
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      const { data } = await apiClient.post(`/projects/${projectId}/comments`, { content: text });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-comments', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] }); // Update overview recent comments
      setContent('');
      setError('');
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to post comment');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await apiClient.delete(`/projects/${projectId}/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-comments', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || 'Failed to delete comment');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError('');
    addCommentMutation.mutate(content.trim());
  };

  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN');

  return (
    <div className="space-y-6">
      {/* Add comment form */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <ErrorMessage message={error} />}
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold uppercase overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full min-h-[80px] p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-y"
                  disabled={addCommentMutation.isPending}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={!content.trim() || addCommentMutation.isPending} size="sm">
                    {addCommentMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          Comments ({Array.isArray(comments) ? comments.length : 0})
        </h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !Array.isArray(comments) || comments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to start the discussion!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment: Comment) => (
              <Card key={comment.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold uppercase overflow-hidden">
                      {comment.author?.avatar ? (
                        <img src={comment.author.avatar} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <span>{comment.author?.firstName?.[0]}{comment.author?.lastName?.[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {comment.author?.firstName} {comment.author?.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                        {isSuperAdmin && (
                          <button
                            onClick={() => { if (window.confirm('Delete this comment?')) deleteCommentMutation.mutate(comment.id) }}
                            className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete comment (Super Admin only)"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
