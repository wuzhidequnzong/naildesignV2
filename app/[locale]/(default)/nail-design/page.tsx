import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import NailDesignGenerator from "@/components/blocks/NailDesignGenerator";
// 暂时注释掉可能导致问题的组件
// import NailDesignGallery from "@/components/blocks/NailDesignGallery";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "NailDesign" });
  
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default function NailDesignPage() {
  // 由于功能已迁移到首页，重定向到首页
  redirect("/");
} 