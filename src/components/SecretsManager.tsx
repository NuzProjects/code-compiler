import { useState } from 'react';
import { Eye, EyeOff, Plus, Trash2, Key } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

interface Secret {
  id: string;
  key: string;
  value: string;
}

export const SecretsManager = () => {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [showValues, setShowValues] = useState<{ [key: string]: boolean }>({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const addSecret = () => {
    if (!newKey.trim() || !newValue.trim()) {
      toast.error('Both key and value are required');
      return;
    }

    if (secrets.some((s) => s.key === newKey)) {
      toast.error('A secret with this key already exists');
      return;
    }

    const secret: Secret = {
      id: `secret-${Date.now()}`,
      key: newKey.trim(),
      value: newValue.trim(),
    };

    setSecrets((prev) => [...prev, secret]);
    setNewKey('');
    setNewValue('');
    toast.success('Secret added successfully');
  };

  const deleteSecret = (id: string) => {
    setSecrets((prev) => prev.filter((s) => s.id !== id));
    toast.success('Secret deleted');
  };

  const toggleShowValue = (id: string) => {
    setShowValues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Secrets Manager
        </CardTitle>
        <CardDescription>
          Store sensitive information like API keys securely. These values are hidden by default.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Secret */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="secret-key">Key</Label>
              <Input
                id="secret-key"
                placeholder="API_KEY"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret-value">Value</Label>
              <Input
                id="secret-value"
                type="password"
                placeholder="your-secret-value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={addSecret} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Secret
          </Button>
        </div>

        {/* Secrets List */}
        {secrets.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Stored Secrets</h3>
            <div className="space-y-2">
              {secrets.map((secret) => (
                <div
                  key={secret.id}
                  className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{secret.key}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {showValues[secret.id] ? secret.value : '••••••••••••••••'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleShowValue(secret.id)}
                  >
                    {showValues[secret.id] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSecret(secret.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {secrets.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No secrets stored yet. Add your first secret above.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
