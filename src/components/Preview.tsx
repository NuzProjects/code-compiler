import { useEffect, useMemo, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';

interface PreviewProps {
  html: string;
  css: string;
  javascript: string;
  onConsoleLog: (log: { type: 'log' | 'info' | 'warn' | 'error'; args: any[] }) => void;
}

export const Preview = ({ html, css, javascript, onConsoleLog }: PreviewProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Listen for console messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'console') {
        onConsoleLog({
          type: event.data.level,
          args: event.data.args,
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsoleLog]);

  const srcDoc = useMemo(() => {
    const consoleScript = `
      <script>
        (function() {
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;
          const originalInfo = console.info;

          console.log = function(...args) {
            window.parent.postMessage({
              type: 'console',
              level: 'log',
              args: args
            }, '*');
            originalLog.apply(console, args);
          };

          console.error = function(...args) {
            window.parent.postMessage({
              type: 'console',
              level: 'error',
              args: args
            }, '*');
            originalError.apply(console, args);
          };

          console.warn = function(...args) {
            window.parent.postMessage({
              type: 'console',
              level: 'warn',
              args: args
            }, '*');
            originalWarn.apply(console, args);
          };

          console.info = function(...args) {
            window.parent.postMessage({
              type: 'console',
              level: 'info',
              args: args
            }, '*');
            originalInfo.apply(console, args);
          };

          window.addEventListener('error', function(e) {
            window.parent.postMessage({
              type: 'console',
              level: 'error',
              args: [e.message + ' at ' + e.filename + ':' + e.lineno]
            }, '*');
          });
        })();
      </script>
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${css}</style>
          ${consoleScript}
        </head>
        <body>
          ${html}
          <script>${javascript}</script>
        </body>
      </html>
    `;
  }, [html, css, javascript]);

  return (
    <>
      <div className="h-full w-full bg-preview-bg relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <iframe
          srcDoc={srcDoc}
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
          className="w-full h-full border-0"
        />
      </div>
      
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] border-4 border-primary/20 rounded-lg overflow-hidden shadow-2xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-background/90 hover:bg-background"
              onClick={() => setIsFullscreen(false)}
            >
              <Minimize2 className="h-5 w-5" />
            </Button>
            <iframe
              srcDoc={srcDoc}
              title="Fullscreen Preview"
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-full border-0 bg-white"
            />
          </div>
        </div>
      )}
    </>
  );
};
