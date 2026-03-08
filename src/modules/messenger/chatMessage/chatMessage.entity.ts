import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChatRoom } from "../chatRoom/chatRoom.entity";
import { ChatRoomMember } from "../chatRoomMember/chatRoomMember.entity";

// #####################
// # 채팅 메세지
// #####################
@Entity("chats")
export class ChatMessage {
  @PrimaryGeneratedColumn({ type: "bigint" })
  @ApiProperty({ description: "채팅 ID", example: "1" })
  id: string;

  @Column({ type: "varchar", length: 255 })
  @ApiProperty({ description: "채팅 내용", example: "안녕하세요" })
  content: string;

  // --- 타임 스탬프 ---

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // --- relations ---

  // 채팅 참여자[ChatRoomMember] : 채팅 메세지[ChatMessage] (1:N)
  @ManyToOne(
    () => ChatRoomMember,
    (chatRoomMember) => chatRoomMember.chatMessages,
  )
  @JoinColumn({ name: "chat_room_member_id" })
  chatRoomMember: ChatRoomMember;

  @Column({ name: "chat_room_member_id" })
  chatRoomMemberId: number;

  // 채팅방[ChatRoom] : 채팅 메세지[ChatMessage] (1:N)
  @ManyToOne(
    () => ChatRoom,
    (chatRoom) => chatRoom.chatMessages,
  )
  @JoinColumn({ name: "chat_room_id" })
  chatRoom: ChatRoom;

  @Column({ name: "chat_room_id" })
  chatRoomId: number;
}
