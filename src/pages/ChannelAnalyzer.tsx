import React, { useState, useEffect } from 'react';
import ChannelCard from '../components/ChannelCard';
import { 
  FilterSection, 
  RangeFilter, 
  SelectFilter, 
  DateFilter, 
  SearchFilter,
  QuickFilterChip 
} from '../components/FilterSection';
import { useFilters } from '../hooks/useFilters';
import type { Channel } from '../types';
type SearchProperty = 'name' | 'niches' | 'target' | 'format' | 'keywords';
type SearchLogicalOperator = 'AND' | 'OR';

interface SearchFilterItem {
  id: string;
  term: string;
  property: SearchProperty;
  operator: SearchLogicalOperator;
}

interface PresetConfig {
  name: string;
  icon: string;
  description: string;
  urgency: 'critical' | 'high' | 'moderate';
  filters: string[];
  apply: (updateFilter: (key: keyof ReturnType<typeof useFilters>['filters'], value: any) => void) => void;
  color: 'success' | 'warning' | 'danger';
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const ChannelAnalyzer: React.FC = () => {
  const [channelsData, setChannelsData] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const { filters, updateFilter, resetFilters } = useFilters();

  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    size: true,
    opportunity: true,
    content: true,
    date: false
  });
  const [sortBy, setSortBy] = useState<string>('opportunity');

  const [searchFilters, setSearchFilters] = useState<SearchFilterItem[]>([
    {
      id: 'sf-1',
      term: '',
      property: 'name',
      operator: 'AND',
    },
  ]);

  const [selectedChannelIds, setSelectedChannelIds] = useState<Set<string>>(new Set());
  const [linksOnlyMode, setLinksOnlyMode] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    fetch('/channels.json')
      .then(res => res.json())
      .then((data: Channel[]) => {
        setChannelsData(data);
        setFilteredChannels(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load channel data:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = channelsData.filter(channel => {
      if (
        !channel.aiEnrichment ||
        !channel.aiEnrichment.estimatedRPM ||
        !channel.aiEnrichment.opportunityAnalysis ||
        !channel.aiEnrichment.qualityIndicators
      ) {
        return false;
      }

      const totalViews = channel.videos.reduce((sum, video) => sum + video.viewCount, 0);
      const avgViews = channel.videos.length > 0 ? Math.round(totalViews / channel.videos.length) : 0;
      const avgDuration = channel.videos.length > 0 ? Math.round(
        channel.videos.reduce((sum, video) => sum + video.duration, 0) / channel.videos.length
      ) : 0;
      const maxViews = channel.videos.length > 0 ? Math.max(...channel.videos.map(video => video.viewCount)) : 0;

      if (channel.subscriberCountNumeric < filters.minSubs || channel.subscriberCountNumeric > filters.maxSubs)
        return false;
      if (totalViews < filters.minViews || totalViews > filters.maxViews) return false;
      if (avgViews < filters.minAvgViews || avgViews > filters.maxAvgViews) return false;
      if (channel.videos.length < filters.minVideos || channel.videos.length > filters.maxVideos) return false;
      if (avgDuration < filters.minDuration || avgDuration > filters.maxDuration) return false;
      if (maxViews < filters.minMaxViews || maxViews > filters.maxMaxViews) return false;

      const rpm = channel.aiEnrichment.estimatedRPM.value;
      const opportunity = channel.aiEnrichment.opportunityAnalysis.opportunityScore;
      const growth = channel.aiEnrichment.opportunityAnalysis.growthPotential ?? 0;
      const competition = channel.aiEnrichment.opportunityAnalysis.competitionLevel;
      const quality = channel.aiEnrichment.qualityIndicators.productionQuality;
      const consistency = channel.aiEnrichment.qualityIndicators.consistency;
      const engagement = channel.aiEnrichment.qualityIndicators.engagementRate;

      if (rpm < filters.minRPM || rpm > filters.maxRPM) return false;
      if (opportunity < filters.minOpp || opportunity > filters.maxOpp) return false;
      if (growth < filters.minGrowth || growth > filters.maxGrowth) return false;
      if (competition < filters.minComp || competition > filters.maxComp) return false;
      if (quality < filters.minQuality || quality > filters.maxQuality) return false;
      if (consistency < filters.minConsistency || consistency > filters.maxConsistency) return false;
      if (engagement < filters.minEngagement || engagement > filters.maxEngagement) return false;

      if (
        filters.niche &&
        !channel.aiEnrichment.nicheKeywords.some(keyword =>
          keyword.toLowerCase().includes(filters.niche.toLowerCase())
        )
      )
        return false;

      if (
        filters.format &&
        !channel.aiEnrichment.contentFormats.some(format =>
          format.toLowerCase().includes(filters.format.toLowerCase())
        )
      )
        return false;

      if (
        filters.difficulty &&
        channel.aiEnrichment.facelessSuitability.implementationDifficulty !== filters.difficulty
      )
        return false;

      if (filters.ageLevel && channel.aiEnrichment.targetAudience.ageLevel !== filters.ageLevel)
        return false;

      if (filters.gender && channel.aiEnrichment.targetAudience.genderTarget !== filters.gender)
        return false;

      if (filters.socialClass && channel.aiEnrichment.targetAudience.socialClass !== filters.socialClass)
        return false;

      if (
        filters.contentComplexity &&
        channel.aiEnrichment.contentCharacteristics.complexity !== filters.contentComplexity
      )
        return false;

      if (filters.visualStyle && channel.aiEnrichment.contentCharacteristics.visualStyle !== filters.visualStyle)
        return false;

      return true;
    });

    setFilteredChannels(filtered);
  }, [filters, channelsData]);

  const safeChannels = filteredChannels.filter(
    channel =>
      channel.aiEnrichment &&
      channel.aiEnrichment.estimatedRPM &&
      channel.aiEnrichment.opportunityAnalysis &&
      channel.aiEnrichment.qualityIndicators &&
      channel.aiEnrichment.facelessSuitability &&
      channel.aiEnrichment.untappedOpportunity
  );

  const presets: Record<string, PresetConfig> = {
    golden: {
      name: 'GOLDEN OPPORTUNITY',
      icon: '💎',
      description: 'CRITICAL: Highest profitability with lowest competition. Enter NOW before saturation.',
      urgency: 'critical',
      color: 'danger',
      filters: ['Opportunity ≥ 9/10', 'Competition ≤ 3/10', 'RPM ≥ $25', 'Underserved', 'Faceless: Easy'],
      apply: update => {
        update('minOpp', 9);
        update('maxComp', 3);
        update('minRPM', 25);
        update('difficulty', 'easy');
      },
    },
    premiumScale: {
      name: 'PREMIUM SCALE-UP',
      icon: '🚀',
      description: 'HIGH: Maximum revenue potential with growth ≥8/10. Requires content excellence.',
      urgency: 'high',
      color: 'warning',
      filters: ['RPM ≥ $25', 'Growth ≥ 8/10', 'Quality ≥ 8/10', 'Consistency ≥ 8/10', 'Avg Views ≥ 50K'],
      apply: update => {
        update('minRPM', 25);
        update('minGrowth', 8);
        update('minQuality', 8);
        update('minConsistency', 8);
        update('minAvgViews', 50000);
      },
    },
    underserved: {
      name: 'UNDERSERVED MARKETS',
      icon: '⚡',
      description: 'HIGH: Market gaps with RPM $15+ and low competition. First-mover advantage.',
      urgency: 'high',
      color: 'warning',
      filters: ['Untapped opportunity', 'RPM ≥ $15', 'Competition ≤ 4/10', 'Subscribers ≤ 200K'],
      apply: update => {
        update('minOpp', 7);
        update('minRPM', 15);
        update('maxComp', 4);
        update('maxSubs', 200000);
      },
    },
    facelessEmpire: {
      name: 'FACELESS EMPIRE',
      icon: '🎭',
      description: 'HIGH: Build scalable faceless channels with easy implementation and RPM $12+.',
      urgency: 'high',
      color: 'warning',
      filters: ['Faceless: Easy', 'RPM ≥ $12', 'Opportunity ≥ 7/10', 'Total Views ≥ 10M'],
      apply: update => {
        update('difficulty', 'easy');
        update('minRPM', 12);
        update('minOpp', 7);
        update('minViews', 10000000);
      },
    },
    beginnerQuickWin: {
      name: 'BEGINNER QUICK WIN',
      icon: '🌱',
      description: 'MODERATE: Lowest competition, easy difficulty, moderate RPM. Perfect for beginners.',
      urgency: 'moderate',
      color: 'success',
      filters: ['Competition ≤ 4/10', 'Difficulty: Easy', 'RPM ≥ $8', 'Opportunity ≥ 6/10'],
      apply: update => {
        update('maxComp', 4);
        update('difficulty', 'easy');
        update('minRPM', 8);
        update('minOpp', 6);
      },
    },
    highCeiling: {
      name: 'HIGH CEILING BETS',
      icon: '🏔️',
      description: 'MODERATE: Maximum upside despite higher difficulty. Opportunity ≥9/10.',
      urgency: 'moderate',
      color: 'success',
      filters: ['Opportunity ≥ 9/10', 'Growth ≥ 8/10', 'RPM ≥ $15', 'Quality ≥ 7/10'],
      apply: update => {
        update('minOpp', 9);
        update('minGrowth', 8);
        update('minRPM', 15);
        update('minQuality', 7);
      },
    },
  };

  const applyPresetFilter = (presetKey: string) => {
    const preset = presets[presetKey];
    if (!preset) return;

    resetFilters();
    preset.apply((key, value) => {
      updateFilter(key as any, value);
    });
    setActivePreset(presetKey);
    setFiltersExpanded(true);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filterBySearch = (channels: Channel[]): Channel[] => {
    const active = searchFilters.filter(f => f.term.trim().length > 0);
    if (active.length === 0) return channels;

    return channels.filter(channel => {
      const properties: Record<string, string[]> = {
        name: [channel.name, channel.handle, channel.description],
        niches: channel.aiEnrichment.nicheKeywords,
        target: [
          channel.aiEnrichment.targetAudience.ageLevel,
          channel.aiEnrichment.targetAudience.genderTarget,
          channel.aiEnrichment.targetAudience.socialClass,
        ],
        format: channel.aiEnrichment.contentFormats,
        keywords: [
          ...channel.aiEnrichment.nicheKeywords,
          ...channel.aiEnrichment.contentFormats,
        ],
      };

      let overall = true;
      let first = true;

      for (const filter of active) {
        const values = properties[filter.property] || [];
        const term = filter.term.toLowerCase();
        const keywords = term
          .split(' ')
          .map(k => k.trim())
          .filter(Boolean);
        if (keywords.length === 0) continue;

        const currentMatch = keywords.every(keyword =>
          values.some(value => value.toLowerCase().includes(keyword))
        );

        if (first) {
          overall = currentMatch;
          first = false;
        } else if (filter.operator === 'AND') {
          overall = overall && currentMatch;
        } else {
          overall = overall || currentMatch;
        }
      }

      return overall;
    });
  };

  const sortChannels = (channels: Channel[]): Channel[] => {
    const sorted = [...channels];

    switch (sortBy) {
      case 'opportunity':
        return sorted.sort(
          (a, b) =>
            b.aiEnrichment.opportunityAnalysis.opportunityScore -
            a.aiEnrichment.opportunityAnalysis.opportunityScore
        );
      case 'rpm':
        return sorted.sort(
          (a, b) => b.aiEnrichment.estimatedRPM.value - a.aiEnrichment.estimatedRPM.value
        );
      case 'views':
        return sorted.sort((a, b) => {
          const aViews = a.videos.reduce((sum, video) => sum + video.viewCount, 0);
          const bViews = b.videos.reduce((sum, video) => sum + video.viewCount, 0);
          return bViews - aViews;
        });
      case 'subs':
        return sorted.sort(
          (a, b) => b.subscriberCountNumeric - a.subscriberCountNumeric
        );
      case 'avgViews':
        return sorted.sort((a, b) => {
          const aAvg =
            a.videos.reduce((sum, video) => sum + video.viewCount, 0) /
            a.videos.length;
          const bAvg =
            b.videos.reduce((sum, video) => sum + video.viewCount, 0) /
            b.videos.length;
          return bAvg - aAvg;
        });
      default:
        return sorted;
    }
  };

  const stats = {
    // Show all AI-enriched channels (data-level), not just those passing current numeric filters
    totalChannels: channelsData.filter(
      channel =>
        channel.aiEnrichment &&
        channel.aiEnrichment.estimatedRPM &&
        channel.aiEnrichment.opportunityAnalysis &&
        channel.aiEnrichment.qualityIndicators &&
        channel.aiEnrichment.facelessSuitability &&
        channel.aiEnrichment.untappedOpportunity
    ).length,
    avgRPM:
      safeChannels.length > 0
        ? Math.round(
            safeChannels.reduce(
              (sum, channel) => sum + channel.aiEnrichment.estimatedRPM.value,
              0
            ) / safeChannels.length
          )
        : 0,
    facelessCount: safeChannels.filter(
      channel => channel.aiEnrichment.facelessSuitability.isSuitable
    ).length,
    highOppCount: safeChannels.filter(
      channel => channel.aiEnrichment.opportunityAnalysis.opportunityScore >= 8
    ).length,
    underservedCount: safeChannels.filter(
      channel => channel.aiEnrichment.untappedOpportunity.isUnderserved
    ).length,
    premiumCount: safeChannels.filter(
      channel => channel.aiEnrichment.estimatedRPM.value >= 20
    ).length,
  };

  const channelsAfterSearchAndSort = sortChannels(filterBySearch(safeChannels));

  const toggleSelectChannel = (channelId: string) => {
    setSelectedChannelIds(prev => {
      const next = new Set(prev);
      if (next.has(channelId)) next.delete(channelId);
      else next.add(channelId);
      return next;
    });
  };

  const isAllSelected =
    channelsAfterSearchAndSort.length > 0 &&
    channelsAfterSearchAndSort.every(c => selectedChannelIds.has(c.channelId));

  const selectAllVisible = () => {
    setSelectedChannelIds(
      new Set(channelsAfterSearchAndSort.map(c => c.channelId))
    );
  };

  const clearSelection = () => {
    setSelectedChannelIds(new Set());
  };

  const getSelectedChannels = (): Channel[] => {
    if (selectedChannelIds.size === 0) return channelsAfterSearchAndSort;
    return channelsAfterSearchAndSort.filter(c => selectedChannelIds.has(c.channelId));
  };

  const buildChannelExportRow = (channel: Channel) => {
    if (linksOnlyMode) {
      return {
        channelId: channel.channelId,
        name: channel.name,
        url: channel.channelUrl,
        nicheKeywords: channel.aiEnrichment.nicheKeywords.join(', '),
      };
    }

    const totalViews = channel.videos.reduce(
      (sum, video) => sum + video.viewCount,
      0
    );
    const avgViews = Math.round(totalViews / channel.videos.length);
    const avgDuration = Math.round(
      channel.videos.reduce((sum, video) => sum + video.duration, 0) /
        channel.videos.length
    );

    return {
      channelId: channel.channelId,
      name: channel.name,
      handle: channel.handle,
      url: channel.channelUrl,
      subscribers: channel.subscriberCountNumeric,
      totalViews,
      avgViews,
      avgDurationSeconds: avgDuration,
      rpm: channel.aiEnrichment.estimatedRPM.value,
      opportunityScore: channel.aiEnrichment.opportunityAnalysis.opportunityScore,
      growthPotential: channel.aiEnrichment.opportunityAnalysis.growthPotential,
      competitionLevel: channel.aiEnrichment.opportunityAnalysis.competitionLevel,
      qualityScore: channel.aiEnrichment.qualityIndicators.productionQuality,
      engagementRate: channel.aiEnrichment.qualityIndicators.engagementRate,
      consistency: channel.aiEnrichment.qualityIndicators.consistency,
      facelessSuitable: channel.aiEnrichment.facelessSuitability.isSuitable,
      facelessDifficulty:
        channel.aiEnrichment.facelessSuitability.implementationDifficulty,
      untappedOpportunity:
        channel.aiEnrichment.untappedOpportunity.isUnderserved,
      nicheKeywords: channel.aiEnrichment.nicheKeywords.join(', '),
      contentFormats: channel.aiEnrichment.contentFormats.join(', '),
      targetAgeLevel: channel.aiEnrichment.targetAudience.ageLevel,
      targetGender: channel.aiEnrichment.targetAudience.genderTarget,
      targetSocialClass: channel.aiEnrichment.targetAudience.socialClass,
      analysedAt: channel.aiEnrichment.analysedAt,
    };
  };

  const exportSelectedAsCSV = () => {
    const rows = getSelectedChannels().map(buildChannelExportRow);
    if (rows.length === 0) return;

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(row =>
        headers
          .map(h => {
            const raw = (row as any)[h];
            if (raw === null || raw === undefined) return '';
            const str = String(raw).replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', linksOnlyMode ? 'channels_links_niches.csv' : 'channels_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportSelectedAsJSON = () => {
    const rows = getSelectedChannels().map(buildChannelExportRow);
    const json = JSON.stringify(rows, null, 2);
    const blob = new Blob([json], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', linksOnlyMode ? 'channels_links_niches.json' : 'channels_export.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copySelectedToClipboard = async () => {
    const rows = getSelectedChannels().map(buildChannelExportRow);

    if (linksOnlyMode) {
      const lines = rows.map((row: any) => {
        const niches = row.nicheKeywords || '';
        return `${row.name} | ${row.url} | ${niches}`;
      });
      const text = lines.join('\n');
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.error('Failed to copy channel links & niches to clipboard', err);
      }
      return;
    }

    const text = JSON.stringify(rows, null, 2);
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy channel data to clipboard', err);
    }
  };

  // Search filter handlers
  const addSearchFilter = () => {
    setSearchFilters(prev => {
      const last = prev[prev.length - 1];
      const newId = `sf-${prev.length + 1}`;
      return [
        ...prev,
        {
          id: newId,
          term: '',
          property: last?.property ?? 'name',
          operator: last?.operator ?? 'AND',
        },
      ];
    });
  };

  const updateSearchFilter = (id: string, patch: Partial<SearchFilterItem>) => {
    setSearchFilters(prev =>
      prev.map(f => (f.id === id ? { ...f, ...patch } : f))
    );
  };

  const removeSearchFilter = (id: string) => {
    setSearchFilters(prev =>
      prev.length <= 1 ? prev : prev.filter(f => f.id !== id)
    );
  };

  const resetSearchFilters = () => {
    setSearchFilters([
      {
        id: 'sf-1',
        term: '',
        property: 'name',
        operator: 'AND',
      },
    ]);
  };

  const activeFiltersSummary = () => {
    const summaryParts: string[] = [];

    if (filters.minSubs > 0 || filters.maxSubs < 50000000) {
      summaryParts.push(
        `Subs ${formatNumber(filters.minSubs)}-${formatNumber(filters.maxSubs)}`
      );
    }
    if (filters.minRPM > 0 || filters.maxRPM < 35) {
      summaryParts.push(`RPM $${filters.minRPM}-$${filters.maxRPM}`);
    }
    if (filters.minOpp > 0 || filters.maxOpp < 10) {
      summaryParts.push(`Opp ${filters.minOpp}-${filters.maxOpp}`);
    }
    
    if (filters.niche) summaryParts.push(`Niche: ${filters.niche}`);

    const activeSearch = searchFilters.filter(f => f.term.trim().length > 0);
    if (activeSearch.length > 0) {
      summaryParts.push(
        `Search: ${activeSearch.length} active`
      );
    }

    if (activePreset) {
      summaryParts.push(`Preset: ${presets[activePreset]?.name}`);
    }

    if (summaryParts.length === 0) {
      return 'No filters active';
    }

    return summaryParts.join(' • ');
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading channel data...</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Fetching analysis from public data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🎯 YouTube Channel Analyzer</h1>
        <p>{channelsData.length} Channels • 37 Filters • Complete Metrics</p>
      </div>

      <div className="note">
        <strong>ℹ️ Note:</strong> This dashboard shows aggregate channel metrics. Individual video
        data is not available in the dataset. To see specific videos, click "Visit Channel on
        YouTube" for any channel.
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Total Channels</div>
          <div className="stat-value">{stats.totalChannels}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average RPM</div>
          <div className="stat-value">${stats.avgRPM}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Faceless</div>
          <div className="stat-value">{stats.facelessCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">High Opp</div>
          <div className="stat-value">{stats.highOppCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Underserved</div>
          <div className="stat-value">{stats.underservedCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Premium RPM</div>
          <div className="stat-value">{stats.premiumCount}</div>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="filter-toggle-header">
        <button
          className={`filter-toggle-btn ${filtersExpanded ? 'expanded' : ''}`}
          onClick={() => setFiltersExpanded(!filtersExpanded)}
        >
          <span className="toggle-icon">{filtersExpanded ? '🔽' : '🔼'}</span>
          <span>{filtersExpanded ? 'Hide Filters' : 'Show Filters'}</span>
          <span className="active-filters-badge">
            {activeFiltersSummary()}
          </span>
        </button>
      </div>

      {filtersExpanded && (
        <div className="filters">
          
          {/* 1. Size & Performance */}
          <FilterSection
            title="Channel Size & Performance"
            icon="📊"
            expanded={expandedSections.size}
            onToggle={() => toggleSection('size')}
            columns={3}
          >
            <RangeFilter
              label="Subscribers"
              icon="👥"
              min={0}
              max={1000000000}
              step={10000}
              value={[filters.minSubs, filters.maxSubs]}
              onChange={(min, max) => {
                updateFilter('minSubs', min);
                updateFilter('maxSubs', max);
              }}
              formatValue={formatNumber}
              presets={[
                { label: '+100K', value: 100000 },
                { label: '+1M', value: 1000000 },
                { label: '+10M', value: 10000000 },
              ]}
            />
            <RangeFilter
              label="Total Views"
              icon="👁️"
              min={0}
              max={100000000000}
              step={1000000}
              value={[filters.minViews, filters.maxViews]}
              onChange={(min, max) => {
                updateFilter('minViews', min);
                updateFilter('maxViews', max);
              }}
              formatValue={formatNumber}
              presets={[
                { label: '+10M', value: 10000000 },
                { label: '+100M', value: 100000000 },
                { label: '+1B', value: 1000000000 },
              ]}
            />
            <RangeFilter
              label="Avg Views"
              icon="📈"
              min={0}
              max={1000000000}
              step={100000}
              value={[filters.minAvgViews, filters.maxAvgViews]}
              onChange={(min, max) => {
                updateFilter('minAvgViews', min);
                updateFilter('maxAvgViews', max);
              }}
              formatValue={formatNumber}
              presets={[
                { label: '+50K', value: 50000 },
                { label: '+100K', value: 100000 },
                { label: '+1M', value: 1000000 },
              ]}
            />
            <RangeFilter
              label="Videos"
              icon="🎬"
              min={0}
              max={10000}
              step={1}
              value={[filters.minVideos, filters.maxVideos]}
              onChange={(min, max) => {
                updateFilter('minVideos', min);
                updateFilter('maxVideos', max);
              }}
            />
            <RangeFilter
              label="Avg Duration"
              icon="⏱️"
              min={0}
              max={36000}
              step={60}
              value={[filters.minDuration, filters.maxDuration]}
              onChange={(min, max) => {
                updateFilter('minDuration', min);
                updateFilter('maxDuration', max);
              }}
              formatValue={value => `${Math.round(value / 60)}min`}
            />
            <RangeFilter
              label="Max Views"
              icon="🔥"
              min={0}
              max={1000000000}
              step={100000}
              value={[filters.minMaxViews, filters.maxMaxViews]}
              onChange={(min, max) => {
                updateFilter('minMaxViews', min);
                updateFilter('maxMaxViews', max);
              }}
              formatValue={formatNumber}
            />
          </FilterSection>

          {/* 2. Opportunity & Quality */}
          <FilterSection
            title="Opportunity & Quality"
            icon="💎"
            expanded={expandedSections.opportunity}
            onToggle={() => toggleSection('opportunity')}
            columns={3}
          >
            <RangeFilter
              label="RPM"
              icon="💰"
              min={0}
              max={100}
              step={1}
              value={[filters.minRPM, filters.maxRPM]}
              onChange={(min, max) => {
                updateFilter('minRPM', min);
                updateFilter('maxRPM', max);
              }}
              formatValue={value => `$${value}`}
              presets={[
                { label: '$10+', value: 10 },
                { label: '$20+', value: 20 },
                { label: '$50+', value: 50 },
              ]}
              colorScheme="success"
            />
            <RangeFilter
              label="Opportunity"
              icon="🚀"
              min={0}
              max={10}
              step={1}
              value={[filters.minOpp, filters.maxOpp]}
              onChange={(min, max) => {
                updateFilter('minOpp', min);
                updateFilter('maxOpp', max);
              }}
              formatValue={value => value.toString()}
              colorScheme="warning"
            />
            <RangeFilter
              label="Growth"
              icon="📈"
              min={0}
              max={10}
              step={1}
              value={[filters.minGrowth, filters.maxGrowth]}
              onChange={(min, max) => {
                updateFilter('minGrowth', min);
                updateFilter('maxGrowth', max);
              }}
              formatValue={value => value.toString()}
              colorScheme="success"
            />
            <RangeFilter
              label="Competition"
              icon="⚔️"
              min={0}
              max={10}
              step={1}
              value={[filters.minComp, filters.maxComp]}
              onChange={(min, max) => {
                updateFilter('minComp', min);
                updateFilter('maxComp', max);
              }}
              formatValue={value => value.toString()}
              colorScheme="danger"
            />
            <RangeFilter
              label="Quality"
              icon="🎨"
              min={0}
              max={10}
              step={1}
              value={[filters.minQuality, filters.maxQuality]}
              onChange={(min, max) => {
                updateFilter('minQuality', min);
                updateFilter('maxQuality', max);
              }}
              formatValue={value => value.toString()}
            />
            <RangeFilter
              label="Engagement"
              icon="💬"
              min={0}
              max={10}
              step={1}
              value={[filters.minEngagement, filters.maxEngagement]}
              onChange={(min, max) => {
                updateFilter('minEngagement', min);
                updateFilter('maxEngagement', max);
              }}
              formatValue={value => value.toString()}
            />
          </FilterSection>

          {/* 3. Content & Category */}
          <FilterSection
            title="Content & Category"
            icon="🎨"
            expanded={expandedSections.content}
            onToggle={() => toggleSection('content')}
            columns={3}
          >
            <SelectFilter
              label="Niche"
              icon="🎨"
              options={[
                'physics', 'cosmology', 'space', 'science education', 'quantum mechanics',
                'black holes', 'theoretical physics', 'gaming', 'warhammer 40k', 'elden ring',
                'witcher', 'sekiro', 'animation', 'visual explanations', 'educational',
                'scientific', 'storytelling', 'documentary', 'entertainment', 'tech',
              ]}
              value={filters.niche}
              onChange={value => updateFilter('niche', value)}
            />
            <SelectFilter
              label="Format"
              icon="📹"
              options={[
                'visual explanations', 'complex animations', 'scientific storytelling',
                'educational deep dives', 'animation', 'gaming', 'documentary', 'tutorial',
              ]}
              value={filters.format}
              onChange={value => updateFilter('format', value)}
            />
            <SelectFilter
              label="Difficulty"
              icon="⚡"
              options={['easy', 'medium', 'hard']}
              value={filters.difficulty}
              onChange={value => updateFilter('difficulty', value)}
            />
            <SelectFilter
              label="Age Level"
              icon="🎯"
              options={['children', 'teens', 'young_adults', 'adults', 'seniors']}
              value={filters.ageLevel}
              onChange={value => updateFilter('ageLevel', value)}
            />
            <SelectFilter
              label="Gender"
              icon="👥"
              options={['male', 'female', 'mixed']}
              value={filters.gender}
              onChange={value => updateFilter('gender', value)}
            />
            <SelectFilter
              label="Social Class"
              icon="🏢"
              options={['lower', 'middle', 'middle_upper', 'upper']}
              value={filters.socialClass}
              onChange={value => updateFilter('socialClass', value)}
            />
            <SelectFilter
              label="Complexity"
              icon="📚"
              options={['simple', 'moderate', 'complex']}
              value={filters.contentComplexity}
              onChange={value => updateFilter('contentComplexity', value)}
            />
            <SelectFilter
              label="Visual Style"
              icon="🎨"
              options={['animated', 'live_action', 'mixed', 'text_based']}
              value={filters.visualStyle}
              onChange={value => updateFilter('visualStyle', value)}
            />
          </FilterSection>

          {/* 4. Date & Location */}
          <FilterSection
            title="Date & Location"
            icon="📅"
            expanded={expandedSections.date}
            onToggle={() => toggleSection('date')}
            columns={2}
          >
            <DateFilter
              label="First Video Date"
              icon="📅"
              value={filters.firstVideoDate}
              onChange={value => updateFilter('firstVideoDate', value)}
            />
            <DateFilter
              label="Last Video Date"
              icon="📅"
              value={filters.lastVideoDate}
              onChange={value => updateFilter('lastVideoDate', value)}
            />
          </FilterSection>
        </div>
      )}

      {/* Search & Sort Area - Grid layout for larger screens */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px', 
        marginBottom: '20px' 
      }}>
        {/* Sort */}
        <div className="filter-group">
          <div className="filter-group-header">
             <span className="filter-group-icon">🔃</span>
             <h4>Sort Channels</h4>
          </div>
          <div className="filter-group-content">
             <select
               style={{ 
                 width: '100%', 
                 padding: '10px', 
                 borderRadius: '10px', 
                 border: '1px solid var(--color-border)',
                 background: 'var(--color-bg-input)',
                 color: 'var(--color-text-primary)'
               }}
               value={sortBy}
               onChange={e => setSortBy(e.target.value)}
             >
               <option value="opportunity">🚀 Opportunity Score (High to Low)</option>
               <option value="rpm">💰 Estimated RPM (High to Low)</option>
               <option value="views">👁️ Total Views (High to Low)</option>
               <option value="subs">👥 Subscribers (High to Low)</option>
               <option value="avgViews">📈 Average Views (High to Low)</option>
             </select>
          </div>
        </div>

        {/* Advanced Search */}
        <SearchFilter 
          filters={searchFilters}
          onAdd={addSearchFilter}
          onRemove={removeSearchFilter}
          onUpdate={updateSearchFilter as any}
          onReset={resetSearchFilters}
          properties={[
            { value: 'name', label: 'Channel Name' },
            { value: 'niches', label: 'Niches' },
            { value: 'target', label: 'Target Audience' },
            { value: 'format', label: 'Content Format' },
            { value: 'keywords', label: 'All Keywords' },
          ]}
        />
      </div>

      {/* Quick Presets */}
      <div style={{ marginBottom: '20px' }}>
         <div style={{ 
           display: 'flex', 
           flexWrap: 'wrap', 
           gap: '10px', 
           alignItems: 'center',
           marginBottom: '10px' 
         }}>
           <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
             ⚡ Quick Strategies:
           </span>
           <button 
             className="btn btn-sm btn-secondary"
             onClick={() => { resetFilters(); setActivePreset(null); }}
             style={{ marginLeft: 'auto' }}
           >
             Reset All
           </button>
         </div>
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
           {Object.entries(presets).map(([key, preset]) => (
             <QuickFilterChip
               key={key}
               label={preset.name}
               icon={preset.icon}
               active={activePreset === key}
               onClick={() => applyPresetFilter(key)}
               color={preset.color}
             />
           ))}
         </div>
      </div>

      {/* Selection & Export Bar */}
      <div className="selection-bar">
        <div>
          <button
            type="button"
            className="btn btn-sm"
            onClick={isAllSelected ? clearSelection : selectAllVisible}
          >
            {isAllSelected ? '⬜ Deselect All' : '✅ Select All Visible'}
          </button>
          <span className="selection-count">
            {selectedChannelIds.size} selected
          </span>
        </div>
        <div className="selection-actions">
          <label className="links-only-toggle">
            <input
              type="checkbox"
              checked={linksOnlyMode}
              onChange={e => setLinksOnlyMode(e.target.checked)}
            />
            <span>Links & Niches only</span>
          </label>
          <button
            type="button"
            className="btn btn-sm"
            onClick={exportSelectedAsCSV}
          >
            ⬇️ CSV
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={exportSelectedAsJSON}
          >
            ⬇️ JSON
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={copySelectedToClipboard}
          >
            📋 Copy
          </button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="results">
        <div className="results-header">
          <div className="results-count">
            {channelsAfterSearchAndSort.length}{' '}
            {channelsAfterSearchAndSort.length === 1 ? 'Channel' : 'Channels'} Found
          </div>
        </div>
        <div className="channels">
          {channelsAfterSearchAndSort.map((channel, index) => (
            <ChannelCard
              key={index}
              channel={channel}
              selectable
              selected={selectedChannelIds.has(channel.channelId)}
              onToggleSelect={() => toggleSelectChannel(channel.channelId)}
            />
          ))}
        </div>
        {channelsAfterSearchAndSort.length === 0 && (
          <div
            style={{ textAlign: 'center', padding: '40px', color: '#666' }}
          >
            No channels match the selected filters. Try adjusting your search
            criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelAnalyzer;
