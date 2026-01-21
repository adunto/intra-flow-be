// 유저
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

// 좋아요 : 게시물 | 댓글
export enum LikeTargetType {
  POST = 'POST',
  COMMENT = 'COMMENT',
}

// 접근 상태 : 대기중 | 승인됨 | 거부됨
export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// 알림 : 댓글 좋아요 알림
export enum NotificationType {
  COMMENT = 'COMMENT',
  LIKE = 'LIKE',
  APPROVAL_REQ = 'APPROVAL_REQ',
  APPROVAL_RES = 'APPROVAL_RES',
}
