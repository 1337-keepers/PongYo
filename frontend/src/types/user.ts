import type { Achievements } from "./achievement";
import type { Game } from "./game";
import type { FriendShip } from "./friendship";
import type { Stat } from "./stat";
import type { Channel } from './channel';

export enum UserStatus {
  ONLINE,
  OFFLINE,
  IN_GAME,
}

export enum TwoFactorStatus {
  ENABLED,
  DISABLED,
  NOT_SET,
}

export type User = {
  id: string;
  displayname: string;
  login: string;
  email: string;
  status: UserStatus;
  stat: Stat;
  isCompleted: boolean;
  achievement: Achievements[];
  userGameHistory: Game[];
  friends: FriendShip[];// friends of the User
  myFriends: FriendShip[];// users who are Friends with this User
  totp: {
    enabled: boolean;
  } & {
    enabled: true;
    otpauth_url: string;
  };
  otpNeeded?: boolean;
  createdAt: Date;
  updatedAt: Date;
  avatar: {
    minio: boolean;
    path: string;
  };
  channels: Channel[];
};


