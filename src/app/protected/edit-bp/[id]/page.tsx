import { auth } from "@/auth";
import EditBpPageClient from "./EditBpPageClient";

export default async function EditBpPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await auth();

    return <EditBpPageClient bpId={id} />;
}
