import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInterviewTable1732298000000 implements MigrationInterface {
    name = 'CreateInterviewTable1732298000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create interviews table
        await queryRunner.query(`
            CREATE TABLE "interviews" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "application_id" uuid NOT NULL,
                "interview_date" date NOT NULL,
                "interview_time" time NOT NULL,
                "location" character varying(500),
                "notes" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_interviews_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_interviews_application" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE,
                CONSTRAINT "UQ_interviews_application_id" UNIQUE ("application_id")
            )
        `);

        // Create index on application_id for efficient queries
        await queryRunner.query(`
            CREATE INDEX "IDX_interviews_application_id" ON "interviews" ("application_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_interviews_application_id"`);
        await queryRunner.query(`DROP TABLE "interviews"`);
    }
}
