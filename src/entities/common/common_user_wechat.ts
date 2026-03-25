import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'
import { base_entity } from '@/entities/base_entity'

@Entity({ name: 'tbl_common_user_wechat' })
export class common_user_wechat extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: '' })
  user_wechat_id: number

  @Column({ length: 36, comment: '' })
  user_id: string

  @Column({ length: 100, comment: '' })
  user_wechat_appid: string

  @Column({ default: '', length: 100, comment: '' })
  user_wechat_openid: string

  @Column({ default: '', length: 100, comment: '' })
  user_wechat_unionid: string

  @Column({ default: '', length: 100, comment: '' })
  user_wechat_nickname: string

  @Column({ default: '', length: 2, comment: '' })
  user_wechat_sex: string

  @Column({ default: '', length: 20, comment: '' })
  user_wechat_province: string

  @Column({ default: '', length: 20, comment: '' })
  user_wechat_city: string

  @Column({ default: '', length: 20, comment: '' })
  user_wechat_country: string

  @Column({ default: '', length: 200, comment: '' })
  user_wechat_headimgurl: string

  @Column({
    default: '0',
    length: 10,
    comment: ''
  })
  user_wechat_disturbing_flag: string

  @Column(() => base_entity, { prefix: '' })
  base: base_entity
}
