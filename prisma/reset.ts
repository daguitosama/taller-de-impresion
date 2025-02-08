import { db } from "db";
async function reset_database() {
    await db.user.deleteMany({});
    await db.document.deleteMany({});
}
reset_database();
