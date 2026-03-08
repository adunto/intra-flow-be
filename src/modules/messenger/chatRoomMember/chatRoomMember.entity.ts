import { User } from "@modules/users/users.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChatMessage } from "../chatMessage/chatMessage.entity";
import { ChatRoom } from "../chatRoom/chatRoom.entity";

// #####################
// # 유저 채팅방 참여 상태
// #####################
@Entity("chat_room_members")
export class ChatRoomMember {
  @PrimaryGeneratedColumn()
  id: number;

  // 채팅방 이름
  @Column({ name: "room_name", nullable: true })
  roomName: string;

  // 가장 최근에 읽은 메세지 ID
  @Column({ type: "bigint", name: "last_read_message_id", nullable: true })
  lastReadMessageId: string;

  // 참여 시간을 기준으로 이전 대화는 읽기 불가
  @CreateDateColumn({ name: "joined_at" })
  joinedAt: Date;

  // --- relations ---

  // 채팅 참여자[ChatRoomMember] : 사용자[User] (N:1)
  @ManyToOne(
    () => User,
    (user) => user.chatRoomMemberships,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "user_id" })
  userId: number;

  // 채팅 참여자[ChatRoomMember] : 채팅방[ChatRoom] (N:1)
  @ManyToOne(
    () => ChatRoom,
    (chatRoom) => chatRoom.chatRoomMemberships,
  )
  @JoinColumn({ name: "chat_room_id" })
  chatRoom: ChatRoom;

  @Column({ name: "chat_room_id" })
  chatRoomId: number;

  // 채팅 참여자[ChatRoomMember] : 채팅 메세지[ChatMessage] (1:N)
  @OneToMany(
    () => ChatMessage,
    (chatMessage) => chatMessage.chatRoomMember,
  )
  chatMessages: ChatMessage[];
}
