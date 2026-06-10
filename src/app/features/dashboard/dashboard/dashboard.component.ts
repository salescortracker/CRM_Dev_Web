import { Component, OnDestroy, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ChartConfiguration } from 'chart.js';
import { Chart as ChartJS, BarController, LineController, DoughnutController, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(BarController, LineController, DoughnutController, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  isBrowser = false;
  loading = true;
  currentDate = new Date();
  userInitials = 'JD';
  userName = 'John Doe';
  private themeObserver?: MutationObserver;

  // metrics = {
  //   totalPipeline: 500000,
  //   expectedRevenue: 350000,
  //   dealsThisMonth: 12,
  //   winRate: 45,
  //   avgDealSize: 41666,
  // };

  // Metrics
  metrics = {
    totalPipeline: 500000,
    expectedRevenue: 350000,
    dealsThisMonth: 12,
    winRate: 45,
    avgDealSize: 41666,
    totalLeads: 150,
    hotLeads: 45,
    convertedLeads: 12,
    conversionRate: 8,
  };

  // pipelineData = {
  //   prospecting: { count: 25, value: 150000 },
  //   qualification: { count: 18, value: 120000 },
  //   proposal: { count: 12, value: 100000 },
  //   negotiation: { count: 8, value: 80000 },
  //   closedWon: { count: 6, value: 60000 },
  //   closedLost: { count: 5, value: 0 },
  // };

  // Pipeline Data
  pipelineData = {
    prospecting: { count: 25, value: 150000 },
    qualification: { count: 18, value: 120000 },
    proposal: { count: 12, value: 100000 },
    negotiation: { count: 8, value: 80000 },
    closedWon: { count: 6, value: 60000 },
    closedLost: { count: 5, value: 0 },
  };

  // Lead Stats
  leadStats = {
    totalLeads: 150,
    highScore: 45,
    mediumScore: 32,
    lowScore: 73,
    averageScore: 48,
    newLeadsThisMonth: 28,
    convertedThisMonth: 12,
    conversionRate: 8,
  };

  // Recent Data
  recentLeads = [
    {
      id: '1',
      name: 'Jane Smith',
      company: 'TechCorp',
      score: 92,
      status: 'New',
      source: 'Website',
      email: 'jane@techcorp.com',
    },
    {
      id: '2',
      name: 'Bob Johnson',
      company: 'StartupInc',
      score: 78,
      status: 'Contacted',
      source: 'Referral',
      email: 'bob@startupinc.com',
    },
    {
      id: '3',
      name: 'Alice Brown',
      company: 'EnterpriseCo',
      score: 85,
      status: 'Qualified',
      source: 'Email',
      email: 'alice@enterpriseco.com',
    },
  ];

  recentDeals = [
    {
      id: '1',
      name: 'Enterprise Software License',
      company: 'Acme Corp',
      amount: 50000,
      stage: 'Proposal',
      probability: 75,
    },
    {
      id: '2',
      name: 'Consulting Services',
      company: 'TechStart Inc',
      amount: 25000,
      stage: 'Negotiation',
      probability: 60,
    },
    {
      id: '3',
      name: 'Implementation Project',
      company: 'Global Solutions',
      amount: 75000,
      stage: 'Qualification',
      probability: 40,
    },
  ];

  recentActivities = [
    {
      id: '1',
      type: 'call',
      subject: 'Call with Acme Corp',
      description: 'John Smith - Sales Discussion',
      time: '2 hours ago',
    },
    {
      id: '2',
      type: 'email',
      subject: 'Email sent to TechStart Inc',
      description: 'Proposal attached',
      time: '4 hours ago',
    },
    {
      id: '3',
      type: 'meeting',
      subject: 'Meeting scheduled',
      description: 'Q2 Planning Session - Sarah Johnson',
      time: '1 day ago',
    },
    {
      id: '4',
      type: 'deal',
      subject: 'Deal closed: $50,000',
      description: 'Enterprise Software License - Acme Corp',
      time: '2 days ago',
    },
  ];

  recentNotifications = [
    {
      id: '1',
      type: 'info',
      title: 'Deal Moving to Proposal',
      message: 'TechStart Inc deal moved to Proposal stage',
    },
    {
      id: '2',
      type: 'success',
      title: 'Deal Won!',
      message: 'Enterprise Software License closed at $50,000',
    },
    {
      id: '3',
      type: 'warning',
      title: 'Overdue Follow-up',
      message: 'Follow-up due for GreenTech Solutions',
    },
    {
      id: '4',
      type: 'danger',
      title: '5 Leads Expiring Soon',
      message: 'Leads not contacted in 30 days will be archived',
    },
  ];

  // Top Performers
  topPerformers = [
    { name: 'Sarah Johnson', deals: 8, revenue: 125000, avatar: 'SJ' },
    { name: 'Mike Chen', deals: 6, revenue: 95000, avatar: 'MC' },
    { name: 'Emma Davis', deals: 5, revenue: 85000, avatar: 'ED' },
  ];

  // Lead Source Distribution
  leadSourceData = [
    { source: 'Website', count: 45, percentage: 30 },
    { source: 'Referral', count: 40, percentage: 26 },
    { source: 'Cold Call', count: 35, percentage: 24 },
    { source: 'Email', count: 20, percentage: 13 },
    { source: 'Ad', count: 10, percentage: 7 },
  ];

  pipelineChartData: any = {};
  pipelineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false
  };

  revenueChartData: any = {};
  revenueChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false
  };

  leadSourceChartData: any = {};
  leadSourceChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get dashboardFirstName(): string {
    return this.userName.split(' ')[0] || this.userName;
  }

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadDashboardData();
    this.watchThemeChanges();
  }

  ngOnDestroy(): void {
    this.themeObserver?.disconnect();
  }

  loadDashboardData(): void {
    this.loading = true;

    this.initializeCharts();
    this.loading = false;
  }

  quickAction(route: string): void {
    this.router.navigate([route]);
  }

  initializeCharts(): void {
    const theme = this.getChartTheme();
    const gridColor = theme.grid;
    const tickColor = theme.tick;

    // Pipeline by Stage Chart
    this.pipelineChartData = {
      labels: [
        'Prospecting',
        'Qualification',
        'Proposal',
        'Negotiation',
        'Closed Won',
      ],
      datasets: [
        {
          label: 'Pipeline Value',
          data: [105000, 88000, 155000, 76000, 200000],
          backgroundColor: '#c4143d',
          borderColor: '#c4143d',
          borderRadius: 4,
          borderSkipped: false,
          barPercentage: 0.44,
          categoryPercentage: 0.66,
        },
      ],
    };
    this.pipelineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 650 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          callbacks: {
            label: (context) => ` ${this.formatCurrency(Number(context.raw || 0))}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { color: theme.axis },
          ticks: {
            color: tickColor,
            font: { size: 10 },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 3
          }
        },
        y: {
          min: 0,
          max: 220000,
          grid: { display: false },
          border: { color: theme.axis },
          ticks: {
            color: tickColor,
            font: { size: 10 },
            stepSize: 55000,
            callback: (value) => Number(value).toLocaleString()
          }
        }
      }
    };

    // Revenue Trend Chart
    this.revenueChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue',
          data: [40000, 30000, 55000, 45000, 60000, 82000],
          borderColor: '#c4143d',
          backgroundColor: 'rgba(196, 20, 61, 0.06)',
          borderWidth: 2.5,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointBackgroundColor: '#c4143d',
          pointBorderColor: theme.card,
          pointBorderWidth: 2
        },
      ],
    };
    this.revenueChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 650 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          callbacks: {
            label: (context) => ` ${this.formatCurrency(Number(context.raw || 0))}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          border: { color: theme.axis },
          ticks: { color: tickColor, font: { size: 10 } }
        },
        y: {
          min: 0,
          max: 82000,
          grid: { color: gridColor },
          border: { color: theme.axis },
          ticks: {
            color: tickColor,
            font: { size: 10 },
            stepSize: 20000,
            callback: (value) => Number(value).toLocaleString()
          }
        }
      }
    };

    this.leadSourceChartData = {
        labels: ['Website', 'Referral', 'Outbound', 'Events', 'LinkedIn'],
        datasets: [
          {
            label: 'Leads by Source',
            data: [30, 22, 22, 14, 12],
            backgroundColor: [
              '#c4143d',
              '#475569',
              '#94a3b8',
              '#cbd5e1',
              '#f59e0b',
            ],
            borderColor: theme.card,
            borderWidth: 3,
            hoverOffset: 4,
          },
        ],
      };
    this.leadSourceChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '58%',
      animation: { duration: 650 },
      plugins: {
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          callbacks: {
            label: (context: any) => ` ${context.label}: ${context.raw}%`
          }
        },
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: tickColor,
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            boxHeight: 8,
            padding: 8,
            font: { size: 11 }
          }
        }
      }
    } as any;
  }

  private getChartTheme(): { grid: string; tick: string; heading: string; axis: string; card: string; tooltipBg: string } {
    const isDark = this.isBrowser && document.documentElement.classList.contains('dark');
    return {
      grid: isDark ? 'rgba(147, 164, 184, 0.24)' : '#d9e0ea',
      tick: isDark ? '#93a4b8' : '#6b7280',
      heading: isDark ? '#f8fafc' : '#171b22',
      axis: isDark ? '#526071' : '#6d737c',
      card: isDark ? '#1e2536' : '#ffffff',
      tooltipBg: isDark ? '#0f172a' : '#172033'
    };
  }

  private watchThemeChanges(): void {
    if (!this.isBrowser || typeof MutationObserver === 'undefined') {
      return;
    }

    this.themeObserver = new MutationObserver(() => this.initializeCharts());
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  // getFormattedDate(): string {
  //   const options: Intl.DateTimeFormatOptions = {
  //     weekday: 'long',
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric',
  //   };
  //   return this.currentDate.toLocaleDateString('en-US', options);
  // }
// }

  // ===== FORMATTING METHODS =====

  /**
   * Format currency with K/M notation
   * Example: 1500000 -> $1.5M, 500000 -> $500K
   */
  formatCurrencyShort(value: number): string {
    if (!value) return '$0';
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return '$' + (value / 1000).toFixed(0) + 'K';
    }
    return '$' + value.toFixed(0);
  }

  /**
   * Format currency with full notation
   * Example: 500000 -> $500,000.00
   */
  formatCurrencyFull(value: number): string {
    if (!value) return '$0.00';
    return (
      '$' +
      value.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    );
  }

  /**
   * Format currency for display (without decimals)
   * Example: 500000 -> $500,000
   */
  formatCurrency(value: number): string {
    if (!value) return '$0';
    return '$' + (value || 0).toLocaleString('en-US');
  }

  /**
   * Format large numbers with K/M notation
   * Example: 1500000 -> 1.5M, 500000 -> 500K
   */
  formatNumber(value: number): string {
    if (!value) return '0';
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'K';
    }
    return value.toString();
  }

  /**
   * Get formatted date
   * Example: Wednesday, April 16, 2026
   */
  getFormattedDate(): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return this.currentDate.toLocaleDateString('en-US', options);
  }

  /**
   * Get lead score badge color class
   * High (80+) = danger (red)
   * Medium (50-79) = warning (yellow)
   * Low (<50) = secondary (gray)
   */
  getLeadScoreClass(score: number): string {
    if (score >= 80) return 'danger'; // Hot lead
    if (score >= 50) return 'warning'; // Warm lead
    return 'secondary'; // Cold lead
  }

  /**
   * Get activity icon class for styling
   */
  getActivityIconClass(type: string): string {
    switch (type) {
      case 'call':
        return 'call';
      case 'email':
        return 'email';
      case 'meeting':
        return 'meeting';
      case 'deal':
        return 'deal';
      default:
        return 'call';
    }
  }

  /**
   * Get notification icon class for styling
   */
  getNotificationIconClass(type: string): string {
    return type;
  }

  /**
   * Get total lead value
   */
  getTotalLeadValue(): number {
    return this.leadStats.totalLeads;
  }

  /**
   * Get total deal value
   */
  getTotalDealValue(): number {
    return this.metrics.totalPipeline;
  }

  /**
   * Get win rate percentage
   */
  getWinRatePercentage(): string {
    return this.metrics.winRate + '%';
  }

  /**
   * Get conversion rate percentage
   */
  getConversionRatePercentage(): string {
    return this.leadStats.conversionRate + '%';
  }

  /**
   * Get average score
   */
  getAverageScore(): number {
    return this.leadStats.averageScore;
  }

  /**
   * Get average deal size
   */
  getAverageDealSize(): string {
    return this.formatCurrencyShort(this.metrics.avgDealSize);
  }
}
