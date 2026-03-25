import { Column, CreateDateColumn, UpdateDateColumn, BeforeUpdate } from 'typeorm'

export class base_entity {
  @Column({ type: 'varchar', length: 5, default: '1', comment: 'Soft delete flag 1--enable 0--disable' })
  state: string

  @Column({ type: 'int', default: 0, comment: 'version update once+1' })
  version: number

  @UpdateDateColumn()
  updated_at: Date

  @CreateDateColumn()
  created_at: Date

  @BeforeUpdate()
  updateVersion() {
    this.version += 1
  }
}
