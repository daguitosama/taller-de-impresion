import { db } from "db";
import bcrypt from "bcryptjs";
async function seed_database() {
    const all_ready_admin_user = await db.user.findFirst({
        where: {
            name: "admin",
        },
    });

    const all_ready_dependiente_user = await db.user.findFirst({
        where: {
            name: "dependiente",
        },
    });
    await db.user.update({
        where: {
            name: "admin",
        },
        data: {
            password_hash: await hash_password("cafesito"),
        },
    });
    if (!all_ready_admin_user) {
        await db.user.create({
            data: {
                name: "admin",
                role: "admin",
                password_hash: await hash_password("cafesito"),
            },
        });
    }

    if (!all_ready_dependiente_user) {
        await db.user.create({
            data: {
                name: "dependiente",
                role: "dependiente",
                password_hash: await hash_password("cafesito"),
            },
        });
    }
}

seed_database();
async function hash_password(password: string) {
    return await bcrypt.hash(password, 10);
}
