import { useState, useCallback, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Code2, Download, FileCode } from 'lucide-react';
import { CodeEditor } from '@/components/CodeEditor';
import { Console, ConsoleLog } from '@/components/Console';
import { Preview } from '@/components/Preview';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';

type FileType = 'html' | 'css' | 'javascript';

const defaultCode = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Code</title>
</head>
<body>
  <div class="container">
    <h1>Welcome to Code Compiler</h1>
    <p>Start coding and see your changes live!</p>
    <button id="btn">Click me</button>
  </div>
</body>
</html>`,
  css: `* {
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
  javascript: `// Get the button element
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
};

const Index = () => {
  const [activeFile, setActiveFile] = useState<FileType>('html');
  const [code, setCode] = useLocalStorage('compiler-code', defaultCode);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);

  const handleCodeChange = useCallback(
    (value: string) => {
      setCode((prev) => ({
        ...prev,
        [activeFile]: value,
      }));
    },
    [activeFile, setCode]
  );

  const handleConsoleLog = useCallback((log: Omit<ConsoleLog, 'id' | 'timestamp'>) => {
    setConsoleLogs((prev) => [
      ...prev,
      {
        ...log,
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
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <style>
${code.css}
  </style>
</head>
<body>
${code.html}
  <script>
${code.javascript}
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
  }, [code]);

  const resetCode = useCallback(() => {
    setCode(defaultCode);
    setConsoleLogs([]);
    toast.success('Code reset to default');
  }, [setCode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        toast.success('Code auto-saved!');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
            Live Editor
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetCode}
            className="gap-2"
          >
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
          {/* Editor Panel */}
          <Panel defaultSize={40} minSize={20}>
            <div className="h-full flex flex-col">
              <div className="border-b border-border bg-secondary/30 px-4 py-2">
                <Tabs value={activeFile} onValueChange={(v) => setActiveFile(v as FileType)}>
                  <TabsList className="bg-background">
                    <TabsTrigger value="html" className="gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      HTML
                    </TabsTrigger>
                    <TabsTrigger value="css" className="gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      CSS
                    </TabsTrigger>
                    <TabsTrigger value="javascript" className="gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      JavaScript
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex-1 overflow-hidden">
                <CodeEditor
                  language={activeFile}
                  value={code[activeFile]}
                  onChange={handleCodeChange}
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />

          {/* Right Side: Preview + Console */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={70} minSize={30}>
                <Preview
                  html={code.html}
                  css={code.css}
                  javascript={code.javascript}
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
