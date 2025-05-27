// Type definitions for i18next translations
export interface Resources {
  translation: {
    common: {
      home: string;
      about: string;
      services: string;
      products: string;
      blog: string;
      contact: string;
      search: string;
      language: string;
      loading: string;
      error: string;
      tryAgain: string;
      readMore: string;
      learnMore: string;
      viewAll: string;
      showMore: string;
      showLess: string;
      submit: string;
      cancel: string;
      save: string;
      edit: string;
      delete: string;
      back: string;
      next: string;
      previous: string;
      close: string;
    };
    navigation: {
      mainMenu: string;
      breadcrumb: string;
      skipToContent: string;
    };
    header: {
      companyName: string;
      tagline: string;
    };
    hero: {
      title: string;
      subtitle: string;
      cta: string;
    };
    footer: {
      copyright: string;
      privacyPolicy: string;
      termsOfService: string;
      followUs: string;
    };
    forms: {
      name: string;
      email: string;
      phone: string;
      message: string;
      required: string;
      invalidEmail: string;
      invalidPhone: string;
      messageSent: string;
      messageError: string;
    };
    pages: {
      home: {
        title: string;
        description: string;
      };
      about: {
        title: string;
        description: string;
      };
      services: {
        title: string;
        description: string;
      };
      products: {
        title: string;
        description: string;
      };
      blog: {
        title: string;
        description: string;
      };
      contact: {
        title: string;
        description: string;
      };
    };
    products: {
      category: string;
      price: string;
      availability: string;
      inStock: string;
      outOfStock: string;
      addToCart: string;
      viewDetails: string;
      specifications: string;
      reviews: string;
      relatedProducts: string;
    };
    blog: {
      publishedOn: string;
      author: string;
      category: string;
      tags: string;
      sharePost: string;
      relatedPosts: string;
      comments: string;
      leaveComment: string;
    };
    contact: {
      getInTouch: string;
      contactInfo: string;
      address: string;
      phone: string;
      email: string;
      businessHours: string;
      sendMessage: string;
    };
  };
}

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: Resources;
  }
}
