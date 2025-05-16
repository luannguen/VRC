import { ArrowRight, CalendarIcon, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateRange } from '@/lib/utils';
import useHomepage from '@/hooks/useHomepage';

interface EventProps {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  featuredImage: {
    url: string;
  };
  slug: string;
  eventType: string;
}

// Fallback events in case API call fails
const fallbackEvents = [
  {
    id: '1',
    title: "Triển lãm Quốc tế về Hệ thống Lạnh và Điều hòa Không khí 2025",
    startDate: "2025-05-15",
    endDate: "2025-05-18",
    location: "Trung tâm Hội chợ và Triển lãm Sài Gòn (SECC), TP.HCM",
    featuredImage: {
      url: "/lovable-uploads/0bd3c048-8e37-4775-a6bc-0b54ec07edbe.png"
    },
    slug: "trien-lam-quoc-te-he-thong-lanh-2025",
    eventType: "exhibition"
  },
  {
    id: '2',
    title: "Hội thảo Công nghệ Tiết kiệm Năng lượng trong Hệ thống Lạnh",
    startDate: "2025-04-20",
    endDate: "2025-04-20",
    location: "Khách sạn Melia, Hà Nội",
    featuredImage: {
      url: "/assets/images/projects-overview.jpg"
    },
    slug: "hoi-thao-cong-nghe-tiet-kiem-nang-luong",
    eventType: "workshop"
  },
  {
    id: '3',
    title: "Khóa đào tạo Kỹ thuật viên Bảo trì Hệ thống Lạnh Công nghiệp",
    startDate: "2025-04-10",
    endDate: "2025-04-12",
    location: "Trung tâm Đào tạo VRC, Biên Hòa",
    featuredImage: {
      url: "/assets/images/service-overview.jpg"
    },
    slug: "khoa-dao-tao-ky-thuat-vien-bao-tri",
    eventType: "training"
  }
];

// Helper function to format date if not imported from utils
const formatEventDate = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Format for display
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const startFormatted = start.toLocaleDateString('vi-VN', options);
  
  // If same day event
  if (startDate === endDate) {
    return startFormatted;
  }
  
  // Multi-day event
  const endFormatted = end.toLocaleDateString('vi-VN', options);
  return `${startFormatted} - ${endFormatted}`;
};

// Function to map event type to Vietnamese text
const getEventTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    'exhibition': 'Triển lãm',
    'workshop': 'Hội thảo',
    'training': 'Đào tạo',
    'conference': 'Hội nghị',
    'other': 'Sự kiện khác'
  };
  
  return typeMap[type] || 'Sự kiện';
};

const UpcomingEvents = () => {
  // Use the homepage hook to get the upcoming events
  const { homepageData, isLoading, error } = useHomepage();
  
  // Use API data if available, otherwise fallback to static data
  const events = homepageData?.upcomingEvents || fallbackEvents;
  
  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container-custom">
          <div className="mb-12">
            <h2 className="mb-4">Sự kiện sắp diễn ra</h2>
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
      </section>
    );
  }
  
  if (error && !events.length) {
    return (
      <section className="py-16 bg-background">
        <div className="container-custom">
          <div className="mb-12">
            <h2 className="mb-4">Sự kiện sắp diễn ra</h2>
            <p className="text-red-500">Có lỗi khi tải dữ liệu. Vui lòng thử lại sau.</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-16 bg-background">
      <div className="container-custom">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <h2 className="mb-4">Sự kiện sắp diễn ra</h2>
            <p className="text-muted-foreground max-w-2xl">
              Cập nhật các sự kiện, hội thảo và triển lãm sắp diễn ra trong thời gian tới. Tham gia để cập nhật xu hướng mới nhất trong ngành.
            </p>
          </div>
          <Link to="/events" className="mt-4 md:mt-0 inline-flex items-center text-accent hover:text-primary transition-colors font-medium">
            Xem tất cả sự kiện
            <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src={event.featuredImage.url} 
                  alt={event.title} 
                  className="w-full h-48 object-cover"
                />
                <span className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                  {getEventTypeText(event.eventType)}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-base font-medium line-clamp-2 mb-3">{event.title}</h3>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <CalendarIcon size={14} className="mr-2 flex-shrink-0" />
                    <span>{formatDateRange(event.startDate, event.endDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={14} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
                
                <Link 
                  to={`/event-details/${event.slug}`} 
                  className="inline-flex items-center text-accent hover:text-primary transition-colors text-sm font-medium"
                >
                  Xem chi tiết
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
