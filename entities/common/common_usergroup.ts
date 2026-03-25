import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'
import { base_entity } from '@/entities/base_entity'

@Entity({ name: 'tbl_common_usergroup' })
export class common_usergroup extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: '' })
  usergroup_id: number

  @Column({ comment: '' })
  organization_id: number

  @Column({ default: '', length: 3, comment: '' })
  usergroup_type: string

  @Column({ default: '', length: 20, comment: '' })
  usergroup_code: string

  @Column({ default: '', length: 50, comment: '' })
  usergroup_name: string

  @Column({ default: '', length: 2, comment: '' })
  node_type: string

  @Column({ default: '', length: 30, comment: '' })
  parent_id: string

  @Column(() => base_entity, { prefix: '' })
  base: base_entity
}
