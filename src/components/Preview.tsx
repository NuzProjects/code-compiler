import { useEffect, useMemo } from 'react';
import { Eye } from 'lucide-react';
import { ConsoleLog } from './Console';

interface PreviewProps {
  html: string;
  css: string;
  javascript: string;
  onConsoleLog: (log: Omit<ConsoleLog, 'id' | 'timestamp'>) => void;
}

export const Preview = ({ html, css, javascript, onConsoleLog }: PreviewProps) => {
  const content = useMemo(() => {
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
              message: args.map(arg => {
                try {
                  return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
                } catch (e) {
                  return String(arg);
                }
              }).join(' ')
            }, '*');
            originalLog.apply(console, args);
          };

          console.error = function(...args) {
            window.parent.postMessage({
              type: 'console',
              level: 'error',
              message: args.map(arg => String(arg)).join(' ')
            }, '*');
            originalError.apply(console, args);
          };

          console.warn = function(...args) {
            window.parent.postMessage({
              type: 'console',
              level: 'warn',
              message: args.map(arg => String(arg)).join(' ')
            }, '*');
            originalWarn.apply(console, args);
          };

          console.info = function(...args) {
            window.parent.postMessage({
              type: 'console',
              level: 'info',
              message: args.map(arg => String(arg)).join(' ')
            }, '*');
            originalInfo.apply(console, args);
          };

          window.addEventListener('error', function(e) {
            window.parent.postMessage({
              type: 'console',
              level: 'error',
              message: e.message + ' (at ' + e.filename + ':' + e.lineno + ':' + e.colno + ')'
            }, '*');
          });

          window.addEventListener('unhandledrejection', function(e) {
            window.parent.postMessage({
              type: 'console',
              level: 'error',
              message: 'Unhandled Promise Rejection: ' + e.reason
            }, '*');
          });
        })();
      </script>
    `;

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${css}</style>
          ${consoleScript}
        </head>
        <body>
          ${html}
          <script>
            try {
              ${javascript}
            } catch (error) {
              console.error(error && error.message ? error.message : String(error));
            }
          </script>
        </body>
      </html>
    `;
  }, [html, css, javascript]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        onConsoleLog({
          type: event.data.level,
          message: event.data.message,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsoleLog]);

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-secondary/50">
        <Eye className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Live Preview</span>
      </div>
      <iframe
        title="preview"
        className="flex-1 w-full bg-preview-bg"
        sandbox="allow-scripts"
        srcDoc={content}
      />
    </div>
  );
};
