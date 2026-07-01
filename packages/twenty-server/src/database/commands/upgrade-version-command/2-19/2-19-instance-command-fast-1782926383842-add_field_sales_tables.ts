import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.19.0', 1782926383842)
export class AddFieldSalesTablesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."checkIn" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "routeId" uuid NOT NULL, "targetId" uuid NOT NULL, "checkInAt" TIMESTAMP WITH TIME ZONE NOT NULL, "checkOutAt" TIMESTAMP WITH TIME ZONE, "checkInLat" double precision NOT NULL, "checkInLng" double precision NOT NULL, "checkOutLat" double precision, "checkOutLng" double precision, "isRemote" boolean NOT NULL DEFAULT false, "distanceFromTargetMeters" double precision, "durationMinutes" double precision, "notes" text, "mediaUrls" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_326a7c6be3acbcff3d3231b90d2" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_CHECK_IN_ROUTE_ID" ON "core"."checkIn" ("routeId") ');
    await queryRunner.query('CREATE INDEX "IDX_CHECK_IN_WORKSPACE_ID" ON "core"."checkIn" ("workspaceId") ');
    await queryRunner.query('CREATE TABLE "core"."route" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "status" character varying(50) NOT NULL DEFAULT \'DRAFT\', "orderOfStops" jsonb NOT NULL DEFAULT \'[]\', "estimatedDistanceKm" double precision, "estimatedDurationMin" double precision, "assigneeId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_08affcd076e46415e5821acf52d" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_ROUTE_WORKSPACE_ID" ON "core"."route" ("workspaceId") ');
    await queryRunner.query('CREATE TABLE "core"."stopCoordinates" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "targetId" uuid NOT NULL, "targetType" character varying(50) NOT NULL, "latitude" double precision NOT NULL, "longitude" double precision NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_STOP_COORDINATES_TARGET_UNIQUE" UNIQUE ("workspaceId", "targetId"), CONSTRAINT "PK_656579c9bc3ab185f39837fa485" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_STOP_COORDINATES_WORKSPACE_ID" ON "core"."stopCoordinates" ("workspaceId") ');
    await queryRunner.query('ALTER TABLE "core"."checkIn" ADD CONSTRAINT "FK_f58ac1fd4a7e539ef053a25f80a" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."route" ADD CONSTRAINT "FK_2c087edb3997ab846015d1c7e2a" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."stopCoordinates" ADD CONSTRAINT "FK_ef415f709951d0a5fb21cb62d14" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."stopCoordinates" DROP CONSTRAINT "FK_ef415f709951d0a5fb21cb62d14"');
    await queryRunner.query('ALTER TABLE "core"."route" DROP CONSTRAINT "FK_2c087edb3997ab846015d1c7e2a"');
    await queryRunner.query('ALTER TABLE "core"."checkIn" DROP CONSTRAINT "FK_f58ac1fd4a7e539ef053a25f80a"');
    await queryRunner.query('DROP INDEX "core"."IDX_STOP_COORDINATES_WORKSPACE_ID"');
    await queryRunner.query('DROP TABLE "core"."stopCoordinates"');
    await queryRunner.query('DROP INDEX "core"."IDX_ROUTE_WORKSPACE_ID"');
    await queryRunner.query('DROP TABLE "core"."route"');
    await queryRunner.query('DROP INDEX "core"."IDX_CHECK_IN_WORKSPACE_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_CHECK_IN_ROUTE_ID"');
    await queryRunner.query('DROP TABLE "core"."checkIn"');
  }
}
