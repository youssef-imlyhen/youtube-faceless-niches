import { useState } from 'react';
import type { FilterState } from '../types';

export const useFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    minSubs: 0,
    maxSubs: 1000000000, // 1B
    minViews: 0,
    maxViews: 100000000000, // 100B
    minAvgViews: 0,
    maxAvgViews: 1000000000, // 1B
    minVideos: 0,
    maxVideos: 10000, // 10k
    minDuration: 0,
    maxDuration: 36000, // 10 hours
    minMaxViews: 0,
    maxMaxViews: 1000000000, // 1B
    minRPM: 0,
    maxRPM: 100, // Reduced to $100 after fixing data outliers
    minOpp: 0,
    maxOpp: 10,
    minGrowth: 0,
    maxGrowth: 10,
    minComp: 0,
    maxComp: 10,
    minQuality: 0,
    maxQuality: 10,
    minConsistency: 0,
    maxConsistency: 10,
    minEngagement: 0,
    maxEngagement: 10,
    niche: '',
    format: '',
    difficulty: '',
    ageLevel: '',
    gender: '',
    socialClass: '',
    firstVideoDate: '',
    lastVideoDate: '',
    language: '',
    location: '',
    contentComplexity: '',
    visualStyle: '',
  });

  const updateFilter = (key: keyof FilterState, value: number | string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      minSubs: 0,
      maxSubs: 1000000000,
      minViews: 0,
      maxViews: 100000000000,
      minAvgViews: 0,
      maxAvgViews: 1000000000,
      minVideos: 0,
      maxVideos: 10000,
      minDuration: 0,
      maxDuration: 36000,
      minMaxViews: 0,
      maxMaxViews: 1000000000,
      minRPM: 0,
      maxRPM: 100,
      minOpp: 0,
      maxOpp: 10,
      minGrowth: 0,
      maxGrowth: 10,
      minComp: 0,
      maxComp: 10,
      minQuality: 0,
      maxQuality: 10,
      minConsistency: 0,
      maxConsistency: 10,
      minEngagement: 0,
      maxEngagement: 10,
      niche: '',
      format: '',
      difficulty: '',
      ageLevel: '',
      gender: '',
      socialClass: '',
      firstVideoDate: '',
      lastVideoDate: '',
      language: '',
      location: '',
      contentComplexity: '',
      visualStyle: '',
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
  };
};