# Migration `20200923160742-remove-unique-from-user-id-and-post-id-in-vote`

This migration has been generated at 9/23/2020, 9:37:42 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
DROP INDEX "public"."Vote.postId_unique"

DROP INDEX "public"."Vote.userId_unique"
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200923144456..20200923160742-remove-unique-from-user-id-and-post-id-in-vote
--- datamodel.dml
+++ datamodel.dml
@@ -1,11 +1,12 @@
 generator client {
-  provider = "prisma-client-js"
+  provider        = "prisma-client-js"
+  previewFeatures = ["transactionApi"]
 }
 datasource db {
   provider = "postgresql"
-  url = "***"
+  url = "***"
 }
 generator typegraphql {
   provider = "typegraphql-prisma"
@@ -34,11 +35,11 @@
 model Vote {
   id     Int  @default(autoincrement()) @id
   value  Int
-  userId Int  @unique
+  userId Int
   User   User @relation(fields: [userId], references: [id])
-  postId Int  @unique
+  postId Int
   Post   Post @relation(fields: [postId], references: [id])
 }
 model User {
```


