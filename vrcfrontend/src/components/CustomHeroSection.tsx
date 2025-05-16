// filepath: e:\Download\vrc\vrcfrontend\src\components\CustomHeroSection.tsx
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

interface SlideProps {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
}

const slides: SlideProps[] = [
  {
    id: 1,
    title: "Trang Demo Sản Phẩm Mới",
    subtitle: "Khám phá các tính năng mới trong phiên bản demo",
    imageUrl: "https://images.unsplash.com/photo-1544397558-5c19ca32ca47?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    link: "/products"
  },
  {
    id: 2,
    title: "Giải Pháp Demo Tương Tác",
    subtitle: "Trải nghiệm giao diện người dùng hiện đại và thuận tiện",
    imageUrl: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    link: "/technologies"
  },
  {
    id: 3,
    title: "Dịch Vụ Hỗ Trợ Demo",
    subtitle: "Nhận hỗ trợ kỹ thuật nhanh chóng và chuyên nghiệp",
    imageUrl: "https://images.unsplash.com/photo-1560179304-6fc1d8749b23?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    link: "/services"
  }
];

const CustomHeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      <div className="absolute top-0 left-0 z-30 bg-accent/80 text-white px-4 py-2 rounded-br-md">
        Demo Page
      </div>
      
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${slide.imageUrl})` }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          <div className="container-custom h-full flex items-center relative z-20">
            <div className="max-w-2xl text-white">
              <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">{slide.title}</h1>
              <p className="text-xl md:text-2xl mb-8">{slide.subtitle}</p>
              <a 
                href={slide.link} 
                className="inline-flex items-center btn-secondary font-medium"
              >
                Khám phá ngay
                <ChevronRight size={20} className="ml-2" />
              </a>
            </div>
          </div>
        </div>
      ))}
      
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentSlide ? 'bg-white' : 'bg-white/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomHeroSection;
