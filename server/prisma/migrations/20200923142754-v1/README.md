# Migration `20200923142754-v1`

This migration has been generated at 9/23/2020, 7:57:54 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."Post" (
"id" SERIAL,
"title" text   NOT NULL ,
"createdAt" timestamp(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
"content" text   ,
"published" boolean   NOT NULL DEFAULT false,
"authorId" integer   NOT NULL ,
PRIMARY KEY ("id")
)

CREATE TABLE "public"."Profile" (
"id" SERIAL,
"bio" text   ,
"name" text   ,
"userId" integer   NOT NULL ,
PRIMARY KEY ("id")
)

CREATE TABLE "public"."Vote" (
"id" SERIAL,
"userId" integer   NOT NULL ,
"postId" integer   NOT NULL ,
PRIMARY KEY ("id")
)

CREATE TABLE "public"."User" (
"id" SERIAL,
"email" text   NOT NULL ,
"password" text   NOT NULL ,
PRIMARY KEY ("id")
)

CREATE UNIQUE INDEX "Profile.userId_unique" ON "public"."Profile"("userId")

CREATE UNIQUE INDEX "Vote.userId_unique" ON "public"."Vote"("userId")

CREATE UNIQUE INDEX "Vote.postId_unique" ON "public"."Vote"("postId")

CREATE UNIQUE INDEX "User.email_unique" ON "public"."User"("email")

ALTER TABLE "public"."Post" ADD FOREIGN KEY ("authorId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."Profile" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."Vote" ADD FOREIGN KEY ("userId")REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE

ALTER TABLE "public"."Vote" ADD FOREIGN KEY ("postId")REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200923120814-v1..20200923142754-v1
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 generator typegraphql {
   provider = "typegraphql-prisma"
@@ -19,8 +19,9 @@
   content   String?
   published Boolean  @default(false)
   authorId  Int
   User      User     @relation(fields: [authorId], references: [id])
+  Vote      Vote[]
 }
 model Profile {
   id     Int     @default(autoincrement()) @id
@@ -29,11 +30,20 @@
   userId Int     @unique
   User   User    @relation(fields: [userId], references: [id])
 }
+model Vote {
+  id     Int  @default(autoincrement()) @id
+  userId Int  @unique
+  User   User @relation(fields: [userId], references: [id])
+  postId Int  @unique
+  Post   Post @relation(fields: [postId], references: [id])
+}
+
 model User {
   id       Int      @default(autoincrement()) @id
   email    String   @unique
   password String
   posts    Post[]
   profile  Profile?
+  Vote     Vote[]
 }
```


