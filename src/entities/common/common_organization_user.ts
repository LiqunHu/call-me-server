import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'
import { base_entity } from '@/entities/base_entity'

@Entity({ name: 'tbl_common_organization_user' })
export class common_organization_user extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: 'primary' })
  organization_user_id: number

  @Column({ comment: '外键 tbl_common_user' })
  organization_id: number

  @Column({ length: 36, comment: 'foreign key tbl_common_user' })
  user_id: string

  @Column({
    default: '',
    length: 2,
    comment: 'default organization 1--default only one'
  })
  organization_user_default_flag: string

  @Column(() => base_entity, { prefix: '' })
  base: base_entity
}
