export interface StatItem {
    title: string;
    value: string;
    percentageChange: number;
    isPositiveTrend: boolean;
    icon: string;
}

export interface AdminDashboardStats {
    stats: StatItem[];
}

export interface ChartDataset {
    label: string;
    data: number[];
    color: string;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

export interface RecentActivity {
    id: number;
    title: string;
    description: string;
    time: Date;
    type: string;
    imageUrl: string;
}

export interface TimelineStats {
    activePosts: number;
    totalPosts: number;
    newPostsLast24H: number;
    totalReports: number;
    pendingReports: number;
    engagementMetrics: StatItem[];
}

export interface PostReportSummary {
    reportId: number;
    postId: number;
    reporterName: string;
    reason: string;
    reportedAt: string;
    postContentSnippet: string;
    isRead: boolean;
}

export interface UserProfileOverview {
    id: number;
    email: string;
    nameEn: string;
    nameAr: string;
    phoneNumber?: string;
    age?: number;
    genderId?: number;
    contactTypeId?: number;
    address?: string;
    statusId: number;
    imageUrl?: string;
    postsCount: number;
    commentsCount: number;
    petsCount: number;
    submittedAdoptionFormsCount: number;
    petAdoptionRequestsCount: number;
    likesCount: number;
    givenReportsCount: number;
    receivedReportsCount: number;
}
