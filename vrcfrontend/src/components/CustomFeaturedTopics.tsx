// filepath: e:\Download\vrc\vrcfrontend\src\components\CustomFeaturedTopics.tsx
import { ArrowRight } from 'lucide-react';

interface TopicCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

// Custom demo topics
const demoTopics: TopicCardProps[] = [
  {
    id: '1',
    title: "Demo Sản Phẩm Mới",
    description: "Trải nghiệm sản phẩm mới nhất với tính năng hiện đại và hiệu suất cao",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    link: "/products"
  },
  {
    id: '2',
    title: "Demo Giải Pháp Tiết Kiệm",
    description: "Khám phá các giải pháp tiết kiệm năng lượng và chi phí vận hành",
    imageUrl: "https://images.unsplash.com/photo-1605493725784-98451361756d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    link: "/technologies"
  },
  {
    id: '3',
    title: "Demo Dịch Vụ Hỗ Trợ",
    description: "Giải pháp hỗ trợ kỹ thuật nhanh chóng với đội ngũ chuyên nghiệp",
    imageUrl: "https://images.unsplash.com/photo-1590650046871-92c887180603?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    link: "/services"
  }
];

const CustomFeaturedTopics = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <span className="text-accent font-medium mb-2 block">Demo</span>
            <h2 className="mb-4">Sản phẩm demo nổi bật</h2>
            <p className="text-muted-foreground max-w-2xl">
              Khám phá các sản phẩm demo mới nhất của chúng tôi với tính năng hiện đại và công nghệ tiên tiến.
            </p>
          </div>
          <a href="/products" className="mt-4 md:mt-0 inline-flex items-center text-accent hover:text-primary transition-colors font-medium">
            Xem tất cả sản phẩm demo
            <ArrowRight size={18} className="ml-2" />
          </a>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {demoTopics.map((topic, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src={topic.imageUrl} 
                  alt={topic.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-0 right-0 bg-accent text-white text-xs px-2 py-1 rounded-bl-md">
                  Demo
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{topic.title}</h3>
                <p className="text-muted-foreground mb-4">{topic.description}</p>
                <a href={topic.link} className="inline-flex items-center text-accent hover:text-primary transition-colors font-medium">
                  Khám phá ngay
                  <ArrowRight size={18} className="ml-2" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomFeaturedTopics;
