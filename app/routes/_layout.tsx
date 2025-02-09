import { NavLink, Outlet } from "@remix-run/react";
import clsx from "clsx";
import { AppLink } from "~/types/app";

export default function AdminLayout() {
    const ADMIN_APP_LINKS: AppLink[] = [
        {
            id: "0",
            route: "/documents",
            label: "Documentos",
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
