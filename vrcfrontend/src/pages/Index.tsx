import HeroSection from "@/components/HeroSection";
import FeaturedTopics from "@/components/FeaturedTopics";
import LatestPublications from "@/components/LatestPublications";
import UpcomingEvents from "@/components/UpcomingEvents";
import DataResources from "@/components/DataResources";
import ContactForm from "@/components/ContactForm";

const Index = () => {
  return (
    <>
      <HeroSection />
      <FeaturedTopics />
      <LatestPublications />
      <UpcomingEvents />
      <DataResources />
      <ContactForm />
    </>
  );
};

export default Index;
