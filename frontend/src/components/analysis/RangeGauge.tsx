"use client";
import React from "react";

interface RangeGaugeProps {
  value: number;
  range: [number, number];
  status: "Low" | "High" | "Normal";
  size?: number;
}

export default function RangeGauge({
  value,
  range,
  status,
  size = 64,
}: RangeGaugeProps) {
  const [minRef, maxRef] = range;
  const refSpan = maxRef - minRef || 1;
  const margin = refSpan * 0.15;
  const domainMin = minRef - margin;
  const domainMax = maxRef + margin;
  const domainSpan = domainMax - domainMin || 1;

  // Map value to 0..1 scale across domain
  const clampedVal = Math.max(domainMin, Math.min(domainMax, value));
  const normalizedVal = (clampedVal - domainMin) / domainSpan;

  // Angle in degrees: 0° is far left (Low), 180° is far right (High)
  const angleDeg = normalizedVal * 180;
  const angleRad = (Math.PI * (180 - angleDeg)) / 180;

  // Gauge dimensions
  const viewBoxWidth = 100;
  const viewBoxHeight = 55;
  const cx = 50;
  const cy = 48;
  const r = 38;
  const strokeWidth = 8;

  // Arc path generator helper: startAngle and endAngle in degrees (180 to 0)
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const rad = ((180 - angleInDegrees) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY - radius * Math.sin(rad),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  // Color mappings
  const STATUS_COLOR = {
    Low: "#2563EB",     // Blue
    Normal: "#137333",  // Green
    High: "#C5221F",    // Red
  };

  // Segment angles based on reference range boundaries
  const lowAngleEnd = ((minRef - domainMin) / domainSpan) * 180;
  const highAngleStart = ((maxRef - domainMin) / domainSpan) * 180;

  // Needle tip coordinates
  const needleLength = r - 6;
  const needleTipX = cx + needleLength * Math.cos(angleRad);
  const needleTipY = cy - needleLength * Math.sin(angleRad);

  return (
    <div
      className="inline-flex flex-col items-center justify-center select-none"
      style={{ width: `${size * 1.6}px`, height: `${size}px` }}
      title={`Value: ${value} (Ref: ${minRef} - ${maxRef})`}
    >
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-full overflow-visible"
      >
        {/* Background track */}
        <path
          d={describeArc(cx, cy, r, 0, 180)}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Low segment (out-of-range left) */}
        <path
          d={describeArc(cx, cy, r, 0, lowAngleEnd)}
          fill="none"
          stroke="#93C5FD"
          strokeWidth={strokeWidth}
        />

        {/* Normal segment (in-range center) */}
        <path
          d={describeArc(cx, cy, r, lowAngleEnd, highAngleStart)}
          fill="none"
          stroke="#86EFAC"
          strokeWidth={strokeWidth}
        />

        {/* High segment (out-of-range right) */}
        <path
          d={describeArc(cx, cy, r, highAngleStart, 180)}
          fill="none"
          stroke="#FCA5A5"
          strokeWidth={strokeWidth}
        />

        {/* Needle Line */}
        <line
          x1={cx}
          y1={cy}
          x2={needleTipX}
          y2={needleTipY}
          stroke={STATUS_COLOR[status] || "#475569"}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Pivot Center Dot */}
        <circle cx={cx} cy={cy} r="4.5" fill={STATUS_COLOR[status] || "#475569"} />
        <circle cx={cx} cy={cy} r="2" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
