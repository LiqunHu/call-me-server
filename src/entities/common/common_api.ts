import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'
import { base_entity } from '@/entities/base_entity'

@Entity({ name: 'tbl_common_api' })
export class common_api extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: 'primary' })
  api_id: number

  @Column({ default: '', length: 10, comment: 'api type' })
  api_type: string

  @Column({ type: 'varchar', default: '', length: 300, comment: 'api name' })
  api_name: string

  @Column({type: 'varchar',  default: '', length: 300, comment: 'api path' })
  api_path: string

  @Column({ type: 'varchar', default: '', length: 100, comment: 'api function' })
  api_function: string

  @Column({ type: 'varchar', default: '1', length: 2, comment: 'auth flag 1-y 0-n' })
  auth_flag: string

  @Column({ type: 'varchar', default: '', length: 30, comment: 'api remark' })
  api_remark: string

  @Column(() => base_entity, { prefix: '' })
  base: base_entity
}
