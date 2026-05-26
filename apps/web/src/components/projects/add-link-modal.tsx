'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { Link as LinkIcon, Loader2 } from 'lucide-react';
import { ErrorMessage } from '@/components/ui/error-message';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  existingAttachments: string[];
}

export function AddLinkModal({ isOpen, onClose, projectId, existingAttachments }: AddLinkModalProps) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (newUrl: string) => {
      // Append the new URL to the existing attachments
      const updatedAttachments = [...(existingAttachments || []), newUrl];
      const { data } = await apiClient.patch(`/projects/${projectId}`, { attachments: updatedAttachments });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setUrl('');
      setTitle('');
      setDescription('');
      setError('');
      onClose();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to attach link');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!url.trim()) return;
    
    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (e.g. https://google.com)');
      return;
    }

    const attachmentData = JSON.stringify({
      url: url.trim(),
      title: title.trim(),
      description: description.trim(),
    });

    mutation.mutate(attachmentData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Attach Link</DialogTitle>
          <DialogDescription>
            Add a link to a Google Doc, Sheet, or any other external resource.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && <ErrorMessage message={error} />}
          
          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              placeholder="e.g. Q3 Roadmap"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Resource URL</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="url"
                type="url"
                placeholder="https://docs.google.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Short Description (Optional)</Label>
            <Input
              id="desc"
              placeholder="e.g. Contains the updated requirements"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !url.trim()}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Attach
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
