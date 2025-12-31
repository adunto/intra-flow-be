export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum LikeTargetType {
  POST = 'POST',
  COMMENT = 'COMMENT',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum NotificationType {
  COMMENT = 'COMMENT',
  LIKE = 'LIKE',
  APPROVAL_REQ = 'APPROVAL_REQ',
  APPROVAL_RES = 'APPROVAL_RES',
}
