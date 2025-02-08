import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { get_session, redirect_if_not_authorized } from "~/util/auth.server";
import { json } from "@remix-run/node";
import { db } from "db";
import { AppLink } from "~/types/app";
import { LogoutBtn } from "./logout";
import clsx from "clsx";

export async function loader({ request, context }: LoaderFunctionArgs) {
    const redirection = await redirect_if_not_authorized(request, "admin");
    if (redirection) {
        return redirection;
    }

    const session = await get_session(request);
    if (!session) {
        throw new Error("No session found");
    }
    //
    const user = await db.user.findFirst({
        where: {
            id: session.userId,
        },
    });

    if (!user) {
        throw new Error("No user found");
    }

    return json({
        user: { ...user, password_hash: null },
    });
}
export default function AdminLayout() {
    const ADMIN_APP_LINKS: AppLink[] = [
        {
            id: "0",
            route: "/admin/documents",
            label: "Documentos",
        },
        {
            id: "1",
            route: "/admin/users",
            label: "Users",
        },
    ];
    return (
        <div className='min-h-screen flex'>
            {/* nav sidebar */}
            <div className='w-[440px] border-r border-r-slate-200 '>
                <AdminAppSideBar links={ADMIN_APP_LINKS} />
            </div>

            {/* main app panel */}
            <div className='  w-full'>
                <div className='max-w-screen-lg 2xl:max-w-screen-2xl mx-auto px-[24px]'>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

function AdminAppSideBar({ links }: { links: AppLink[] }) {
    const loaderData = useLoaderData<typeof loader>();
    if (!loaderData.user.name) {
        throw new Error("No user name found");
    }
    const firstLetter = loaderData.user.name.slice(0, 1);
    return (
        <div className='h-full px-[24px] relative'>
            {/* logo */}
            <div className='py-[20px] px-[10px]'>
                <p className='font-medium text-sm  leading-none'>Taller, admin area</p>
            </div>
            {/* menu links */}
            <div className='mt-[16px]'>
                <ul>
                    {links.map((app_link) => {
                        return (
                            <SidebarNavLink
                                app_link={app_link}
                                key={app_link.id}
                            />
                        );
                    })}
                </ul>
            </div>
            {/* user options */}
            <div className='flex gap2'>
                <LogoutBtn />
            </div>
        </div>
    );
}

function SidebarNavLink({ app_link, ...props }: { app_link: AppLink }) {
    const base_classes = "rounded-lg py-[10px] px-[8px] flex items-center gap-[8px]";
    const pending_classes = "bg-neutral-50 animate-pulse";
    const active_classes = "bg-neutral-100 opacity-100";
    function dynamic_classes({ isActive, isPending }: { isActive: boolean; isPending: boolean }) {
        //   const classes = clsx(base_classes);
        if (isActive) {
            return clsx(base_classes, active_classes);
        }
        if (isPending) {
            return clsx(base_classes, pending_classes);
        } else {
        }
        return base_classes;
    }

    return (
        <li className=' '>
            <NavLink
                to={app_link.route}
                className={dynamic_classes}
            >
                <span className='text-sm leading-none'>{app_link.label}</span>
            </NavLink>
        </li>
    );
}
