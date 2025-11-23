import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCVTable1732295000000 implements MigrationInterface {
    name = 'CreateCVTable1732295000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "cvs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "file_name" character varying NOT NULL,
                "file_path" character varying NOT NULL,
                "file_size" integer NOT NULL,
                "mime_type" character varying NOT NULL,
                "extracted_text" text,
                "is_active" boolean NOT NULL DEFAULT false,
                "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_cvs_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_cvs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cvs_user_id" ON "cvs" ("user_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cvs_is_active" ON "cvs" ("is_active")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cvs_user_id_is_active" ON "cvs" ("user_id", "is_active")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_cvs_user_id_is_active"`);
        await queryRunner.query(`DROP INDEX "IDX_cvs_is_active"`);
        await queryRunner.query(`DROP INDEX "IDX_cvs_user_id"`);
        await queryRunner.query(`DROP TABLE "cvs"`);
    }
}
