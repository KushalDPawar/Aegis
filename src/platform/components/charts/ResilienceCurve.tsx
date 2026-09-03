import React, { useState } from 'react';
import { HISTORICAL_HEALTH_DATA, calculateFutureProjections } from '../../data/mockHealthTimeline';
import { useIntelligence } from '../../context/IntelligenceContext';
import { TimelineDataPoint } from '../../types';

export const ResilienceCurve: React.FC = () => {
  const { scenarioSliders } = useIntelligence();
  const [hoveredPoint, setHoveredPoint] = useState<TimelineDataPoint | null>(null);

  // Combine historical and dynamically projected points
  const projectedData = calculateFutureProjections(scenarioSliders);
  const allPoints: TimelineDataPoint[] = [...HISTORICAL_HEALTH_DATA, ...projectedData];

  // Chart Dimensions
  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingY = 30;

  const minScore = 0;
  const maxScore = 100;

  const getX = (index: number) => {
    return paddingX + (index / (allPoints.length - 1)) * (width - paddingX * 2);
  };

  const getY = (score: number) => {
    return height - paddingY - ((score - minScore) / (maxScore - minScore)) * (height - paddingY * 2);
  };

  // Build SVG path
  const historicalLen = HISTORICAL_HEALTH_DATA.length;
  
  const historicalPoints = allPoints.slice(0, historicalLen);
  const projectedPoints = allPoints.slice(historicalLen - 1); // overlap 1 point for continuous line

  const buildPath = (pts: TimelineDataPoint[], offset: number) => {
    return pts.reduce((acc, curr, idx) => {
      const globalIdx = idx + offset;
      const x = getX(globalIdx);
      const y = getY(curr.resilienceScore);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  };

  const historicalPath = buildPath(historicalPoints, 0);
  const projectedPath = buildPath(projectedPoints, historicalLen - 1);

  // Shaded area for historical
  const historicalArea = `${historicalPath} L ${getX(historicalLen - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;

  // Shaded confidence corridor for projection
  const projectedConfidenceUpper = projectedPoints.map((pt, idx) => {
    const globalIdx = idx + historicalLen - 1;
    const x = getX(globalIdx);
    const y = getY(Math.min(100, pt.resilienceScore + (pt.projected ? idx * 3.5 : 0)));
    return `${x},${y}`;
  }).join(' ');

  const projectedConfidenceLower = [...projectedPoints].reverse().map((pt, idx) => {
    const origIdx = projectedPoints.length - 1 - idx;
    const globalIdx = origIdx + historicalLen - 1;
    const x = getX(globalIdx);
    const y = getY(Math.max(10, pt.resilienceScore - (pt.projected ? origIdx * 4.2 : 0)));
    return `${x},${y}`;
  }).join(' ');

  // Critical threshold Y coordinate (Score = 50)
  const criticalThresholdY = getY(50);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Legend & Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-accent-cyan" />
            <span className="text-ink-muted">Historical Resilience</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-accent-amber" />
            <span className="text-accent-amber">Simulated Trajectory (What-If)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t border-rose-500/50" />
            <span className="text-rose-500/80">Distress Threshold (&lt;50)</span>
          </div>
        </div>

        {hoveredPoint && (
          <div className="flex items-center gap-3 font-mono text-xs bg-paper-elevated px-2.5 py-1 rounded border border-hairline">
            <span className="font-semibold text-ink">{hoveredPoint.month}</span>
            <span className="text-ink-dim">|</span>
            <span className="text-accent-cyan">Resilience: {hoveredPoint.resilienceScore}/100</span>
            <span className="text-ink-dim">|</span>
            <span className="text-ink-muted">Buffer: ₹{hoveredPoint.savingsBuffer.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      {/* SVG Container */}
      <div className="w-full aspect-[800/260] max-h-[300px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="historicalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00d2ff" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[25, 50, 75, 100].map((score) => {
            const y = getY(score);
            return (
              <g key={score}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={score === 50 ? 0.35 : 0.08}
                  strokeDasharray={score === 50 ? '4 4' : '2 2'}
                  className={score === 50 ? 'text-rose-500' : 'text-ink-dim'}
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-ink-dim font-mono text-[9px]"
                >
                  {score}
                </text>
              </g>
            );
          })}

          {/* Vertical Divider: Historical vs Projected */}
          <line
            x1={getX(historicalLen - 1)}
            y1={paddingY}
            x2={getX(historicalLen - 1)}
            y2={height - paddingY}
            stroke="currentColor"
            strokeOpacity={0.25}
            strokeDasharray="3 3"
            className="text-ink-muted"
          />
          <text
            x={getX(historicalLen - 1) + 6}
            y={paddingY + 12}
            className="fill-accent-amber font-mono text-[9px] font-semibold uppercase tracking-wider"
          >
            ← HISTORICAL | AI FORWARD SIMULATION →
          </text>

          {/* Shaded Areas */}
          <path d={historicalArea} fill="url(#historicalGrad)" />

          {/* Confidence Corridor for Projected */}
          <polygon
            points={`${projectedConfidenceUpper} ${projectedConfidenceLower}`}
            fill="url(#projectedGrad)"
          />

          {/* Historical Solid Line */}
          <path
            d={historicalPath}
            fill="none"
            stroke="#00d2ff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Projected Dashed Line */}
          <path
            d={projectedPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="5 5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {allPoints.map((pt, idx) => {
            const x = getX(idx);
            const y = getY(pt.resilienceScore);
            const isProjected = pt.projected;
            const isHovered = hoveredPoint?.month === pt.month;

            return (
              <g
                key={pt.month}
                className="cursor-pointer transition-transform duration-150"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : isProjected ? 3.5 : 4}
                  fill={isProjected ? '#f59e0b' : '#00d2ff'}
                  stroke="var(--paper-surface)"
                  strokeWidth="2"
                  className="transition-all"
                />
                {/* Month label along bottom */}
                {idx % 2 === 0 && (
                  <text
                    x={x}
                    y={height - paddingY + 16}
                    textAnchor="middle"
                    className={`font-mono text-[9px] ${isProjected ? 'fill-accent-amber' : 'fill-ink-dim'}`}
                  >
                    {pt.month}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
