import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm'
import { base_entity } from '@/entities/base_entity'

@Entity({ name: 'tbl_common_organization' })
export class common_organization extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: 'primary' })
  organization_id: number

  @Column({ unique: true, length: 100, comment: '' })
  organization_code: string

  @Column({ default: '', length: 3, comment: '' })
  organization_type: string

  @Column({ nullable: true, comment: '' })
  organizationtemplate_id: number

  @Column({ default: '', length: 50, comment: '' })
  organization_name: string

  @Column({ default: '', length: 20, comment: '' })
  organization_province: string

  @Column({ default: '', length: 20, comment: '' })
  organization_city: string

  @Column({ default: '', length: 20, comment: '' })
  organization_district: string

  @Column({ default: '', length: 500, comment: '' })
  organization_address: string

  @Column({ default: '', length: 100, comment: '' })
  organization_deputy: string

  @Column({ default: '', length: 20, comment: '' })
  organization_call: string

  @Column({ default: '', length: 100, comment: '' })
  organization_contact: string

  @Column({ default: '', length: 20, comment: '' })
  organization_fax: string

  @Column({ default: '', length: 200, comment: '' })
  organization_email: string

  @Column({ default: '', length: 200, comment: '' })
  organization_description: string

  @Column({ type: 'json', nullable: true, comment: '' })
  organization_config: object

  @Column({ default: 0, comment: '' })
  organization_index: number

  @Column(() => base_entity, { prefix: '' })
  base: base_entity
}
