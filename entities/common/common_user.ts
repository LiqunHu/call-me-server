import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ValueTransformer,
  BaseEntity
} from 'typeorm'
import crypto from 'crypto'
import { base_entity } from '@/entities/base_entity'

const toMD5Hash: ValueTransformer = {
  from: (value: string) => value,
  to: (value: string) => crypto.createHash('sha256').update(value).digest("hex")
}

@Entity({ name: 'tbl_common_user' })
export class common_user extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { comment: '' })
  user_id: string

  @Column({ length: 100, default: '', comment: '' })
  user_username: string

  @Column({ length: 10, comment: '' })
  user_type: string

  @Column({ length: 100, default: '', comment: '' })
  user_email: string

  @Column({ length: 5, default: '86', comment: '' })
  user_country_code: string

  @Column({ length: 20, default: '', comment: '' })
  user_phone: string

  @Column({ length: 50, default: '', comment: 'discord' })
  user_discord: string

  @Column({ length: 50, default: '', comment: 'telegram' })
  user_telegram: string

  @Column({ length: 100, default: '', comment: 'web3address' })
  user_account: string

  @Column({ length: 100, transformer: toMD5Hash, comment: '' })
  user_password: string

  @Column({ default: 0, comment: '' })
  user_password_error: number

  @Column({ comment: '', nullable: true })
  user_login_time: Date

  @Column({ length: 100, default: '', comment: '' })
  user_name: string

  @Column({ length: 1, default: '', comment: '' })
  user_gender: string

  @Column({ length: 200, default: '', comment: '' })
  user_avatar: string

  @Column({ length: 20, default: '', comment: '' })
  user_province: string

  @Column({ length: 20, default: '', comment: '' })
  user_city: string

  @Column({ length: 20, default: '', comment: '' })
  user_district: string

  @Column({ length: 100, default: '', comment: '' })
  user_address: string

  @Column({ length: 20, default: '', comment: '' })
  user_zipcode: string

  @Column({ length: 200, default: '', comment: '' })
  user_company: string

  @Column({ length: 200, default: '', comment: '' })
  user_remark: string

  @Column(() => base_entity, { prefix: '' })
  base: base_entity
}
