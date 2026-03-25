import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'
import { base_entity } from '@/entities/base_entity'

@Entity({ name: 'tbl_common_user_groups' })
export class common_user_groups extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: '' })
  user_groups_id: number

  @Column({ length: 36, comment: '' })
  user_id: string

  @Column({ comment: '' })
  usergroup_id: number

  @Column(() => base_entity, { prefix: '' })
  base: base_entity
}
