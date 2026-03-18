import { describe, it, expectTypeOf } from 'vitest'
import type { User, UserCreate, UserLogin, TokenResponse } from '../user'
import type { Skill, SkillCreate, SkillListResponse, SkillDetail } from '../skill'
import type { Comment, CommentCreate, CommentWithReplies } from '../comment'

describe('类型定义', () => {
  describe('User 类型', () => {
    it('User 应该包含所有必需字段', () => {
      expectTypeOf<User>().toHaveProperty('id')
      expectTypeOf<User>().toHaveProperty('username')
      expectTypeOf<User>().toHaveProperty('email')
      expectTypeOf<User>().toHaveProperty('isAdmin')
      expectTypeOf<User>().toHaveProperty('createdAt')
    })

    it('UserCreate 应该包含注册必需字段', () => {
      expectTypeOf<UserCreate>().toHaveProperty('username')
      expectTypeOf<UserCreate>().toHaveProperty('email')
      expectTypeOf<UserCreate>().toHaveProperty('password')
    })

    it('UserLogin 应该包含登录必需字段', () => {
      expectTypeOf<UserLogin>().toHaveProperty('email')
      expectTypeOf<UserLogin>().toHaveProperty('password')
    })

    it('TokenResponse 应该包含 token 字段', () => {
      expectTypeOf<TokenResponse>().toHaveProperty('accessToken')
      expectTypeOf<TokenResponse>().toHaveProperty('tokenType')
    })
  })

  describe('Skill 类型', () => {
    it('Skill 应该包含所有必需字段', () => {
      expectTypeOf<Skill>().toHaveProperty('id')
      expectTypeOf<Skill>().toHaveProperty('name')
      expectTypeOf<Skill>().toHaveProperty('description')
      expectTypeOf<Skill>().toHaveProperty('authorId')
      expectTypeOf<Skill>().toHaveProperty('ratingAvg')
      expectTypeOf<Skill>().toHaveProperty('downloadCount')
      expectTypeOf<Skill>().toHaveProperty('favoriteCount')
    })

    it('SkillCreate 应该包含创建 Skill 必需字段', () => {
      expectTypeOf<SkillCreate>().toHaveProperty('name')
      expectTypeOf<SkillCreate>().toHaveProperty('description')
      expectTypeOf<SkillCreate>().toHaveProperty('usageScenario')
      expectTypeOf<SkillCreate>().toHaveProperty('usageMethod')
    })

    it('SkillListResponse 应该包含分页信息', () => {
      expectTypeOf<SkillListResponse>().toHaveProperty('items')
      expectTypeOf<SkillListResponse>().toHaveProperty('total')
      expectTypeOf<SkillListResponse>().toHaveProperty('page')
      expectTypeOf<SkillListResponse>().toHaveProperty('pageSize')
    })

    it('SkillDetail 应该包含详情页必需字段', () => {
      expectTypeOf<SkillDetail>().toHaveProperty('id')
      expectTypeOf<SkillDetail>().toHaveProperty('fileTree')
      expectTypeOf<SkillDetail>().toHaveProperty('content')
      expectTypeOf<SkillDetail>().toHaveProperty('isFavorite')
      expectTypeOf<SkillDetail>().toHaveProperty('userRating')
    })
  })

  describe('Comment 类型', () => {
    it('Comment 应该包含所有必需字段', () => {
      expectTypeOf<Comment>().toHaveProperty('id')
      expectTypeOf<Comment>().toHaveProperty('skillId')
      expectTypeOf<Comment>().toHaveProperty('userId')
      expectTypeOf<Comment>().toHaveProperty('username')
      expectTypeOf<Comment>().toHaveProperty('content')
      expectTypeOf<Comment>().toHaveProperty('createdAt')
    })

    it('CommentCreate 应该包含创建评论必需字段', () => {
      expectTypeOf<CommentCreate>().toHaveProperty('content')
      expectTypeOf<CommentCreate>().toHaveProperty('parentId')
    })

    it('CommentWithReplies 应该支持嵌套回复', () => {
      expectTypeOf<CommentWithReplies>().toHaveProperty('id')
      expectTypeOf<CommentWithReplies>().toHaveProperty('replies')
    })
  })
})
