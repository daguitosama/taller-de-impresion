// app/sessions.ts
import { User } from "@prisma/client";
import { createCookieSessionStorage, redirect } from "@remix-run/node"; // or cloudflare/deno
// @ts-ignore
import bcrypt from "bcryptjs";
import { db } from "db";

// type User = {
//     id: string;
//     name: string;
//     role: "admin" | "dependiente";
//     hashed_password: string;
// };

type SessionData = {
    userId: number;
    role: User["role"];
};

type SessionFlashData = {
    error: string;
};

export const session_storage = createCookieSessionStorage<SessionData, SessionFlashData>({
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: {
        name: "__session",

        // all of these are optional
        // domain: "remix.run",
        // Expires can also be set (although maxAge overrides it when used in combination).
        // Note that this method is NOT recommended as `new Date` creates only one date on each server deployment, not a dynamic date in the future!
        //
        // expires: new Date(Date.now() + 60_000),
        httpOnly: true,
        // maxAge: 60 * 60,
        path: "/",
        sameSite: "lax",
        secrets: ["super-secret"],
        secure: true,
    },
});

export async function get_session(request: Request): Promise<SessionData | null> {
    const cookieHeader = request.headers.get("cookie");
    const session = session_storage.getSession(cookieHeader);
    const userId = (await session).get("userId");
    var role = (await session).get("role") ?? "";
    // no valid session
    // validate role (TS inference is useless at runtime)
    if (!userId || !role || !["admin", "server"].includes(role)) {
        return null;
    }
    // valid session
    return {
        userId,
        role,
    } as SessionData; // fix TS role type dropping, was validated at runtime above
}

type AuthenticateOperationResult = {
    ok: SessionData | null;
    err: string | null;
};

export async function authenticate({
    username,
    password,
}: {
    username: string;
    password: string;
}): Promise<AuthenticateOperationResult> {
    const user = await db.user.findUnique({
        where: {
            name: username,
        },
    });

    // user not found
    if (!user) {
        // do not expose user-not-found
        // just signal username-pass miss match
        return { ok: null, err: "Username and password don't match" };
    }

    const password_is_valid = await bcrypt.compare(password, user.password_hash);

    if (!password_is_valid) {
        return { ok: null, err: "Username and password don't match" };
    }

    return Promise.resolve({
        ok: {
            role: user.role as User["role"],
            userId: user.id,
        },
        err: null,
    });
}

type GetUserResultByUserName = {
    ok: User | null;
    err: string | null;
};

function is_user_role(role: string): role is User["role"] {
    return role == "admin" || role == "dependiente";
}

function role_is_in_roles(role: string, roles: User["role"][]): boolean {
    if (!is_user_role(role)) {
        return false;
    }

    if (!roles.includes(role)) {
        return false;
    }

    return true;
}

type Redirect_If_Not_Authorized_Result = ReturnType<typeof redirect> | false;
// todo: make this fn return also the session
// with discriminator types 👇
// https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
export async function redirect_if_not_authorized(
    request: Request,
    role_or_roles: User["role"] | Array<User["role"]>
): Promise<Redirect_If_Not_Authorized_Result> {
    //
    const session = await get_session(request);
    //
    if (!session) {
        return redirect(`/login/`);
    }
    var is_authorized: boolean = false;

    if (Array.isArray(role_or_roles)) {
        is_authorized = role_is_in_roles(session.role, role_or_roles);
    } else {
        is_authorized = role_is_in_roles(session.role, [role_or_roles]);
    }

    if (!is_authorized) {
        return redirect(`/login/`);
    }
    // allow pass
    return false;
}
