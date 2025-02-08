import { User } from "@prisma/client";

export function default_app_link_for_role(role: User["role"]): string {
    if (role == "admin") return `/admin/documents`;
    return `/dependiente/documents`;
}

export function new_timer() {
    var _start = Date.now();
    return {
        delta() {
            return Date.now() - _start;
        },
    };
}
