import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from 'recharts';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from '../hooks/use-window-size';

export interface VolumeDistributionData {
    impliedApy: number; // percentage
    volume: number; // USD value
}

interface VolumeDistributionChartProps {
    data: VolumeDistributionData[];
}

export function VolumeDistributionChart({ data }: VolumeDistributionChartProps) {
    const { t } = useTranslation();
    const { width } = useWindowSize();
    const isMobile = width < 640;
    const chartHeight = isMobile ? Math.min(300, Math.max(200, width * 0.6)) : 300;

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                {t('chart.noDataAvailable')}
            </div>
        );
    }

    return (
        <div className="w-full bg-card card-elevated rounded-lg p-6">
            <h3 className="text-lg font-semibold text-center mb-6 text-foreground">
                {t('chart.volumeDistributionTitle')}
            </h3>
            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                        <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="impliedApy"
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        tick={{ fill: '#9ca3af' }}
                        tickFormatter={(value) => `${value}%`}
                        label={{ value: t('chart.impliedApy'), position: 'insideBottom', offset: -10, fill: '#9ca3af' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        tick={{ fill: '#9ca3af' }}
                        tickFormatter={(value) => {
                            if (value >= 1000000) {
                                return `${(value / 1000000).toFixed(1)}M`;
                            } else if (value >= 1000) {
                                return `${(value / 1000).toFixed(1)}K`;
                            }
                            return value.toString();
                        }}
                        label={{ value: t('chart.volume'), angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#ffffff'
                        }}
                        labelStyle={{ color: '#ffffff' }}
                        formatter={(value: number) => [
                            value.toLocaleString(undefined, {
                                style: 'currency',
                                currency: 'USD',
                                maximumFractionDigits: 0,
                            }),
                            t('chart.volume'),
                        ]}
                        labelFormatter={(label) => `${label.toFixed(2)}%`}
                    />
                    <Bar
                        dataKey="volume"
                        fill="url(#volumeGradient)"
                        name={t('chart.volume')}
                        radius={[4, 4, 0, 0]}
                        barSize={isMobile ? 20 : 40}
                    >
                        <LabelList
                            dataKey="volume"
                            position="top"
                            fill="#e5e7eb"
                            fontSize={12}
                            formatter={(value: ReactNode) => {
                                const numValue = typeof value === 'number' ? value : Number(value);
                                if (numValue >= 1000000) {
                                    return `${(numValue / 1000000).toFixed(1)}M`;
                                } else if (numValue >= 1000) {
                                    return `${(numValue / 1000).toFixed(1)}K`;
                                }
                                return numValue.toString();
                            }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
