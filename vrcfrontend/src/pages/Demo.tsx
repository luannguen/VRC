// filepath: e:\Download\vrc\vrcfrontend\src\pages\Demo.tsx
import CustomHeroSection from "@/components/CustomHeroSection";
import CustomFeaturedTopics from "@/components/CustomFeaturedTopics";
import LatestPublications from "@/components/LatestPublications";
import DataResources from "@/components/DataResources";
import ContactForm from "@/components/ContactForm";

const Demo = () => {
  return (
    <>
      <div className="py-4 px-6 bg-accent/10 mb-6 rounded-md">
        <h1 className="text-2xl font-bold text-primary mb-2">Trang Demo</h1>
        <p className="text-muted-foreground">
          Đây là trang demo giống trang chủ, được tạo để minh họa chức năng "Thêm" trên thanh điều hướng.
          Trang này sử dụng các component tùy chỉnh để tạo sự khác biệt với trang chủ.
        </p>
      </div>
      <CustomHeroSection />
      <CustomFeaturedTopics />
      <LatestPublications />
      <DataResources />
      <ContactForm />
    </>
  );
};

export default Demo;
