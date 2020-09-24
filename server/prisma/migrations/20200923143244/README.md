# Migration `20200923143244`

This migration has been generated at 9/23/2020, 8:02:44 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."Post" ADD COLUMN "points" integer   NOT NULL 
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200923142754-v1..20200923143244
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
@@ -17,8 +17,9 @@
   title     String
   createdAt DateTime @default(now())
   content   String?
   published Boolean  @default(false)
+  points    Int
   authorId  Int
   User      User     @relation(fields: [authorId], references: [id])
   Vote      Vote[]
 }
```


