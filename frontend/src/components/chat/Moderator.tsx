import React, { useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import type { Channel } from '@/types/channel';
import { type ToastOptions, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetcher } from '@/utils/fetcher';

interface ModeratorProps {
  channel: Channel;
}

export default function Moderator({ channel }: ModeratorProps) {
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const toastOptions: ToastOptions<object> = {
    position: 'bottom-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    theme: 'dark',
  };

  const addModerator = async () => {
    try {
      const modCandidate = channel.members.find(
        (member) => member.displayname === userName.trim(),
      );
      if (!modCandidate) return toast.error('User not found', toastOptions);
      await fetcher.patch(
        `/chat/channel/${channel.id}/moderators`,
        { userId: modCandidate?.id },
      );
      setUserName('');
      setShowDialog(false);
    } catch (err: unknown) {
      const error = err as { response: { data: { message: string } } };
      toast.error(error.response.data.message, toastOptions);
    }
  };

  const deleteModerator = async () => {
    try {
      const mod = channel.moderators.find(
        (moderator) => moderator.displayname === userName.trim(),
      );
      if (!mod) return toast.error('User not found', toastOptions);
      await fetcher.delete(
        `/chat/channel/${channel.id}/moderators?userId=${mod.id}`,
      );
      setUserName('');
      setShowDialog(false);
    } catch (err) {
      const error = err as { response: { data: { message: string } } };
      toast.error(error.response.data.message, toastOptions);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="m-[1rem]" onClick={() => setShowDialog(true)}>
          Moderators
        </Button>
      </DialogTrigger>
      {showDialog && (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add or delete moderator</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                username
              </Label>
              <Input
                id="name"
                value={userName}
                placeholder="username"
                className="col-span-3"
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="bg-[#C83030]"
              onClick={() => {
                void deleteModerator();
              }}
            >
              delete moderator
            </Button>
            <Button
              onClick={() => {
                void addModerator();
              }}
            >
              add moderator
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
