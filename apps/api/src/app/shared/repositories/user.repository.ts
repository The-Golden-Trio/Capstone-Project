import type { User, UserGraphPosition } from '../domain';

export interface UserRepository {
  findById(userId: string): Promise<User | null>;
  upsert(user: User): Promise<User>;
}

export interface UserGraphPositionRepository {
  find(userId: string): Promise<UserGraphPosition | null>;
  set(userId: string, currentRoleCode: string): Promise<UserGraphPosition>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
export const USER_GRAPH_POSITION_REPOSITORY = Symbol('UserGraphPositionRepository');
