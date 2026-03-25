import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'
import { base_entity } from '@/entities/base_entity'

@Entity({ name: 'tbl_common_systemmenu' })
export class common_systemmenu extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: '' })
  systemmenu_id: number

  @Column({ length: 300, comment: '' })
  systemmenu_name: string

  @Column({ default: '', length: 100, comment: '' })
  systemmenu_icon: string

  @Column({ default: 0, comment: '' })
  systemmenu_index: number

  @Column({ nullable: true, comment: '' })
  api_id: number

  @Column({ nullable: true, length: 2, comment: '' })
  node_type: string

  @Column({ default: '', length: 30, comment: '' })
  parent_id: string

  @Column(() => base_entity, { prefix: '' })
  base: base_entity
}
