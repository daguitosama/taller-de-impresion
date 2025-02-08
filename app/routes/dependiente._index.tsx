import { LoaderFunctionArgs, json } from "@remix-run/node";
import { get_session, redirect_if_not_authorized } from "~/util/auth.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
    const redirection = await redirect_if_not_authorized(request, "admin");
    if (redirection) {
        return redirection;
    }

    const session = await get_session(request);
    if (!session) {
        throw new Error("No session found");
    }

    return json({});
}

export default function AdminIndexRoute() {
    return <h1>Dependiente home page</h1>;
}
