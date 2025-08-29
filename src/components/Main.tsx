import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { chainsArray } from '../constant/chain';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { MarketSelect } from './MarketSelect';
import { Input } from './ui/input';

import { getTransactionsAll } from '@/api/pendle';
import type { Market } from '@/api/pendle';
import { compute } from '@/compute';
import { Chart, type ChartData } from './Chart';

export function From() {
    const { t } = useTranslation();
    const [selectedChain, setSelectedChain] = useState<string>(chainsArray[0]?.chainId.toString() || "1");
    const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
    const [underlyingAmount, setUnderlyingAmount] = useState<number>(1500);
    const [pointsPerDay, setPointsPerDay] = useState<number>(1);
    const [pendleMultiplier, setPendleMultiplier] = useState<number>(36);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [weightedImplied, setWeightedImplied] = useState<number>(0);

    const handleChainChange = (value: string) => {
        setSelectedChain(value);
    };



    // Auto-update function
    const updateChart = useCallback(async () => {
        if (!selectedMarket) return;

        setIsLoading(true);
        try {
            const txs = await getTransactionsAll(selectedChain, selectedMarket.address.toString());
            console.log(txs);

            const { tTimes, ytPrice, points, weightedImplied: computedWeightedImplied, maturityDate } = compute({
                transactions: txs,
                maturity: selectedMarket.expiry,
                underlyingAmount,
                pointsPerDayPerUnderlying: pointsPerDay,
                multiplier: pendleMultiplier
            });

            setWeightedImplied(computedWeightedImplied || 0);
            console.log("res", tTimes, ytPrice, points, computedWeightedImplied, maturityDate);

            // Generate fair value curve using current weighted implied APY
            const now = new Date();
            const fairCurvePoints = 50; // number of points to render the straight line
            const fairCurve: ChartData[] = Array.from({ length: fairCurvePoints }, (_, i) => {
                const time = new Date(now.getTime() + (maturityDate.getTime() - now.getTime()) * (i / (fairCurvePoints - 1)));
                const minutesToMaturity = (maturityDate.getTime() - time.getTime()) / (1000 * 60);
                return {
                    time: time.getTime(),
                    ytPrice: null,
                    points: null,
                    fairValue: 1 - Math.pow(1 + (computedWeightedImplied || 0), -minutesToMaturity / (365 * 24 * 60))
                };
            });

            // Include actual transaction data for YT price and points
            const txData: ChartData[] = tTimes.map((time, index) => {
                const minutesToMaturity = (maturityDate.getTime() - time.getTime()) / (1000 * 60);
                return {
                    time: time.getTime(),
                    ytPrice: ytPrice[index] || 0,
                    points: points[index] || 0,
                    fairValue: 1 - Math.pow(1 + (computedWeightedImplied || 0), -minutesToMaturity / (365 * 24 * 60))
                };
            });

            setChartData([...fairCurve, ...txData].sort((a, b) => a.time - b.time));
        } catch (error) {
            console.error('Chart update failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedMarket, selectedChain, underlyingAmount, pointsPerDay, pendleMultiplier]);

    // Auto-update when market is selected (immediate)
    useEffect(() => {
        if (selectedMarket) {
            updateChart();
        }
    }, [selectedMarket, updateChart]);

    // Auto-update when inputs change (debounced)
    useEffect(() => {
        if (selectedMarket) {
            const timeoutId = setTimeout(() => {
                updateChart();
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [selectedMarket, updateChart]);

    return (  
        <div className='space-y-8'>
            <div className='bg-card card-elevated rounded-lg p-6'>
                <div className='flex items-center gap-4 flex-wrap'>
                <div className='flex flex-col space-y-2'>
                    <label className='text-sm font-medium text-muted-foreground whitespace-nowrap'>{t('main.chain')}</label>
                    <Select value={selectedChain} onValueChange={handleChainChange}>
                        <SelectTrigger className="w-48 input-enhanced">
                            <SelectValue placeholder={t('main.selectChain')} />
                        </SelectTrigger>
                        <SelectContent>
                            {chainsArray.map((chain) => (
                                <SelectItem key={chain.chainId} value={chain.chainId.toString()}>
                                    {chain.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className='flex flex-col space-y-2'>
                    <label className='text-sm font-medium text-muted-foreground whitespace-nowrap'>{t('main.market')}</label>
                    <MarketSelect selectedChain={selectedChain} selectedMarket={selectedMarket} setSelectedMarket={setSelectedMarket} />
                </div>
                <div className='flex flex-col space-y-2'>
                    <label className='text-sm font-medium text-muted-foreground whitespace-nowrap'>{t('main.underlyingAmount')}</label>
                    <Input
                        type="number"
                        value={underlyingAmount}
                        onChange={(e) => setUnderlyingAmount(Number(e.target.value))}
                        placeholder="1500"
                        className="w-40 input-enhanced"
                        min="0"
                    />
                </div>
                <div className='flex flex-col space-y-2'>
                    <label className='text-sm font-medium text-muted-foreground whitespace-nowrap'>{t('main.pointsPerDay')}</label>
                    <Input
                        type="number"
                        value={pointsPerDay}
                        onChange={(e) => setPointsPerDay(Number(e.target.value))}
                        placeholder="1"
                        className="w-40 input-enhanced"
                        min="0"
                    />
                </div>
                <div className='flex flex-col space-y-2'>
                    <label className='text-sm font-medium text-muted-foreground whitespace-nowrap'>{t('main.pendleMultiplier')}</label>
                    <Input
                        type="number"
                        value={pendleMultiplier}
                        onChange={(e) => setPendleMultiplier(Number(e.target.value))}
                        placeholder="36"
                        className="w-40 input-enhanced"
                        min="0"
                    />
                </div>

            </div>
            </div>
            
            {/* Loading Indicator */}
            {isLoading && (
                <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-2 text-muted-foreground bg-muted/30 px-4 py-2 rounded-lg border border-border/40">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>{t('main.updatingChart')}</span>
                    </div>
                </div>
            )}
            
            {/* Market Summary */}
            {selectedMarket && (
                <div className="mt-8">
                    <div className="bg-card card-elevated rounded-lg p-6">
                        {/* Header Section */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <div className="bg-muted badge-enhanced px-3 py-1 rounded-full text-sm font-medium">
                                {selectedMarket.name}
                            </div>
                            <div className="bg-muted badge-enhanced px-3 py-1 rounded-full text-sm font-medium">
                                {t('main.maturityUTC')} {new Date(selectedMarket.expiry).toISOString().replace('T', ' ').replace('Z', 'Z')}
                            </div>
                            <div className="bg-muted badge-enhanced px-3 py-1 rounded-full text-sm font-medium text-green-500">
                                {t('main.weightedImpliedAPY')} {((weightedImplied || 0) * 100).toFixed(2)}%
                            </div>
                            <div className="bg-muted badge-enhanced px-3 py-1 rounded-full text-sm font-medium">
                                {t('main.network')} {chainsArray.find(chain => chain.chainId.toString() === selectedChain)?.name || t('common.unknown')}
                            </div>
                        </div>
                        
                        {/* Metrics Section */}
                        {chartData.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-muted/50 card-subtle p-4 rounded-lg">
                                    <div className="text-sm text-muted-foreground mb-2">{t('main.transactionsUnique')}</div>
                                    <div className="text-2xl font-bold">{chartData.length.toLocaleString()}</div>
                                </div>
                                <div className="bg-muted/50 card-subtle p-4 rounded-lg">
                                    <div className="text-sm text-muted-foreground mb-2">{t('main.weightedImpliedAPYVolume')}</div>
                                    <div className="text-2xl font-bold text-green-500">{((weightedImplied || 0) * 100).toFixed(2)}%</div>
                                </div>
                                <div className="bg-muted/50 card-subtle p-4 rounded-lg">
                                    <div className="text-sm text-muted-foreground mb-2">{t('main.pointsAvailable')}</div>
                                    <div className="text-2xl font-bold">
                                        {chartData.length > 0 ? chartData[chartData.length - 1]?.points?.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Chart Display */}
            {chartData.length > 0 && selectedMarket && (
                <div className="mt-8">
                    <Chart 
                        data={chartData}
                        marketName={selectedMarket.name}
                        underlyingAmount={underlyingAmount}
                        chainName={chainsArray.find(chain => chain.chainId.toString() === selectedChain)?.name || t('common.unknown')}
                    />
                </div>
            )}
        </div>
    );
}