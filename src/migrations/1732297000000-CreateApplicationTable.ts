import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateApplicationTable1732297000000 implements MigrationInterface {
    name = 'CreateApplicationTable1732297000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create application_status enum
        await queryRunner.query(`
            CREATE TYPE "application_status_enum" AS ENUM('pending', 'reviewed', 'accepted', 'rejected', 'withdrawn')
        `);

        // Create applications table
        await queryRunner.query(`
            CREATE TABLE "applications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "job_id" uuid NOT NULL,
                "candidate_id" uuid NOT NULL,
                "cv_id" uuid NOT NULL,
                "cover_letter" text,
                "status" "application_status_enum" NOT NULL DEFAULT 'pending',
                "applied_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_applications_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_applications_job" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_applications_candidate" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_applications_cv" FOREIGN KEY ("cv_id") REFERENCES "cvs"("id") ON DELETE CASCADE,
                CONSTRAINT "UQ_applications_job_candidate" UNIQUE ("job_id", "candidate_id")
            )
        `);

        // Create indexes for efficient queries
        await queryRunner.query(`
            CREATE INDEX "IDX_applications_job_id" ON "applications" ("job_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_applications_candidate_id" ON "applications" ("candidate_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_applications_cv_id" ON "applications" ("cv_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_applications_status" ON "applications" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_applications_candidate_id_status" ON "applications" ("candidate_id", "status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_applications_job_id_status" ON "applications" ("job_id", "status")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_applications_job_id_status"`);
        await queryRunner.query(`DROP INDEX "IDX_applications_candidate_id_status"`);
        await queryRunner.query(`DROP INDEX "IDX_applications_status"`);
        await queryRunner.query(`DROP INDEX "IDX_applications_cv_id"`);
        await queryRunner.query(`DROP INDEX "IDX_applications_candidate_id"`);
        await queryRunner.query(`DROP INDEX "IDX_applications_job_id"`);
        await queryRunner.query(`DROP TABLE "applications"`);
        await queryRunner.query(`DROP TYPE "application_status_enum"`);
    }
}
