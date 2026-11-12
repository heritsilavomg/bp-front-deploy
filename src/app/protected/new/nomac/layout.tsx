export async function generateMetadata({ params, }: { params: Promise<{ step: string }>; }) {
    const { step } = await params;

    return {
        title: `Step ${step} - Nomac Wizard`,
    };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
