import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHashedRefreshTokenToUser1750159154025 implements MigrationInterface {
    name = 'AddHashedRefreshTokenToUser1750159154025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "hashedRefreshToken"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "hashedRefreshToken" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "hashedRefreshToken"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "hashedRefreshToken" character varying`);
    }

}
