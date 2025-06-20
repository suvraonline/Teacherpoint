import { MigrationInterface, QueryRunner } from "typeorm";

export class MakePasswordNullable1750410474266 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
  ALTER TABLE "users"
  ALTER COLUMN "password" DROP NOT NULL
`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
  ALTER TABLE "users"
  ALTER COLUMN "password" SET NOT NULL
`);
    }

}
