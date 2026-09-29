import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVenuesAndSeats1790669361939 implements MigrationInterface {
  name = 'CreateVenuesAndSeats1790669361939';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "venues" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "name" character varying(200) NOT NULL,
                "city" character varying(100) NOT NULL,
                "address" text NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_cb0f885278d12384eb7a81818be" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "seats" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "venue_id" uuid NOT NULL,
                "section" character varying(20) NOT NULL,
                "row" character varying(10) NOT NULL,
                "number" integer NOT NULL,
                CONSTRAINT "UQ_36e51542eaf1fc3aa8006e86acc" UNIQUE ("venue_id", "section", "row", "number"),
                CONSTRAINT "PK_3fbc74bb4638600c506dcb777a7" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "seats"
            ADD CONSTRAINT "FK_9f5fa7393797bd57f11231b730d" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "seats" DROP CONSTRAINT "FK_9f5fa7393797bd57f11231b730d"
        `);
    await queryRunner.query(`
            DROP TABLE "seats"
        `);
    await queryRunner.query(`
            DROP TABLE "venues"
        `);
  }
}
