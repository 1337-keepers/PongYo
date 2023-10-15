import type { User } from '@/types/User';
import type { Channel } from '@/types/Channel';
import React, { useEffect, useState } from 'react';
import ChannelsList from './ChannelsList';
import ChannelContent from './ChannelContent';
import { ScrollArea } from '../ui/scroll-area';
import { io, Socket } from 'socket.io-client';
import { useSocket } from '@/contexts/socket-context';

export default function Chat({ user }: { user: User }) {
  const { chatSocket } = useSocket();
  const [channels, setChannels] = useState<Channel[]>(user.channels);
  const [selectedChannel, setSelectedChannel] = useState<Channel | undefined>(
    undefined,
  );

  useEffect(() => {
    chatSocket.on('message', (data) => {
      console.log(data);
      const channel = channels.find((channel) => channel.id === data.channelId);
      if (channel) {
        channel.messages.push(data);
        setChannels([...channels]);
        if (selectedChannel?.id === channel.id) {
          setSelectedChannel(channel);
        }
      }
    });
  }, []);

  const updateChannels = (channels: Channel[]) => {
    setChannels(channels);
  };

  const updateSelectedChannel = (channel: Channel | undefined) => {
    setSelectedChannel(channel);
  };

  return (
    //Chat Box
    <div className="flex h-[50rem] w-[60rem] rounded-[6px] bg-[#33437D] text-white">
      <div className="flex h-[full] w-[25%] flex-col">
        <div className="flex h-[7%] items-center pl-[2rem] text-2xl ">
          chat room
        </div>
        {/* Seperator */}
        <div className="ml-1 rounded-l-full border"></div>
        <ScrollArea className="h-[93%]">
          <ChannelsList
            channels={channels}
            updateSelectedChannel={updateSelectedChannel}
            selectedChannel={selectedChannel}
          />
        </ScrollArea>
      </div>
      {/* Seperator */}
      <div className="my-1 rounded-full border"></div>
      <ChannelContent
        channel={selectedChannel}
        updateSelectedChannel={updateSelectedChannel}
        user={user}
        channels={channels}
        updateChannels={updateChannels}
        // socket={socket}
      />
    </div>
  );
}
