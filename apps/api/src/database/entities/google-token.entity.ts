import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('google_tokens')
export class GoogleToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accessToken: string;

  @Column()
  refreshToken: string;

  @Column({ type: 'text', nullable: true })
  scope: string;

  @Column({ type: 'datetime', nullable: true })
  expiryDate: Date;

  @Column({ nullable: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
