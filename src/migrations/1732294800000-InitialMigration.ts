import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1732294800000 implements MigrationInterface {
    name = 'InitialMigration1732294800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "user_type_enum" AS ENUM('candidate', 'company', 'admin')
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password_hash" character varying NOT NULL,
                "user_type" "user_type_enum" NOT NULL,
                "full_name" character varying,
                "profile_description" text,
                "company_name" character varying,
                "phone_number" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_users_email" ON "users" ("email")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_users_user_type" ON "users" ("user_type")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_users_user_type"`);
        await queryRunner.query(`DROP INDEX "IDX_users_email"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "user_type_enum"`);
    }
}
