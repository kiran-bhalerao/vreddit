# Migration `20200923144456`

This migration has been generated at 9/23/2020, 8:14:56 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Vote" ADD COLUMN "value" integer   NOT NULL 
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200923143356..20200923144456
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
@@ -33,8 +33,9 @@
 }
 model Vote {
   id     Int  @default(autoincrement()) @id
+  value  Int
   userId Int  @unique
   User   User @relation(fields: [userId], references: [id])
   postId Int  @unique
   Post   Post @relation(fields: [postId], references: [id])
```


