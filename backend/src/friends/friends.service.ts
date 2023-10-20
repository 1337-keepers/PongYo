import { PrismaService } from '@/prisma/prisma.service';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendState, Prisma } from '@prisma/client';
import {
  FriendQueryDTO,
  FriendShipAction,
  FriendShipActionDTO,
} from './friends.dto';
import { buildPagination } from '@/global/global.utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendNotificationPayload } from '@/ws/chat/chat.interface';
import {
  friendChecking,
  getFriendShipStatus,
  swapUsers,
} from './friends.helpers';

@Injectable()
export class FriendService {
  constructor(
    private prismaService: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async friendChecking(userId: string, friendId: string) {
    return await friendChecking.bind(this)(userId, friendId);
  }

  async getUserFriends(
    userId: string,
    friendId: string,
    query: FriendQueryDTO,
  ) {
    const { friendId: _friendId, friendShip } = await this.friendChecking(
      userId,
      friendId,
    );

    if (userId !== _friendId && (!friendId || friendShip.state !== 'ACCEPTED'))
      throw new ForbiddenException(); // you can only see friends of your friends

    // TODO: without testing !

    const where = {
      OR: [
        {
          myFriends: {
            some: { userId: _friendId, state: query.state },
          },
        },
        {
          friends: { some: { userId: _friendId, state: query.state } },
        },
      ],
    } satisfies Prisma.UserWhereInput;

    const [totalCount, users] = await this.prismaService.$transaction([
      this.prismaService.user.count({ where }),
      this.prismaService.user.findMany({
        where,
        skip: query.getSkip(),
        take: query.limit,
        orderBy: {
          updatedAt: 'desc',
        },
      }),
    ]);
    return buildPagination(users, query.limit, totalCount);
  }

  async sendFriendRequest(userId: string, friendId: string) {
    const { friendShip, friendId: _friendId } = await this.friendChecking(
      userId,
      friendId,
    );
    if (userId === _friendId) throw new ConflictException();
    if (friendShip && friendShip.state !== 'NONE')
      throw new ForbiddenException();

    const newFriendShip = await this.prismaService.friend.upsert({
      where: { id: friendShip?.id || '' },
      create: {
        userId,
        friendId: _friendId,
        state: 'PENDING',
      },
      update: {
        state: 'PENDING',
        ...swapUsers(userId, _friendId),
      },
    });

    if (!friendShip || friendShip.state === 'NONE') {
      const { sender, receiver } = await this.prismaService.notification.create(
        {
          data: {
            notifType: 'FRIEND_REQUEST',
            senderId: userId,
            receiverId: _friendId,
            content: {}, // ?INFO: add some details
          },
          include: {
            receiver: true,
            sender: true,
          },
        },
      );

      this.eventEmitter.emit('chat.send-notification', {
        sender,
        receiver,
        type: 'FRIEND_REQUEST',
      } satisfies SendNotificationPayload);
    }

    return newFriendShip;
  }

  async blockFriend(userId: string, friendId: string) {
    const { friendShip, friendId: _friendId } = await this.friendChecking(
      userId,
      friendId,
    );
    if (userId === _friendId) throw new ConflictException();
    if (!friendShip) throw new NotFoundException();

    try {
      return await this.prismaService.friend.update({
        where: {
          id: friendShip.id,
          NOT: {
            state: 'BLOCKED',
          },
        },
        data: {
          state: 'BLOCKED',
          ...swapUsers(userId, _friendId),
        },
      });
    } catch (err) {
      return friendShip;
    }
  }

  async updateFriendShip(
    userId: string,
    friendId: string,
    friendShipAction: FriendShipActionDTO,
  ) {
    const { friendShip, friendId: _friendId } = await this.friendChecking(
      userId,
      friendId,
    );

    if (userId === _friendId) throw new ConflictException();
    if (!friendShip) throw new NotFoundException();
    const friendShipStatus = getFriendShipStatus(userId, friendShip);
    if (friendShipStatus === 'PENDING_BY_USER') throw new ForbiddenException();

    const oldFriendStatus: Record<any, FriendState> = {
      [FriendShipAction.CANCEL]: 'PENDING',
      [FriendShipAction.ACCEPT]: 'PENDING',
      [FriendShipAction.UNBLOCK]: 'BLOCKED',
    };
    const newFriendStatus: Record<any, FriendState> = {
      [FriendShipAction.CANCEL]: 'REFUSED',
      [FriendShipAction.ACCEPT]: 'ACCEPTED',
      [FriendShipAction.UNBLOCK]: 'NONE',
    };

    if (friendShipAction.action) {
      try {
        const updatedFriendShip = await this.prismaService.friend.update({
          where: {
            id: friendShip.id,
            state: oldFriendStatus[friendShipAction.action],
          },
          data: {
            state: newFriendStatus[friendShipAction.action],
            ...swapUsers(userId, _friendId), // just in case friendId used as login !
          },
        });

        if (
          friendShip.state === 'PENDING' &&
          updatedFriendShip.state === 'ACCEPTED'
        ) {
          const { sender, receiver } =
            await this.prismaService.notification.create({
              data: {
                notifType: 'FRIEND_ACCEPT',
                senderId: userId,
                receiverId: _friendId,
                content: {}, // ?INFO: add some details
              },
              include: {
                receiver: true,
                sender: true,
              },
            });

          this.eventEmitter.emit('chat.send-notification', {
            sender,
            receiver,
            type: 'FRIEND_ACCEPT',
          } satisfies SendNotificationPayload);
        }

        return updatedFriendShip;
      } catch (err) {
        return friendShip;
      }
    }

    return { friendShip };
  }
}