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
import { useRef } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
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
    const chartHeight = isMobile ? Math.min(400, Math.max(200, width * 0.8)) : 400;
    const chartRef = useRef<HTMLDivElement>(null);

    const downloadImage = () => {
        if (!chartRef.current) return;
        const svg = chartRef.current.querySelector('svg');
        if (!svg) return;

        const exportWidth = 1280;
        const exportHeight = 720; // 16:9 ratio
        const scale = Math.max(2, window.devicePixelRatio || 1);

        const { width: svgWidth, height: svgHeight } = svg.getBoundingClientRect();
        const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
        clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clonedSvg.setAttribute('width', String(exportWidth));
        clonedSvg.setAttribute('height', String(exportHeight));
        clonedSvg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);

        const serializer = new XMLSerializer();
        const svgData = serializer.serializeToString(clonedSvg);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = exportWidth * scale;
            canvas.height = exportHeight * scale;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                alert(t('chart.downloadFailed'));
                return;
            }
            ctx.scale(scale, scale);
            const backgroundColor = getComputedStyle(chartRef.current!).backgroundColor || '#ffffff';
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, exportWidth, exportHeight);
            ctx.drawImage(image, 0, 0, exportWidth, exportHeight);

            // Draw legend manually to ensure it's included
            const legendItems = [
                { color: '#3b82f6', label: t('chart.yAxisLeft') },
                { color: '#f97316', label: t('chart.yAxisRight') },
                { color: '#22c55e', label: t('chart.fairValueCurve') },
            ];
            const textColor = '#ffffff';
            const fontSize = 14;
            ctx.font = `${fontSize}px sans-serif`;
            ctx.textBaseline = 'middle';
            let x = (exportWidth -
                legendItems.reduce((acc, item) => acc + ctx.measureText(item.label).width + 40, 0)
            ) / 2;
            const y = exportHeight - 20;
            legendItems.forEach((item) => {
                ctx.fillStyle = item.color;
                ctx.fillRect(x, y - 6, 12, 12);
                ctx.fillStyle = textColor;
                ctx.fillText(item.label, x + 18, y);
                x += ctx.measureText(item.label).width + 40;
            });

            const link = document.createElement('a');
            link.download = 'chart.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            URL.revokeObjectURL(url);
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            alert(t('chart.downloadFailed'));
        };
        image.src = url;
    };
    
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
            <div className="relative mb-6">
                <h3 className="text-lg font-semibold text-center text-foreground">
                    {marketName} on {chainName} [{underlyingAmount} {t('chart.underlyingCoin')}] {maturityDate ? `- ${t('chart.maturity')} ${maturityDate.toLocaleString()}` : ''}
                </h3>
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2"
                    onClick={downloadImage}
                >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">{t('chart.downloadImage')}</span>
                </Button>
            </div>

            <div ref={chartRef}>
                <ResponsiveContainer width="100%" height={chartHeight}>
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
                        tickFormatter={(value) => new Date(Number(value)).toLocaleString(i18n.language, {
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
                        labelFormatter={(value) => new Date(Number(value)).toLocaleString(i18n.language)}
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
        </div>

        <div className="mt-4 text-sm text-muted-foreground text-center">
            {t('chart.maximizePointsHint')}
        </div>
    </div>
    );
}
