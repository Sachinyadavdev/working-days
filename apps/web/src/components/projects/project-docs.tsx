'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  KeyRound,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Save,
  Edit3,
  FileText,
  BookOpen,
  Shield,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Globe,
  Database,
  Key,
  Lock,
  Server,
} from 'lucide-react';

// ─── Types ───
interface Credential {
  id: string;
  name: string;
  type: string;
  value: string;
  notes?: string;
}

interface ProjectDocsProps {
  projectId: string;
  readme: string | null;
  developerDocs: string | null;
  credentials: Credential[];
  isAdmin: boolean;
}

const CREDENTIAL_TYPES = [
  { value: 'API_KEY', label: 'API Key', icon: Key },
  { value: 'PASSWORD', label: 'Password', icon: Lock },
  { value: 'DATABASE_URL', label: 'Database URL', icon: Database },
  { value: 'SERVER', label: 'Server / SSH', icon: Server },
  { value: 'URL', label: 'URL / Endpoint', icon: Globe },
  { value: 'OTHER', label: 'Other', icon: KeyRound },
];

function getTypeIcon(type: string) {
  const found = CREDENTIAL_TYPES.find(t => t.value === type);
  return found ? found.icon : KeyRound;
}

function getTypeLabel(type: string) {
  const found = CREDENTIAL_TYPES.find(t => t.value === type);
  return found ? found.label : type;
}

function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// ─── Credential Row ───
function CredentialRow({
  cred,
  onDelete,
  isAdmin,
}: {
  cred: Credential;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const Icon = getTypeIcon(cred.type);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cred.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="group border border-border rounded-xl p-4 hover:border-brand-300 transition-all bg-card"
    >
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-brand-50 flex items-center justify-center">
          <Icon className="h-5 w-5 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-foreground">{cred.name}</h4>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider">
                {getTypeLabel(cred.type)}
              </span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setVisible(!visible)} className="p-1.5 rounded-md hover:bg-muted transition-colors" title={visible ? 'Hide' : 'Reveal'}>
                {visible ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </button>
              <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Copy value">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
              </button>
              {isAdmin && (
                <button
                  onClick={() => { if (window.confirm(`Delete credential "${cred.name}"?`)) onDelete(cred.id); }}
                  className="p-1.5 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="font-mono text-sm bg-muted/60 border border-border rounded-lg px-3 py-2 break-all select-all">
            {visible ? cred.value : '•'.repeat(Math.min(cred.value.length, 32))}
          </div>
          {cred.notes && (
            <p className="text-xs text-muted-foreground">{cred.notes}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Add Credential Form ───
function AddCredentialForm({ onAdd, onCancel }: { onAdd: (c: Credential) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('API_KEY');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !value.trim()) return;
    onAdd({ id: generateId(), name: name.trim(), type, value: value.trim(), notes: notes.trim() || undefined });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border border-brand-200 rounded-xl p-5 bg-brand-50/30 space-y-4 overflow-hidden"
    >
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Plus className="h-4 w-4" /> New Credential
      </h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Production DB"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          >
            {CREDENTIAL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Value *</label>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. postgres://user:pass@host:5432/db"
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/50 min-h-[60px] resize-y"
          required
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes (optional)</label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Staging environment only"
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" disabled={!name.trim() || !value.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add Credential
        </Button>
      </div>
    </motion.form>
  );
}

// ─── Markdown Editor / Viewer ───
function MarkdownSection({
  title,
  icon: IconComponent,
  content,
  onSave,
  isAdmin,
  placeholder,
}: {
  title: string;
  icon: React.ElementType;
  content: string;
  onSave: (value: string) => void;
  isAdmin: boolean;
  placeholder: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(content);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    setValue(content);
  }, [content]);

  const handleSave = () => {
    onSave(value);
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader className="cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <IconComponent className="h-4 w-4" />
            {title}
            {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
          {isAdmin && expanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); setEditing(!editing); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <Edit3 className="h-4 w-4 mr-1" /> {editing ? 'Preview' : 'Edit'}
            </Button>
          )}
        </div>
      </CardHeader>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0">
              {editing ? (
                <div className="space-y-3">
                  <textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full min-h-[300px] p-4 rounded-lg border border-input bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-y"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setValue(content); setEditing(false); }}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                  </div>
                </div>
              ) : value ? (
                <div className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 rounded-lg p-5 border border-border">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">{value}</pre>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  <IconComponent className="h-8 w-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">{placeholder}</p>
                  {isAdmin && (
                    <Button variant="link" size="sm" className="mt-2 text-brand-600" onClick={() => setEditing(true)}>
                      <Edit3 className="h-4 w-4 mr-1" /> Add content
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ─── Main Component ───
export function ProjectDocs({ projectId, readme, developerDocs, credentials, isAdmin }: ProjectDocsProps) {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const creds: Credential[] = Array.isArray(credentials) ? credentials : [];

  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const { data } = await apiClient.patch(`/projects/${projectId}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setSaving(false);
    },
    onError: () => {
      alert('Failed to save. Please try again.');
      setSaving(false);
    },
  });

  const handleSaveReadme = (value: string) => {
    setSaving(true);
    updateMutation.mutate({ readme: value });
  };

  const handleSaveDeveloperDocs = (value: string) => {
    setSaving(true);
    updateMutation.mutate({ developerDocs: value });
  };

  const handleAddCredential = (cred: Credential) => {
    setSaving(true);
    const updated = [...creds, cred];
    updateMutation.mutate({ credentials: updated });
    setShowAddForm(false);
  };

  const handleDeleteCredential = (id: string) => {
    setSaving(true);
    const updated = creds.filter(c => c.id !== id);
    updateMutation.mutate({ credentials: updated });
  };

  return (
    <div className="space-y-6">
      {/* Saving indicator */}
      <AnimatePresence>
        {saving && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-brand-600 bg-brand-50 border border-brand-200 px-4 py-2 rounded-lg"
          >
            <Loader2 className="h-4 w-4 animate-spin" /> Saving changes...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Credentials Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" /> Project Credentials
            </CardTitle>
            {isAdmin && (
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
                <Plus className="h-4 w-4 mr-1" /> Add Credential
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Store API keys, database URLs, and other sensitive credentials securely for your team.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {showAddForm && (
                <AddCredentialForm
                  onAdd={handleAddCredential}
                  onCancel={() => setShowAddForm(false)}
                />
              )}
            </AnimatePresence>

            {creds.length === 0 && !showAddForm ? (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                <KeyRound className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No credentials stored yet.</p>
                {isAdmin && (
                  <Button variant="link" size="sm" className="mt-2 text-brand-600" onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Add your first credential
                  </Button>
                )}
              </div>
            ) : (
              <AnimatePresence>
                {creds.map((cred) => (
                  <CredentialRow key={cred.id} cred={cred} onDelete={handleDeleteCredential} isAdmin={isAdmin} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </CardContent>
      </Card>

      {/* README Section */}
      <MarkdownSection
        title="README"
        icon={FileText}
        content={readme || ''}
        onSave={handleSaveReadme}
        isAdmin={isAdmin}
        placeholder="Add a project README with setup instructions, architecture overview, and getting started guide."
      />

      {/* Developer Docs Section */}
      <MarkdownSection
        title="Developer Documentation"
        icon={BookOpen}
        content={developerDocs || ''}
        onSave={handleSaveDeveloperDocs}
        isAdmin={isAdmin}
        placeholder="Add developer documentation with API references, coding standards, and contribution guidelines."
      />
    </div>
  );
}
