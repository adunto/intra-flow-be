import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChatMessage } from "../chatMessage/chatMessage.entity";
import { ChatRoomMember } from "../chatRoomMember/chatRoomMember.entity";

// #####################
// # 채팅방
// #####################
@Entity("chat_rooms")
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  // --- 타임 스탬프 ---

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // --- relations ---

  // 채팅방[ChatRoom] : 채팅 참여자[ChatRoomMember] (1:N)
  @OneToMany(
    () => ChatRoomMember,
    (chatRoomMember) => chatRoomMember.chatRoom,
  )
  chatRoomMemberships: ChatRoomMember[];

  // 채팅방[ChatRoom] : 채팅 메세지[ChatMessage] (1:N)
  @OneToMany(
    () => ChatMessage,
    (chatMessage) => chatMessage.chatRoom,
  )
  chatMessages: ChatMessage[];
}
