import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProviderToUser1750180728848 implements MigrationInterface {
    name = 'AddProviderToUser1750180728848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "hashedRefreshToken"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "emailVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "emailVerificationToken" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "emailVerificationTokenExpires" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phoneVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE TYPE "public"."users_provider_enum" AS ENUM('google', 'facebook', 'twitter', 'linkedin', 'local')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "provider" "public"."users_provider_enum" NOT NULL DEFAULT 'local'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "provider_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider"`);
        await queryRunner.query(`DROP TYPE "public"."users_provider_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phoneVerified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerificationTokenExpires"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerificationToken"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerified"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "hashedRefreshToken" character varying(500)`);
    }

}
