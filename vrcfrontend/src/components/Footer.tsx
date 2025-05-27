import { Facebook, Twitter, Linkedin, Youtube, Mail, MessageCircle } from 'lucide-react';
import AppLink from '@/components/ui/app-link';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useFooter } from '@/hooks/useFooter';
import { useServiceCategories } from '@/hooks/useServiceCategories';

const Footer = () => {
  const { companyInfo, isLoading, error } = useCompanyInfo();
  const { footerData, clearCacheAndRefresh: clearFooterCache } = useFooter(); // Get footer navigation data from API
  const { categoriesData, clearCacheAndRefresh: clearServicesCategoriesCache } = useServiceCategories(5); // Get top 5 service categories for footer

  // Combined function to clear all caches
  const clearAllCaches = () => {
    clearFooterCache();
    clearServicesCategoriesCache();
    console.log('Cleared all footer and service categories caches');
  };

  // Fallback data while loading or if there's an error
  const fallbackData = {
    companyName: 'VRC - Tổng công ty Kỹ thuật lạnh Việt Nam',
    companyDescription: 'Cung cấp giải pháp điện lạnh toàn diện cho mọi doanh nghiệp và công trình.',
    contactSection: {
      address: '123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh, Việt Nam',
      email: 'info@vrc.com.vn',
      phone: undefined,
      hotline: undefined,
      workingHours: undefined,
      fax: undefined
    },
    socialMedia: {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      youtube: 'https://youtube.com',
      zalo: undefined,
      instagram: undefined,
      telegram: undefined
    },
    logo: null
  };

  // Use API data if available, otherwise use fallback
  const displayData = companyInfo || fallbackData;

  // Show loading state briefly if needed (optional)
  if (isLoading && !companyInfo) {
    // Still show the footer with fallback data while loading
    // This ensures the layout doesn't jump
  }

  // Log error for debugging but don't break the UI
  if (error) {
    console.warn('Footer: Error loading company info:', error);
  }

  return (
    <footer className="bg-primary text-white">
      {isLoading && !companyInfo && (
        <div className="bg-primary/90 text-xs text-center py-1 text-gray-300">
          Đang tải thông tin...
        </div>
      )}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 */}
          <div>
            <div className="mb-4">
              {displayData.logo?.url ? (
                <img 
                  src={displayData.logo.url.startsWith('http') ? displayData.logo.url : `${import.meta.env.VITE_API_URL}${displayData.logo.url}`} 
                  alt={displayData.logo.alt || displayData.companyName} 
                  className="h-16"
                  onError={(e) => {
                    // Try fallback to direct media path
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('/media/logo.svg')) {
                      target.src = `${import.meta.env.VITE_API_URL}/media/logo.svg`;
                    } else {
                      target.src = "/placeholder.svg";
                    }
                  }}
                />
              ) : (
                <img 
                  src={`${import.meta.env.VITE_API_URL}/media/logo.svg`}
                  alt={displayData.companyName}
                  className="h-16"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              )}
            </div>
            <p className="text-gray-300 mb-6">
              {displayData.companyDescription}
            </p>
            <div className="flex space-x-4">
              {displayData.socialMedia?.facebook && (
                <a 
                  href={displayData.socialMedia.facebook} 
                  className="text-gray-300 hover:text-white transition-colors" 
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook size={20} />
                </a>
              )}
              {displayData.socialMedia?.zalo && (
                <a 
                  href={displayData.socialMedia.zalo} 
                  className="text-gray-300 hover:text-white transition-colors" 
                  aria-label="Zalo"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={20} />
                </a>
              )}
              {displayData.socialMedia?.twitter && (
                <a 
                  href={displayData.socialMedia.twitter} 
                  className="text-gray-300 hover:text-white transition-colors" 
                  aria-label="Twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter size={20} />
                </a>
              )}
              {displayData.socialMedia?.linkedin && (
                <a 
                  href={displayData.socialMedia.linkedin} 
                  className="text-gray-300 hover:text-white transition-colors" 
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin size={20} />
                </a>
              )}
              {displayData.socialMedia?.youtube && (
                <a 
                  href={displayData.socialMedia.youtube} 
                  className="text-gray-300 hover:text-white transition-colors" 
                  aria-label="YouTube"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Youtube size={20} />
                </a>
              )}
            </div>
          </div>
          
          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              {footerData?.navItems && footerData.navItems.length > 0 ? (
                // Use footer navigation data from API
                footerData.navItems.slice(0, 5).map((item, index) => (
                  <li key={item.id || index}>
                    <AppLink 
                      routeKey={item.link.url?.toUpperCase() || 'HOME'} 
                      className="footer-link"
                    >
                      {item.link.label}
                    </AppLink>
                  </li>
                ))
              ) : (
                // Fallback to hardcoded links if no API data
                <>
                  <li><AppLink routeKey="ABOUT" className="footer-link">Giới thiệu</AppLink></li>
                  <li><AppLink routeKey="PRODUCTS" className="footer-link">Sản phẩm</AppLink></li>
                  <li><AppLink routeKey="SERVICES" className="footer-link">Dịch vụ</AppLink></li>
                  <li><AppLink routeKey="NEWS" className="footer-link">Tin tức & sự kiện</AppLink></li>
                  <li><AppLink routeKey="CONTACT" className="footer-link">Liên hệ</AppLink></li>
                </>
              )}
            </ul>
          </div>
          
          {/* Column 3 - Service Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Dịch vụ</h4>
            <ul className="space-y-2">
              {categoriesData?.categories && categoriesData.categories.length > 0 ? (
                // Use service categories data from API
                categoriesData.categories.slice(0, 5).map((category) => (
                  <li key={category.id}>
                    <a 
                      href={`/services/${category.slug}`}
                      className="footer-link"
                    >
                      {category.title}
                    </a>
                  </li>
                ))
              ) : (
                // Fallback to hardcoded services if no API data
                <>
                  <li><AppLink routeKey="INSTALLATION" className="footer-link">Lắp đặt điều hòa</AppLink></li>
                  <li><AppLink routeKey="MAINTENANCE" className="footer-link">Bảo trì hệ thống</AppLink></li>
                  <li><AppLink routeKey="REPAIR" className="footer-link">Sửa chữa thiết bị</AppLink></li>
                  <li><AppLink routeKey="CONSULTING" className="footer-link">Tư vấn thiết kế</AppLink></li>
                  <li><AppLink routeKey="SERVICE_SUPPORT" className="footer-link">Hỗ trợ kỹ thuật</AppLink></li>
                </>
              )}
            </ul>
          </div>
          
          {/* Column 4 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
            <address className="not-italic text-gray-300 mb-4 space-y-2">
              <p>{displayData.companyName}</p>
              <p>{displayData.contactSection.address}</p>
              {displayData.contactSection.phone && (
                <p>Tel: {displayData.contactSection.phone}</p>
              )}
              {displayData.contactSection.hotline && (
                <p>Hotline: {displayData.contactSection.hotline}</p>
              )}
            </address>
            <a 
              href={`mailto:${displayData.contactSection.email}`} 
              className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <Mail size={16} className="mr-2" />
              {displayData.contactSection.email}
            </a>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <p className="text-gray-300 text-sm">
              © {new Date().getFullYear()} VRC - Tổng công ty kỹ thuật điện lạnh Việt Nam. Tất cả quyền được bảo lưu.
            </p>
            <button 
              onClick={clearAllCaches}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white transition-colors"
              title="Làm mới dữ liệu footer"
            >
              🔄
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
            <AppLink routeKey="PRIVACY" className="footer-link">Chính sách bảo mật</AppLink>
            <AppLink routeKey="TERMS" className="footer-link">Điều khoản sử dụng</AppLink>
            <AppLink routeKey="COOKIES" className="footer-link">Chính sách cookie</AppLink>
            <AppLink routeKey="SITEMAP" className="footer-link">Sơ đồ trang</AppLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
