import React, { useState } from 'react';
import type { Channel } from '../types';

interface ChannelCardProps {
  channel: Channel;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, selectable = false, selected = false, onToggleSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const calculateStats = () => {
    const totalViews = channel.videos.reduce((sum, video) => sum + video.viewCount, 0);
    const avgViews = Math.round(totalViews / channel.videos.length);
    const avgDuration = Math.round(channel.videos.reduce((sum, video) => sum + video.duration, 0) / channel.videos.length);
    const maxViews = Math.max(...channel.videos.map(video => video.viewCount));

    return { totalViews, avgViews, avgDuration, maxViews };
  };

  const { totalViews, avgViews, avgDuration } = calculateStats();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getBadges = () => {
    const badges = [];
    if (channel.aiEnrichment.facelessSuitability.isSuitable) {
      badges.push('Faceless');
    }
    if (channel.aiEnrichment.untappedOpportunity.isUnderserved) {
      badges.push('Underserved');
    }
    if (channel.aiEnrichment.opportunityAnalysis.opportunityScore >= 8) {
      badges.push('High Opp');
    }
    if (channel.aiEnrichment.estimatedRPM.value >= 20) {
      badges.push('Premium');
    }
    return badges;
  };

  const targetAudience = channel.aiEnrichment.targetAudience;

  return (
    <div className={`channel-card ${selected ? 'channel-card-selected' : ''}`}>
      <div className="channel-summary">
        <div className="channel-header-row">
          {selectable && (
            <div className="channel-select-wrapper">
              <input
                type="checkbox"
                checked={selected}
                onChange={onToggleSelect}
                className="channel-select-checkbox"
              />
            </div>
          )}
          <div className="channel-avatar-wrapper">
            <img
              src={channel.profilePicture}
              alt={channel.name}
              className="channel-avatar"
            />
          </div>
          <div className="channel-title-block">
            <div className="channel-name">
              <a 
                href={channel.channelUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="channel-link"
              >
                {channel.name}
              </a>
            </div>
            <div className="channel-handle">{channel.handle}</div>
            <div className="channel-meta">
              <span className="meta-item">👥 {formatNumber(channel.subscriberCountNumeric)}</span>
              <span className="meta-item">
                🎯 {targetAudience.ageLevel} • {targetAudience.genderTarget}
              </span>
              <span className="meta-item">🚀 {channel.aiEnrichment.opportunityAnalysis.opportunityScore}/10</span>
            </div>
          </div>
        </div>
        
        <div className="badges">
          {getBadges().map((badge) => (
            <span 
              key={badge} 
              className={`badge badge-${badge.toLowerCase().replace(' ', '')}`}
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Niche tags - prominently displayed */}
        <div className="niche-tags">
          {channel.aiEnrichment.nicheKeywords.map((niche) => (
            <span key={niche} className="niche-tag">
              {niche}
            </span>
          ))}
        </div>

        {/* Always-visible high-level summary */}
        <div className="channel-summary-topline">
          <div className="summary-item">
            <span className="summary-label">📌 Summary</span>
            <span className="summary-value">
              {channel.aiEnrichment.formatsDescription}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">💰 RPM</span>
            <span className="summary-value">
              <strong>${channel.aiEnrichment.estimatedRPM.value}</strong> · {channel.aiEnrichment.estimatedRPM.rationale}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">📈 Performance</span>
            <span className="summary-value">
              {formatNumber(avgViews)} avg views • {formatDuration(avgDuration)} avg duration
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">🎯 Target</span>
            <span className="summary-value">
              {targetAudience.ageLevel} • {targetAudience.genderTarget} • {targetAudience.socialClass}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">🎨 Content</span>
            <span className="summary-value">
              {channel.aiEnrichment.contentCharacteristics.visualStyle} • {channel.aiEnrichment.contentCharacteristics.complexity}
            </span>
          </div>
        </div>

        <div className="metrics">
          <div className="metric">
            <span className="metric-label">Total Views</span>
            <span className="metric-value">{formatNumber(totalViews)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Videos</span>
            <span className="metric-value">{channel.videos.length}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Engagement</span>
            <span className="metric-value">{channel.aiEnrichment.qualityIndicators.engagementRate}/10</span>
          </div>
          <div className="metric">
            <span className="metric-label">Quality</span>
            <span className="metric-value">{channel.aiEnrichment.qualityIndicators.productionQuality}/10</span>
          </div>
        </div>

        <button 
          className="expand-btn" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide Details' : 'View Details'}
        </button>
      </div>

      {isExpanded && (
        <div className="channel-details show">
          <div className="detail-section">
            <h3>📊 Performance Metrics</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Opportunity Score</span>
                <span className="detail-value">{channel.aiEnrichment.opportunityAnalysis.opportunityScore}/10</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Growth Potential</span>
                <span className="detail-value">{channel.aiEnrichment.opportunityAnalysis.growthPotential}/10</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Competition</span>
                <span className="detail-value">{channel.aiEnrichment.opportunityAnalysis.competitionLevel}/10</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Production Quality</span>
                <span className="detail-value">{channel.aiEnrichment.qualityIndicators.productionQuality}/10</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Consistency</span>
                <span className="detail-value">{channel.aiEnrichment.qualityIndicators.consistency}/10</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Engagement</span>
                <span className="detail-value">{channel.aiEnrichment.qualityIndicators.engagementRate}/10</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>🎯 Target Audience</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Age Level</span>
                <span className="detail-value">{targetAudience.ageLevel}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Gender</span>
                <span className="detail-value">{targetAudience.genderTarget}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Social Class</span>
                <span className="detail-value">{targetAudience.socialClass}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Interests</span>
                <span className="detail-value">{Array.isArray(targetAudience.interests) ? targetAudience.interests.join(', ') : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>🎨 Content Characteristics</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Content Complexity</span>
                <span className="detail-value">{channel.aiEnrichment.contentCharacteristics.complexity}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Visual Style</span>
                <span className="detail-value">{channel.aiEnrichment.contentCharacteristics.visualStyle}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Video Duration</span>
                <span className="detail-value">{channel.aiEnrichment.contentCharacteristics.videoDuration}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Faceless Difficulty</span>
                <span className="detail-value">{channel.aiEnrichment.facelessSuitability.implementationDifficulty}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>📝 Channel Description</h3>
            <div className="description-box">
              {channel.description}
            </div>
          </div>

          {/* New AI Strategic Sections */}
          {channel.aiEnrichment.untappedOpportunity && (
            <div className="detail-section">
              <h3>💡 Untapped Opportunity</h3>
              <div className="detail-grid">
                <div className="detail-item full-width">
                  <span className="detail-label">Why Underserved?</span>
                  <span className="detail-value">{channel.aiEnrichment.untappedOpportunity.whyUnderserved}</span>
                </div>
                {channel.aiEnrichment.untappedOpportunity.recommendedPivot && (
                  <div className="detail-item full-width">
                    <span className="detail-label">Recommended Pivot</span>
                    <span className="detail-value">{channel.aiEnrichment.untappedOpportunity.recommendedPivot}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {channel.aiEnrichment.keySuccessFactors && (
            <div className="detail-section">
              <h3>🔑 Key Success Factors</h3>
              <div className="detail-grid">
                <div className="detail-item full-width">
                  <span className="detail-label">Thumbnail Strategy</span>
                  <span className="detail-value">{channel.aiEnrichment.keySuccessFactors.thumbnailStyle}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Hook Structure</span>
                  <span className="detail-value">{channel.aiEnrichment.keySuccessFactors.hookStructure}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Primary Traffic Source</span>
                  <span className="detail-value">{channel.aiEnrichment.keySuccessFactors.trafficSource}</span>
                </div>
              </div>
            </div>
          )}

          {channel.aiEnrichment.monetization && (
            <div className="detail-section">
              <h3>💸 Monetization Strategy</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Primary Source</span>
                  <span className="detail-value">{channel.aiEnrichment.monetization.primary}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Affiliate Ideas</span>
                  <ul className="detail-list">
                    {channel.aiEnrichment.monetization.potentialAffiliates?.map((idea, i) => (
                      <li key={i}>{idea}</li>
                    ))}
                  </ul>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Digital Product Ideas</span>
                  <ul className="detail-list">
                    {channel.aiEnrichment.monetization.digitalProductIdeas?.map((idea, i) => (
                      <li key={i}>{idea}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {channel.aiEnrichment.spinOffIdeas && channel.aiEnrichment.spinOffIdeas.length > 0 && (
            <div className="detail-section">
              <h3>🚀 Spin-Off Channel Ideas</h3>
              <div className="spinoff-grid">
                {channel.aiEnrichment.spinOffIdeas.map((idea, i) => (
                  <div key={i} className="spinoff-card">
                    <h4>{idea.conceptName}</h4>
                    <p className="spinoff-angle"><strong>Angle:</strong> {idea.angle}</p>
                    <p className="spinoff-target"><strong>Target:</strong> {idea.targetAudience}</p>
                    <div className="spinoff-videos">
                      <strong>Video Ideas:</strong>
                      <ul>
                        {idea.videoIdeas?.map((vid, j) => (
                          <li key={j}>{vid}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>🎥 Recent Videos</h3>
            <div className="videos-grid">
              {channel.videos.slice(0, 4).map((video) => (
                <div key={video.id} className="video-card">
                  <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                  <div className="video-info">
                    <div className="video-title">{video.title}</div>
                    <div className="video-stats">
                      {formatNumber(video.viewCount)} views • {video.uploadDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="action-btn btn-visit" 
              onClick={() => window.open(channel.channelUrl, '_blank')}
            >
              Visit Channel on YouTube
            </button>
            <button 
              className="action-btn btn-collapse" 
              onClick={() => setIsExpanded(false)}
            >
              Collapse
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelCard;
