import { Field, ObjectType } from '@nestjs/graphql';
import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Index('IDX_STOP_COORDINATES_WORKSPACE_ID', ['workspaceId'])
@Unique('IDX_STOP_COORDINATES_TARGET_UNIQUE', ['workspaceId', 'targetId'])
@Entity({ name: 'stopCoordinates', schema: 'core' })
@ObjectType('StopCoordinates')
export class StopCoordinatesEntity extends WorkspaceRelatedEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => UUIDScalarType)
  @Column({ type: 'uuid' })
  targetId: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 50 })
  targetType: string; // 'LEAD' | 'ACCOUNT'

  @Field(() => Number)
  @Column({ type: 'double precision' })
  latitude: number;

  @Field(() => Number)
  @Column({ type: 'double precision' })
  longitude: number;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
