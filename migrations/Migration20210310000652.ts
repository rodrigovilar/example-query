import { Migration } from '@mikro-orm/migrations';

export class Migration20210310000652 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "account" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "email" varchar(255) not null, "client_id" varchar(255) not null, "hash" varchar(500) not null, "salt" varchar(5000) not null);');
    this.addSql('alter table "account" add constraint "account_email_unique" unique ("email");');
    this.addSql('alter table "account" add constraint "account_client_id_unique" unique ("client_id");');

    this.addSql('create table "segment" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" varchar(255) not null, "query" jsonb not null, "owner_id" int4 not null);');

    this.addSql('create table "subscriber" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "owner_id" int4 not null);');

    this.addSql('create table "message" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "body" varchar(255) not null, "date_clicked" timestamptz(0) null, "recipient_id" int4 not null);');

    this.addSql('alter table "segment" add constraint "segment_owner_id_foreign" foreign key ("owner_id") references "account" ("id") on update cascade;');

    this.addSql('alter table "subscriber" add constraint "subscriber_owner_id_foreign" foreign key ("owner_id") references "account" ("id") on update cascade;');

    this.addSql('alter table "message" add constraint "message_recipient_id_foreign" foreign key ("recipient_id") references "subscriber" ("id") on update cascade;');
  }

}
