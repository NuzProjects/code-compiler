import { FileCode, Trash2, Edit2, Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface FileItem {
  id: string;
  name: string;
  type: 'html' | 'css' | 'javascript';
  content: string;
}

interface FileTreeProps {
  files: FileItem[];
  activeFileId: string;
  onFileSelect: (fileId: string) => void;
  onFileAdd: (type: FileItem['type']) => void;
  onFileRename: (fileId: string, newName: string) => void;
  onFileDelete: (fileId: string) => void;
}

export const FileTree = ({
  files,
  activeFileId,
  onFileSelect,
  onFileAdd,
  onFileRename,
  onFileDelete,
}: FileTreeProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getFileIcon = (type: FileItem['type']) => {
    const colors = {
      html: 'text-orange-500',
      css: 'text-blue-500',
      javascript: 'text-yellow-500',
    };
    return <FileCode className={`w-4 h-4 ${colors[type]}`} />;
  };

  const startRename = (file: FileItem) => {
    setEditingId(file.id);
    setEditingName(file.name);
  };

  const confirmRename = (fileId: string) => {
    if (editingName.trim()) {
      onFileRename(fileId, editingName.trim());
    }
    setEditingId(null);
  };

  const groupedFiles = files.reduce((acc, file) => {
    if (!acc[file.type]) acc[file.type] = [];
    acc[file.type].push(file);
    return acc;
  }, {} as Record<FileItem['type'], FileItem[]>);

  return (
    <div className="h-full flex flex-col bg-secondary/30 border-r border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Files</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-4">
        {(['html', 'css', 'javascript'] as const).map((type) => (
          <div key={type} className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                {type === 'javascript' ? 'JS' : type}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onFileAdd(type)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            {groupedFiles[type]?.map((file) => (
              <div
                key={file.id}
                className={`group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                  activeFileId === file.id
                    ? 'bg-primary/20 text-foreground'
                    : 'hover:bg-secondary text-muted-foreground'
                }`}
                onClick={() => onFileSelect(file.id)}
              >
                {getFileIcon(file.type)}
                {editingId === file.id ? (
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => confirmRename(file.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmRename(file.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="h-6 text-xs"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <span className="flex-1 text-xs truncate">{file.name}</span>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(file);
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(file.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onFileDelete(deleteId);
                setDeleteId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
