import type { DataFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "db";
import { bcrypt } from "~/util/libs.server";

export async function loader({ request }: LoaderFunctionArgs) {
    const users = await db.user.findMany();
    return json({
        users,
    });
}

export default function HomePageRoute() {
    const { users } = useLoaderData<typeof loader>();
    return (
        <div className='pt-20'>
            <h1 className='text-3xl'>Create User</h1>
            <form
                action='/admin/users'
                method='post'
                className='grid gap-4'
            >
                <div>
                    <label htmlFor='user-name'>Name</label>
                    <input
                        type='text'
                        id='user-name'
                        name='user-name'
                        className='block border border-black'
                    />
                </div>

                <div>
                    <label htmlFor='user-password'>Password</label>
                    <input
                        type='password'
                        id='user-password'
                        name='user-password'
                        className='block border border-black'
                    />
                </div>

                <fieldset className='flex gap-4 border-black  border p-2 max-w-[300px]'>
                    <div>
                        <label htmlFor='admin-role'>Admin</label>
                        <input
                            type='radio'
                            defaultChecked={true}
                            name='user-role'
                            id='admin-role'
                            value={"admin"}
                        />
                    </div>
                    <div>
                        <label htmlFor='dependiente-role'>Dependiente</label>
                        <input
                            type='radio'
                            name='user-role'
                            id='dependiente-role'
                            value={"dependiente"}
                        />
                    </div>
                </fieldset>
                <button className='mt2 bg-black text-white w-[200px] p-2'>Create</button>
            </form>
            <div className='mt-20 grid gap-4'>
                <h2 className='mt4 text-2xl'>Users</h2>
                <ul className='block'>
                    {users.map((user) => {
                        return (
                            <li
                                key={user.id}
                                className='block'
                                style={{
                                    marginTop: "1.5rem",
                                    marginBottom: "1.5rem",
                                    borderRadius: "12px",
                                    border: "1px solid black",
                                    paddingLeft: "10px",
                                    paddingRight: "10px",
                                }}
                            >
                                <p>Name: {user.name}</p>
                                <p>Role: {user.role}</p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

export async function action({ request }: DataFunctionArgs) {
    const formData = await request.formData();
    const name = formData.get("user-name");
    const password = formData.get("user-password");
    const role = formData.get("user-role");

    const user_created = await db.user.create({
        data: {
            name: name as string,
            password_hash: await bcrypt.hash(password as string, 10),
            role: role as string,
        },
    });

    console.log({ user_created });
    return json({ ok: true });
}
