// 성능 모니터링 및 분석 유틸리티

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export interface UserEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

class Analytics {
  private sessionId: string;
  private events: UserEvent[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializePerformanceMonitoring();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializePerformanceMonitoring() {
    if (typeof window !== 'undefined') {
      // Core Web Vitals 모니터링
      this.observeWebVitals();
      
      // 페이지 로드 시간 측정
      this.measurePageLoadTime();
      
      // 에러 추적
      this.trackErrors();
    }
  }

  private observeWebVitals() {
    if ('PerformanceObserver' in window) {
      // LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.track('lcp', { value: lastEntry.startTime });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.track('fid', { value: entry.processingStart - entry.startTime });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.track('cls', { value: clsValue });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private measurePageLoadTime() {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
          this.track('page_load_time', { value: pageLoadTime });
        }
      });
    }
  }

  private trackErrors() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.track('error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.track('unhandled_rejection', {
          reason: event.reason,
        });
      });
    }
  }

  track(event: string, properties?: Record<string, any>) {
    const userEvent: UserEvent = {
      event,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.events.push(userEvent);
    
    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', userEvent);
    }

    // 프로덕션에서는 서버로 전송
    if (process.env.NODE_ENV === 'production') {
      this.sendToServer(userEvent);
    }
  }

  private async sendToServer(event: UserEvent) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  getPerformanceMetrics(): PerformanceMetrics | null {
    if (typeof window === 'undefined') return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return null;

    return {
      pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
      firstContentfulPaint: 0, // FCP는 별도로 측정 필요
      largestContentfulPaint: 0, // LCP는 별도로 측정 필요
      cumulativeLayoutShift: 0, // CLS는 별도로 측정 필요
      firstInputDelay: 0, // FID는 별도로 측정 필요
    };
  }

  getEvents(): UserEvent[] {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }
}

// 싱글톤 인스턴스
export const analytics = new Analytics();

// 편의 함수들
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  analytics.track(event, properties);
};

export const trackPageView = (page: string) => {
  analytics.track('page_view', { page });
};

export const trackConversion = (campaignId: string, amount?: number) => {
  analytics.track('conversion', { campaignId, amount });
};

export const trackReferralClick = (campaignId: string, participantId: string) => {
  analytics.track('referral_click', { campaignId, participantId });
};
