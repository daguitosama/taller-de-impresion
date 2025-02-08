import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "db";

export async function loader({ request }: LoaderFunctionArgs) {
    const users = await db.user.findMany();
    return json({
        users,
    });
}

export default function HomePageRoute() {
    const { users } = useLoaderData<typeof loader>();
    return (
        <div className='w-full max-w-screen-lg px-20 pt-20'>
            <h1 className='text-3xl'>Home Page</h1>
            <div className='mt-20 grid gap-4'>
                <a href='/login'> Login</a>
                <a href='/admin/documents'> Admin Documents view</a>
                <a href='/dependiente/documents'> Dependiente Documents view</a>
            </div>
        </div>
    );
}
