export interface Video {
  id: string;
  title: string;
  description: string;
  duration: number;
  viewCount: number;
  uploadDate: string;
  thumbnail: string;
  channelName: string;
}

export interface TargetAudience {
  primaryDemographics?: string[];
  ageLevel: string;
  socialClass: string;
  genderTarget: string;
  interests?: string[];
  purchasingPower?: string;
  psychographics?: string;
}

export interface ContentCharacteristics {
  videoDuration: string;
  visualStyle: string;
  narrationStyle?: string;
  complexity: string;
}

export interface EstimatedRPM {
  value: number;
  rationale: string;
}

export interface OpportunityAnalysis {
  opportunityScore: number;
  saturationLevel: string;
  growthPotential?: number;
  competitionLevel: number;
  reasoning: string;
}

export interface QualityIndicators {
  productionQuality: number;
  consistency: number;
  engagementRate: number;
  avgViewsPerVideo?: number;
  overallQualityScore?: number;
}

export interface FacelessSuitability {
  isSuitable: boolean;
  requiredAssets: string[];
  implementationDifficulty: string;
  notes?: string;
}

export interface UntappedOpportunity {
  isUnderserved: boolean;
  whyUnderserved: string;
  recommendedPivot?: string;
}

export interface AdditionalInsights {
  strength: string;
  weakness: string;
  differentiation: string;
  potentialImprovements: string;
}

export interface Monetization {
  primary: string;
  potentialAffiliates: string[];
  digitalProductIdeas: string[];
}

export interface KeySuccessFactors {
  thumbnailStyle: string;
  hookStructure: string;
  trafficSource: string;
}

export interface SpinOffIdea {
  conceptName: string;
  angle: string;
  targetAudience: string;
  videoIdeas: string[];
}

export interface AIEnrichment {
  channelName: string;
  handle: string;
  nicheKeywords: string[];
  contentFormats: string[];
  formatsDescription: string;
  targetAudience: TargetAudience;
  contentCharacteristics: ContentCharacteristics;
  estimatedRPM: EstimatedRPM;
  opportunityAnalysis: OpportunityAnalysis;
  qualityIndicators: QualityIndicators;
  facelessSuitability: FacelessSuitability;
  monetization: Monetization;
  keySuccessFactors: KeySuccessFactors;
  untappedOpportunity: UntappedOpportunity;
  additionalInsights: AdditionalInsights;
  spinOffIdeas: SpinOffIdea[];
  analysedAt: string;
}

export interface Channel {
  channelUrl: string;
  profilePicture: string;
  name: string;
  handle: string;
  subscriberCount: number;
  subscriberDisplay: string;
  description: string;
  extractedAt: string;
  channelId: string;
  subscriberCountNumeric: number;
  videos: Video[];
  fetchedAt: string;
  aiEnrichment: AIEnrichment;
}

export interface Niche {
  id: number;
  niche: string;
  examples?: string;
  target?: string;
  rpm: string;
  competition: string;
  category?: string;
}

export interface FilterState {
  minSubs: number;
  maxSubs: number;
  minViews: number;
  maxViews: number;
  minAvgViews: number;
  maxAvgViews: number;
  minVideos: number;
  maxVideos: number;
  minDuration: number;
  maxDuration: number;
  minMaxViews: number;
  maxMaxViews: number;
  minRPM: number;
  maxRPM: number;
  minOpp: number;
  maxOpp: number;
  minGrowth: number;
  maxGrowth: number;
  minComp: number;
  maxComp: number;
  minQuality: number;
  maxQuality: number;
  minConsistency: number;
  maxConsistency: number;
  minEngagement: number;
  maxEngagement: number;
  niche: string;
  format: string;
  difficulty: string;
  ageLevel: string;
  gender: string;
  socialClass: string;
  firstVideoDate: string;
  lastVideoDate: string;
  language: string;
  location: string;
  contentComplexity: string;
  visualStyle: string;
}
