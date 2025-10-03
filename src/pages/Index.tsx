import { useState, useCallback, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Code2, Download, FileCode, Upload, Key } from 'lucide-react';
import { CodeEditor } from '@/components/CodeEditor';
import { Console, ConsoleLog } from '@/components/Console';
import { Preview } from '@/components/Preview';
import { FileTree, FileItem } from '@/components/FileTree';
import { SecretsManager } from '@/components/SecretsManager';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';

const defaultFiles: FileItem[] = [
  {
    id: 'html-1',
    name: 'index.html',
    type: 'html',
    content: `<div class="container">
  <h1>Welcome to Code Compiler</h1>
  <p>Start coding and see your changes live!</p>
  <button id="btn">Click me</button>
</div>`,
  },
  {
    id: 'css-1',
    name: 'styles.css',
    type: 'css',
    content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  text-align: center;
  max-width: 600px;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

h1 {
  color: #333;
  margin-bottom: 20px;
  font-size: 2.5rem;
}

p {
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1rem;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  font-weight: 600;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

button:active {
  transform: translateY(0);
}`,
  },
  {
    id: 'js-1',
    name: 'script.js',
    type: 'javascript',
    content: `// Get the button element
const btn = document.getElementById('btn');

// Add click event listener
btn.addEventListener('click', () => {
  console.log('Button clicked! 🎉');
  
  // Change button text
  btn.textContent = 'Clicked!';
  
  // Log some info
  console.info('This is an info message');
  console.warn('This is a warning message');
  
  // Reset after 2 seconds
  setTimeout(() => {
    btn.textContent = 'Click me';
    console.log('Button reset');
  }, 2000);
});

console.log('JavaScript loaded successfully! ✅');`,
  },
];

const Index = () => {
  const [files, setFiles] = useLocalStorage<FileItem[]>('compiler-files', defaultFiles);
  const [activeFileId, setActiveFileId] = useLocalStorage<string>('compiler-active-file', 'html-1');
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleCodeChange = useCallback(
    (value: string) => {
      setFiles((prev) =>
        prev.map((file) => (file.id === activeFileId ? { ...file, content: value } : file))
      );
    },
    [activeFileId, setFiles]
  );

  const handleFileAdd = useCallback(
    (type: FileItem['type']) => {
      const extensions = { html: '.html', css: '.css', javascript: '.js', python: '.py' };
      const newFile: FileItem = {
        id: `${type}-${Date.now()}`,
        name: `new-file${extensions[type]}`,
        type,
        content: '',
      };
      setFiles((prev) => [...prev, newFile]);
      setActiveFileId(newFile.id);
      toast.success(`New ${type} file created`);
    },
    [setFiles, setActiveFileId]
  );

  const handleFileRename = useCallback(
    (fileId: string, newName: string) => {
      setFiles((prev) =>
        prev.map((file) => (file.id === fileId ? { ...file, name: newName } : file))
      );
      toast.success('File renamed');
    },
    [setFiles]
  );

  const handleFileDelete = useCallback(
    (fileId: string) => {
      const fileToDelete = files.find((f) => f.id === fileId);
      if (!fileToDelete) return;

      const sameTypeFiles = files.filter((f) => f.type === fileToDelete.type);
      if (sameTypeFiles.length === 1) {
        toast.error(`Cannot delete the last ${fileToDelete.type} file`);
        return;
      }

      setFiles((prev) => prev.filter((file) => file.id !== fileId));
      if (activeFileId === fileId) {
        const remainingFiles = files.filter((f) => f.id !== fileId);
        setActiveFileId(remainingFiles[0]?.id || '');
      }
      toast.success('File deleted');
    },
    [files, activeFileId, setFiles, setActiveFileId]
  );

  const handleConsoleLog = useCallback((log: { type: 'log' | 'info' | 'warn' | 'error'; args: any[] }) => {
    setConsoleLogs((prev) => [
      ...prev,
      {
        type: log.type,
        message: log.args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '),
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      },
    ]);
  }, []);

  const clearConsole = useCallback(() => {
    setConsoleLogs([]);
    toast.success('Console cleared');
  }, []);

  const downloadProject = useCallback(() => {
    const htmlFiles = files.filter((f) => f.type === 'html');
    const cssFiles = files.filter((f) => f.type === 'css');
    const jsFiles = files.filter((f) => f.type === 'javascript');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <style>
${cssFiles.map((f) => `/* ${f.name} */\n${f.content}`).join('\n\n')}
  </style>
</head>
<body>
${htmlFiles.map((f) => `<!-- ${f.name} -->\n${f.content}`).join('\n\n')}
  <script>
${jsFiles.map((f) => `// ${f.name}\n${f.content}`).join('\n\n')}
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Project downloaded!');
  }, [files]);

  const handleFileImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const extension = file.name.split('.').pop()?.toLowerCase();
        let type: FileItem['type'] = 'html';
        
        if (extension === 'css') type = 'css';
        else if (extension === 'js' || extension === 'javascript') type = 'javascript';

        const newFile: FileItem = {
          id: `${type}-${Date.now()}`,
          name: file.name,
          type,
          content,
        };

        setFiles((prev) => [...prev, newFile]);
        setActiveFileId(newFile.id);
        toast.success(`File "${file.name}" imported`);
      };
      reader.readAsText(file);
      event.target.value = '';
    },
    [setFiles, setActiveFileId]
  );

  const resetCode = useCallback(() => {
    setFiles(defaultFiles);
    setActiveFileId('html-1');
    setConsoleLogs([]);
    toast.success('Project reset to default');
  }, [setFiles, setActiveFileId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        toast.success('Project auto-saved!');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Combine all files by type for preview
  const combinedHTML = files
    .filter((f) => f.type === 'html')
    .map((f) => f.content)
    .join('\n');
  const combinedCSS = files
    .filter((f) => f.type === 'css')
    .map((f) => f.content)
    .join('\n');
  const combinedJS = files
    .filter((f) => f.type === 'javascript')
    .map((f) => f.content)
    .join('\n');

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Code Compiler</h1>
          </div>
          <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary rounded-md">
            {files.length} {files.length === 1 ? 'file' : 'files'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Key className="w-4 h-4" />
                Secrets
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Secrets Manager</DialogTitle>
              </DialogHeader>
              <SecretsManager />
            </DialogContent>
          </Dialog>
          <input
            type="file"
            accept=".html,.css,.js,.py"
            onChange={handleFileImport}
            className="hidden"
            id="file-import"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('file-import')?.click()}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={resetCode} className="gap-2">
            <FileCode className="w-4 h-4" />
            Reset
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={downloadProject}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* File Tree */}
          <Panel defaultSize={15} minSize={10} maxSize={25}>
            <FileTree
              files={files}
              activeFileId={activeFileId}
              onFileSelect={setActiveFileId}
              onFileAdd={handleFileAdd}
              onFileRename={handleFileRename}
              onFileDelete={handleFileDelete}
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />

          {/* Editor Panel */}
          <Panel defaultSize={35} minSize={20}>
            <div className="h-full flex flex-col">
              <div className="border-b border-border bg-secondary/30 px-4 py-2">
                <div className="flex items-center gap-2">
                  {activeFile && (
                    <>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activeFile.type === 'html'
                            ? 'bg-orange-500'
                            : activeFile.type === 'css'
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }`}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {activeFile.name}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase">
                        {activeFile.type}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {activeFile && (
                  <CodeEditor
                    language={activeFile.type}
                    value={activeFile.content}
                    onChange={handleCodeChange}
                  />
                )}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />

          {/* Right Side: Preview + Console */}
          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={70} minSize={30}>
                <Preview
                  html={combinedHTML}
                  css={combinedCSS}
                  javascript={combinedJS}
                  onConsoleLog={handleConsoleLog}
                />
              </Panel>

              <PanelResizeHandle className="h-1 bg-border hover:bg-primary transition-colors" />

              <Panel defaultSize={30} minSize={20}>
                <Console logs={consoleLogs} onClear={clearConsole} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default Index;
