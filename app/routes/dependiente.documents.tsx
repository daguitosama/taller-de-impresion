import { DataFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "db";
import { get_session, redirect_if_not_authorized } from "~/util/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
    const redirection = await redirect_if_not_authorized(request, ["admin", "dependiente"]); // o ["admin", "dependiente"] si los dos pueden usar esta pagina
    if (redirection) {
        return redirection;
    }

    const session = await get_session(request);
    if (!session) {
        throw new Error("No session found");
    }
    const documents = await db.document.findMany();
    return json({
        documents,
    });
}

export default function AdminIndexRoute() {
    const loaderData = useLoaderData<typeof loader>();

    return (
        <div className='pt-20'>
            <h1 className='text-3xl'>Cree su documento</h1>
            <form
                action='/admin/documents'
                method='POST'
                className='grid gap-4'
            >
                <div>
                    <label htmlFor='document-name'>Nombre del documento</label>
                    <input
                        required
                        type='text'
                        name='document-name'
                        id='document-name'
                        className='block border border-black p-2'
                    />
                </div>
                <div>
                    <label htmlFor='document-content'>Contenido</label>
                    <textarea
                        required
                        name='document-content'
                        id='document-content'
                        className='block border border-black w-full'
                    />
                </div>
                <button className='mt4 w-[300px] bg-black text-white p-2'>Crear documento</button>
            </form>

            <div className='mt-20'>
                <h2 className='text-2xl'> Documentos</h2>
                <ul>
                    {loaderData.documents.map((document) => {
                        return (
                            <li
                                key={document.id}
                                className='border-b border-b-black py-4 grid gap-2'
                            >
                                <p>
                                    <span className='font-bold'>ID:</span> {document.id}
                                </p>
                                <p>
                                    <span className='font-bold'>Nombre:</span> {document.name}
                                </p>
                                <p>
                                    <span className='font-bold'>Contenido:</span> {document.content}
                                </p>
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
    const document_name = formData.get("document-name");
    const document_content = formData.get("document-content");

    await db.document.create({
        data: {
            name: document_name as string,
            content: document_content as string,
        },
    });

    return json({});
}
