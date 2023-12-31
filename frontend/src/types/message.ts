import type { User } from "./user"

export type Message = {
  id: string
  content: string
  channelId: string
  userId: string
  user: User
  createdAt: Date
	updatedAt: Date
}