import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHashedRefreshTokenToUser1750157316530 implements MigrationInterface {
    name = 'AddHashedRefreshTokenToUser1750157316530'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "hashedRefreshToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "hashedRefreshToken"`);
    }

}
