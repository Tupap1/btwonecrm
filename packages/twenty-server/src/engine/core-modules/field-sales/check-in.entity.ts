import { Field, ObjectType } from '@nestjs/graphql';
import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Index('IDX_CHECK_IN_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_CHECK_IN_ROUTE_ID', ['routeId'])
@Entity({ name: 'checkIn', schema: 'core' })
@ObjectType('CheckIn')
export class CheckInEntity extends WorkspaceRelatedEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => UUIDScalarType)
  @Column({ type: 'uuid' })
  routeId: string;

  @Field(() => UUIDScalarType)
  @Column({ type: 'uuid' })
  targetId: string; // Lead or Account ID

  @Field(() => Date)
  @Column({ type: 'timestamptz' })
  checkInAt: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  checkOutAt?: Date | null;

  @Field(() => Number)
  @Column({ type: 'double precision' })
  checkInLat: number;

  @Field(() => Number)
  @Column({ type: 'double precision' })
  checkInLng: number;

  @Field(() => Number, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  checkOutLat?: number | null;

  @Field(() => Number, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  checkOutLng?: number | null;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false })
  isRemote: boolean;

  @Field(() => Number, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  distanceFromTargetMeters?: number | null;

  @Field(() => Number, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  durationMinutes?: number | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Field(() => [String], { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  mediaUrls?: string[] | null; // Array of attachments / voice note urls

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
