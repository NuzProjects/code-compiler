import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import { FolderOpen, Plus, Save, Trash2 } from 'lucide-react';
import { FileItem } from './FileTree';

interface Project {
  id: string;
  name: string;
  files: FileItem[];
  updated_at: string;
}

interface ProjectManagerProps {
  currentFiles: FileItem[];
  onLoadProject: (files: FileItem[]) => void;
  onNewProject: () => void;
}

export const ProjectManager = ({ currentFiles, onLoadProject, onNewProject }: ProjectManagerProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Failed to load projects');
    } else {
      setProjects((data as unknown as Project[]) || []);
    }
  };

  const saveProject = async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be signed in to save projects');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('projects')
      .insert({
        name: projectName,
        files: currentFiles as any,
      } as any);

    setLoading(false);

    if (error) {
      toast.error('Failed to save project');
    } else {
      toast.success('Project saved successfully!');
      setProjectName('');
      setOpenDialog(false);
      loadProjects();
    }
  };

  const loadProject = (project: Project) => {
    onLoadProject(project.files);
    toast.success(`Loaded project: ${project.name}`);
    setOpenDialog(false);
  };

  const deleteProject = async (projectId: string, projectName: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      toast.error('Failed to delete project');
    } else {
      toast.success(`Deleted project: ${projectName}`);
      loadProjects();
    }
  };

  const handleNewProject = () => {
    onNewProject();
    toast.success('Started new project');
    setOpenDialog(false);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FolderOpen className="w-4 h-4" />
          Projects
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Projects</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Save Current Project */}
          <div className="space-y-3">
            <Label>Save Current Project</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <Button onClick={saveProject} disabled={loading} className="gap-2">
                <Save className="w-4 h-4" />
                Save
              </Button>
            </div>
          </div>

          {/* New Project */}
          <Button onClick={handleNewProject} variant="outline" className="w-full gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>

          {/* Load Projects */}
          <div className="space-y-3">
            <Label>Your Projects</Label>
            <ScrollArea className="h-[300px] border rounded-lg p-4">
              {projects.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No saved projects yet
                </p>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(project.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadProject(project)}
                        >
                          Load
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProject(project.id, project.name)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
