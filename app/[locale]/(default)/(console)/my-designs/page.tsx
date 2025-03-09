import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import NailDesignGallery from "@/components/blocks/NailDesignGallery";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "MyDesigns" });
  
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function MyDesignsPage() {
  const t = await getTranslations("MyDesigns");
  const session = await auth();
  
  // 如果未登录，重定向到登录页
  if (!session) {
    redirect("/auth/signin");
  }
  
  return (
    <main className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
      </div>
      
      <div className="rounded-lg border bg-card p-8">
        <NailDesignGallery userOnly={true} />
      </div>
    </main>
  );
} 