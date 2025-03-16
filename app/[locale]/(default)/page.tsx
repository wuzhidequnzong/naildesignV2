import Branding from "@/components/blocks/branding";
import CTA from "@/components/blocks/cta";
import FAQ from "@/components/blocks/faq";
import Feature from "@/components/blocks/feature";
import Feature1 from "@/components/blocks/feature1";
import Feature2 from "@/components/blocks/feature2";
import Feature3 from "@/components/blocks/feature3";
import Hero from "@/components/blocks/hero";
import NailDesignIntro from "@/components/blocks/NailDesignIntro";
import NailDesignGenerator from "@/components/blocks/NailDesignGenerator";
import NailDesignGallery from "@/components/blocks/NailDesignGallery";
import Pricing from "@/components/blocks/pricing";
import Showcase from "@/components/blocks/showcase";
import Stats from "@/components/blocks/stats";
import Testimonial from "@/components/blocks/testimonial";
import { getLandingPage } from "@/services/page";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}`;

  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}`;
  }

  return {
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const page = await getLandingPage(locale);
  const t = await getTranslations("NailDesign");

  return (
    <>
      {page.hero && <Hero hero={page.hero} />}
      
      {/* 美甲设计区域 */}
      <div className="py-6 md:py-3 bg-gradient-to-b from-background to-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* 美甲设计生成器 - 已移除标题和描述 */}
            <div className="bg-card rounded-lg border shadow-sm p-4 md:p-6">
              <div className="max-w-3xl mx-auto">
                <NailDesignGenerator />
              </div>
            </div>
            
            {/* 美甲设计展示 */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">{t("gallery.title")}</h3>
                <span className="text-sm text-muted-foreground">{t("gallery.sortBy", { defaultValue: "按创建时间排序" })}</span>
              </div>
              <NailDesignGallery userOnly={false} />
            </div>
          </div>
        </div>
      </div>
      
      {page.branding && <Branding section={page.branding} />}
      {page.introduce && <Feature1 section={page.introduce} />}
      {page.benefit && <Feature2 section={page.benefit} />}
      {page.usage && <Feature3 section={page.usage} />}
      {page.feature && <Feature section={page.feature} />}
      {page.showcase && <Showcase section={page.showcase} />}
      {page.stats && <Stats section={page.stats} />}
      {page.pricing && <Pricing pricing={page.pricing} />}
      {page.testimonial && <Testimonial section={page.testimonial} />}
      {page.faq && <FAQ section={page.faq} />}
      {page.cta && <CTA section={page.cta} />}
    </>
  );
}
