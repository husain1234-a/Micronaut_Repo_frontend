import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from '../../hooks/use-toast';
import { api } from '../../src/utils/api';
import { RadioGroup } from '../ui/radio-group';

interface BroadcastNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priorities = [
  { label: 'Low Priority', value: 'LOW', description: 'General updates, non-urgent information' },
  { label: 'Medium Priority', value: 'MEDIUM', description: 'Important updates, moderate urgency' },
  { label: 'High Priority', value: 'HIGH', description: 'Critical updates, immediate attention needed' },
];

export const BroadcastNotificationDialog: React.FC<BroadcastNotificationDialogProps> = ({ open, onOpenChange }) => {
  const [step, setStep] = useState<'prompt' | 'edit'>('prompt');
  const [prompt, setPrompt] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [notificationType, setNotificationType] = useState<'email' | 'push'>('push');

  // Extract title from first line of message
  const extractedTitle = useMemo(() => {
    const lines = message.trim().split('\n');
    return lines[0]?.trim().replace(/[#*_]/g, '') || 'Broadcast'; // Remove markdown characters
  }, [message]);

  const handleAIGenerate = async () => {
    setLoading(true);
    try {
      const res = await api<{ generatedMessage: string }>('/notifications/ai-generate', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
        requiresAuth: true,
      });
      setMessage(res.generatedMessage || '');
      setStep('edit');
      toast({ title: 'AI Message Generated', description: 'You can now edit the generated message.' });
    } catch (err: any) {
      toast({ title: 'AI Generation Failed', description: err.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    setLoading(true);
    try {
      await api('/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          title: extractedTitle,
          message: message.substring(extractedTitle.length).trim(),
          priority,
          channel: notificationType,
        }),
        requiresAuth: true,
      });
      toast({ title: 'Broadcast Success', description: 'Notification has been sent to all users.' });
      setStep('prompt');
      setPrompt('');
      setMessage('');
      setNotificationType('push');
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Broadcast Failed', description: err.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  // TODO: API integration, feedback, etc.

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Broadcast Notification</DialogTitle>
        </DialogHeader>
        {step === 'prompt' && (
          <div className="space-y-4">
            <Input
              placeholder="Enter a prompt for AI (e.g. 'Announce new holiday')"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button onClick={handleAIGenerate} disabled={!prompt || loading}>
                Generate with AI
              </Button>
              <Button variant="outline" onClick={() => { setStep('edit'); setMessage(''); }} disabled={loading}>
                Write Manually
              </Button>
            </div>
          </div>
        )}
        {step === 'edit' && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              The first line will be used as the notification subject/title.
            </div>
            <Textarea
              placeholder="Write your message here or edit the AI-generated message. The first line will be used as the subject/title."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              disabled={loading}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority Level</label>
              <Select value={priority} onValueChange={setPriority} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      <div>
                        <div className="font-medium">{p.label}</div>
                        <div className="text-sm text-muted-foreground">{p.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notification Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="notificationType"
                    value="push"
                    checked={notificationType === 'push'}
                    onChange={() => setNotificationType('push')}
                    disabled={loading}
                  />
                  Push Notification
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="notificationType"
                    value="email"
                    checked={notificationType === 'email'}
                    onChange={() => setNotificationType('email')}
                    disabled={loading}
                  />
                  Email
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleBroadcast} disabled={!message || loading}>
                Broadcast
              </Button>
              <Button variant="outline" onClick={() => { setStep('prompt'); setPrompt(''); setMessage(''); setNotificationType('push'); }} disabled={loading}>
                Back
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 