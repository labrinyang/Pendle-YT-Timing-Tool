import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from '../hooks/use-window-size';

export interface ChartData {
    time: number;
    ytPrice: number | null;
    points: number | null;
    fairValue: number;
}

interface ChartProps {
    data: ChartData[];
    marketName: string;
    underlyingAmount: number;
    chainName: string;
    maturityDate?: Date;
}

export function Chart({ data, marketName, underlyingAmount, chainName, maturityDate }: ChartProps) {
    const { t, i18n } = useTranslation();
    const { width } = useWindowSize();
    const isMobile = width < 640;
    
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                {t('chart.noDataAvailable')}
            </div>
        );
    }

    // Sort data by timestamp to ensure proper ordering
    const chartData = [...data].sort((a, b) => a.time - b.time);

    return (
        <div className="w-full bg-card card-elevated rounded-lg p-6">
            <h3 className="text-lg font-semibold text-center mb-6 text-foreground">
                {marketName} on {chainName} [{underlyingAmount} {t('chart.underlyingCoin')}] {maturityDate ? `- ${t('chart.maturity')} ${maturityDate.toLocaleString()}` : ''}
            </h3>
            
            <ResponsiveContainer width="100%" height={isMobile ? 280 : 400}>
                <LineChart key={i18n.language} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    
                    {/* X Axis - Time */}
                    <XAxis
                        dataKey="time"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        stroke="#888888"
                        fontSize={12}
                        tick={{ fill: '#888888' }}
                        tickFormatter={(value) => new Date(value).toLocaleString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        })}
                    />
                    
                    {/* Left Y Axis - YT Price */}
                    <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke="#888888"
                        fontSize={12}
                        tick={{ fill: '#888888' }}
                        domain={[0, 'dataMax + 0.01']}
                        tickFormatter={(value) => value.toFixed(4)}
                        label={{ value: t('chart.yAxisLeft'), angle: -90, position: 'insideLeft', fill: '#888888' }}
                    />

                    {/* Right Y Axis - Points */}
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#888888"
                        fontSize={12}
                        tick={{ fill: '#888888' }}
                        domain={[0, 'dataMax + 20000000']}
                        tickFormatter={(value) => {
                            if (value >= 1000000) {
                                return `${(value / 1000000).toFixed(1)}M`;
                            } else if (value >= 1000) {
                                return `${(value / 1000).toFixed(1)}K`;
                            }
                            return value.toString();
                        }}
                        label={{ value: t('chart.yAxisRight'), angle: -90, position: 'insideRight', fill: '#888888' }}
                    />
                    
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#ffffff'
                        }}
                        labelStyle={{ color: '#ffffff' }}
                        labelFormatter={(label) => new Date(Number(label)).toLocaleString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        })}
                        formatter={(value: number, name: string) => {
                            if (name === t('chart.yAxisRight')) {
                                if (!isFinite(value)) {
                                    return ['', name];
                                }
                                if (value >= 1000000) {
                                    return [`${(value / 1000000).toFixed(2)}M`, name];
                                } else if (value >= 1000) {
                                    return [`${(value / 1000).toFixed(2)}K`, name];
                                }
                                return [value.toString(), name];
                            }
                            if (name === t('chart.yAxisLeft') || name === t('chart.fairValueCurve')) {
                                if (!isFinite(value)) {
                                    return ['', name];
                                }
                                return [value.toFixed(4), name];
                            }
                            return [value.toString(), name];
                        }}
                    />
                    
                    <Legend 
                        wrapperStyle={{ 
                            paddingTop: '20px',
                            color: '#ffffff'
                        }}
                    />
                    
                    {/* YT Price Line - Blue */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="ytPrice"
                        stroke="#3b82f6"
                        strokeWidth={1.5}
                        dot={false}
                        name={t('chart.yAxisLeft')}
                    />
                    
                    {/* Points Line - Orange */}
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="points"
                        stroke="#f97316"
                        strokeWidth={1.5}
                        dot={false}
                        name={t('chart.yAxisRight')}
                    />
                    
                    {/* Fair Value Curve - Green Dotted */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="fairValue"
                        stroke="#22c55e"
                        strokeWidth={1.5}
                        strokeDasharray="5 5"
                        dot={false}
                        name={t('chart.fairValueCurve')}
                    />
                </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-4 text-sm text-muted-foreground text-center">
                {t('chart.maximizePointsHint')}
            </div>
        </div>
    );
}
