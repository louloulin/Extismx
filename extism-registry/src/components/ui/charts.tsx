import React from 'react';

// 简单的图表容器组件
export const ChartContainer: React.FC<{
  children?: React.ReactNode;
  className?: string;
  height?: number | string;
}> = ({ children, className = '', height = '300px' }) => {
  return (
    <div 
      className={`w-full border rounded-md p-4 ${className}`} 
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {children}
    </div>
  );
};

// 简单的折线图组件
export const LineChart: React.FC<{
  data: Array<{ x: string | number; y: number }>;
  xLabel?: string;
  yLabel?: string;
  className?: string;
}> = ({ data, xLabel = '', yLabel = '', className = '' }) => {
  // 这个是简化版的展示组件
  // 实际项目中可能会使用 recharts, chart.js 等库
  
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${className}`}>
      <div className="text-muted-foreground mb-4">
        折线图示例 - 实际项目中需要集成图表库
      </div>
      <div className="text-xs text-muted-foreground">
        包含 {data.length} 个数据点
      </div>
      {xLabel && <div className="mt-2 text-xs">X轴: {xLabel}</div>}
      {yLabel && <div className="text-xs">Y轴: {yLabel}</div>}
    </div>
  );
};

// 简单的柱状图组件
export const BarChart: React.FC<{
  data: Array<{ x: string | number; y: number }>;
  xLabel?: string;
  yLabel?: string;
  className?: string;
}> = ({ data, xLabel = '', yLabel = '', className = '' }) => {
  // 这个是简化版的展示组件
  
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${className}`}>
      <div className="text-muted-foreground mb-4">
        柱状图示例 - 实际项目中需要集成图表库
      </div>
      <div className="text-xs text-muted-foreground">
        包含 {data.length} 个数据点
      </div>
      {xLabel && <div className="mt-2 text-xs">X轴: {xLabel}</div>}
      {yLabel && <div className="text-xs">Y轴: {yLabel}</div>}
    </div>
  );
}; 