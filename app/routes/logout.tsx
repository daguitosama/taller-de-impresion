import type { DataFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { session_storage } from "~/util/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
    return json({});
}

export async function action({ request, context }: DataFunctionArgs) {
    const session = await session_storage.getSession(request.headers.get("Cookie"));
    return redirect("/login/", {
        headers: {
            "Set-Cookie": await session_storage.destroySession(session),
        },
    });
}

export function LogoutBtn() {
    return (
        <Form
            action='/logout'
            method='post'
        >
            <button className='rounded-lg py-[10px] px-[8px] flex items-center gap-[8px]'>
                <span className='text-sm leading-none'>Logout</span>
            </button>
        </Form>
    );
}
