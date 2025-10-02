import { X, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ConsoleLog {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
}

interface ConsoleProps {
  logs: ConsoleLog[];
  onClear: () => void;
}

export const Console = ({ logs, onClear }: ConsoleProps) => {
  const getLogColor = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'error':
        return 'text-error';
      case 'warn':
        return 'text-warning';
      case 'info':
        return 'text-accent';
      default:
        return 'text-foreground';
    }
  };

  const getLogPrefix = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '>';
    }
  };

  return (
    <div className="h-full flex flex-col bg-console-bg border-t border-border">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Console</span>
          <span className="text-xs text-muted-foreground">
            ({logs.length} {logs.length === 1 ? 'message' : 'messages'})
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-7 px-2 text-xs hover:bg-secondary"
        >
          <X className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        {logs.length === 0 ? (
          <div className="text-muted-foreground text-sm flex items-center justify-center h-full">
            No console output yet...
          </div>
        ) : (
          <div className="space-y-1 font-mono text-sm">
            {logs.map((log) => (
              <div key={log.id} className={`flex gap-2 ${getLogColor(log.type)}`}>
                <span className="select-none">{getLogPrefix(log.type)}</span>
                <span className="break-all">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
