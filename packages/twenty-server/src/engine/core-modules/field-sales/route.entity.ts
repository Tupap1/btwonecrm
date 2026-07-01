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

@Index('IDX_ROUTE_WORKSPACE_ID', ['workspaceId'])
@Entity({ name: 'route', schema: 'core' })
@ObjectType('Route')
export class RouteEntity extends WorkspaceRelatedEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Field(() => Date)
  @Column({ type: 'timestamptz' })
  date: Date;

  @Field(() => String)
  @Column({ type: 'varchar', length: 50, default: 'DRAFT' })
  status: string; // 'DRAFT' | 'ACTIVE' | 'COMPLETED'

  @Field(() => [String])
  @Column({ type: 'jsonb', default: [] })
  orderOfStops: string[]; // JSON array of stop IDs (Lead/Account IDs)

  @Field(() => Number, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  estimatedDistanceKm?: number | null;

  @Field(() => Number, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  estimatedDurationMin?: number | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  assigneeId?: string | null; // ID of the WorkspaceMember assigned to the route

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
