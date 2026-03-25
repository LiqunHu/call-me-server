import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'
import { base_entity } from '@/entities/base_entity'

@Entity({ name: 'tbl_common_organizationmenu' })
export class common_organizationmenu extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: '' })
  organizationmenu_id: number

  @Column({ comment: '' })
  organization_id: number

  @Column({ default: '', length: 300, comment: '' })
  organizationmenu_name: string

  @Column({ default: '', length: 100, comment: '' })
  organizationmenu_icon: string

  @Column({ default: 0, comment: '' })
  organizationmenu_index: number

  @Column({ nullable: true, comment: 'api id' })
  api_id: number

  @Column({ nullable: true, length: 2, comment: '' })
  node_type: string

  @Column({ default: '', length: 30, comment: '' })
  parent_id: string

  @Column(() => base_entity, { prefix: '' })
  base: base_entity
}
