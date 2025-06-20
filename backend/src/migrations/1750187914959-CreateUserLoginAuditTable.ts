import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserLoginAuditTable1750187914959 implements MigrationInterface {
    name = 'CreateUserLoginAuditTable1750187914959'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_login_audit" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider" character varying NOT NULL, "refresh_token" text, "ip_address" character varying, "user_agent" character varying, "status" character varying NOT NULL DEFAULT 'active', "login_time" TIMESTAMP NOT NULL DEFAULT now(), "logout_time" TIMESTAMP WITH TIME ZONE, "user_id" uuid, CONSTRAINT "PK_00195d71f5fa1d82db0341dc6dd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_login_audit" ADD CONSTRAINT "FK_cd8033fef824676d1308952d95a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_login_audit" DROP CONSTRAINT "FK_cd8033fef824676d1308952d95a"`);
        await queryRunner.query(`DROP TABLE "user_login_audit"`);
    }

}
