import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateJobTable1732296000000 implements MigrationInterface {
    name = 'CreateJobTable1732296000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create job_type enum
        await queryRunner.query(`
            CREATE TYPE "job_type_enum" AS ENUM('full_time', 'part_time', 'contract', 'internship')
        `);

        // Create job_status enum
        await queryRunner.query(`
            CREATE TYPE "job_status_enum" AS ENUM('open', 'closed')
        `);

        // Create jobs table
        await queryRunner.query(`
            CREATE TABLE "jobs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "company_id" uuid NOT NULL,
                "title" character varying(200) NOT NULL,
                "description" text NOT NULL,
                "location" character varying(200) NOT NULL,
                "job_type" "job_type_enum" NOT NULL,
                "salary_min" integer,
                "salary_max" integer,
                "status" "job_status_enum" NOT NULL DEFAULT 'open',
                "closed_at" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_jobs_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_jobs_company" FOREIGN KEY ("company_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        // Create indexes
        await queryRunner.query(`
            CREATE INDEX "IDX_jobs_company_id" ON "jobs" ("company_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_jobs_status" ON "jobs" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_jobs_created_at" ON "jobs" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_jobs_company_id_status" ON "jobs" ("company_id", "status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_jobs_status_created_at" ON "jobs" ("status", "created_at")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_jobs_status_created_at"`);
        await queryRunner.query(`DROP INDEX "IDX_jobs_company_id_status"`);
        await queryRunner.query(`DROP INDEX "IDX_jobs_created_at"`);
        await queryRunner.query(`DROP INDEX "IDX_jobs_status"`);
        await queryRunner.query(`DROP INDEX "IDX_jobs_company_id"`);
        await queryRunner.query(`DROP TABLE "jobs"`);
        await queryRunner.query(`DROP TYPE "job_status_enum"`);
        await queryRunner.query(`DROP TYPE "job_type_enum"`);
    }
}
