export interface User {
  userId: string;
  displayName: string;
}

/** Vị trí hiện tại của user trên graph (1 row/user). */
export interface UserGraphPosition {
  userId: string;
  currentRoleCode: string;
  updatedAt: string;
}
