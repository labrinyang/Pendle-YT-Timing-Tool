interface Transaction {
    timestamp: string | number;
    impliedApy?: number | string;
    valuation?: {
        usd?: number | string;
    };
    valuation_usd?: number | string;
}

interface ComputeProps {
    transactions: Transaction[];
    maturity: Date | string;
    underlyingAmount: number;
    pointsPerPeriodPerUnderlying: number;
    pointsPeriod: 'hour' | 'day' | 'week';
    multiplier: number;
}

interface ComputeResult {
    tTimes: Date[];
    ytPrice: number[];
    points: number[];
    weightedImplied: number;
    maturityDate: Date;
}

function compute({transactions, maturity, underlyingAmount, pointsPerPeriodPerUnderlying, pointsPeriod, multiplier}: ComputeProps): ComputeResult {
    const tTimes: Date[] = [];
    const implied: number[] = [];
    const valuationUSD: number[] = [];
    
    for (const tx of transactions){
        const t = new Date(tx.timestamp); 
        if (isNaN(t.getTime())) continue;
        tTimes.push(t);
        
        const iA = Number(tx?.impliedApy); 
        implied.push(isFinite(iA) ? iA : NaN);
        
        const usd = Number(tx?.valuation?.usd ?? tx?.valuation_usd); 
        valuationUSD.push(isFinite(usd) ? usd : 0);
    }
    
    const totalUSD = valuationUSD.reduce((a, b) => a + (isFinite(b) ? b : 0), 0);
    const weightedImplied = totalUSD > 0
        ? implied.reduce((acc, iA, idx) => acc + (isFinite(iA) && isFinite(valuationUSD[idx]) ? iA * valuationUSD[idx] : 0), 0) / totalUSD
        : NaN;

    const maturityDate = new Date(maturity);
    const hoursToMaturity = tTimes.map(t => (maturityDate.getTime() - t.getTime()) / 3600000);

    const periodHours = pointsPeriod === 'hour' ? 1 : pointsPeriod === 'day' ? 24 : 168;
    const pph = pointsPerPeriodPerUnderlying / periodHours;
    const mult = multiplier;
    const ytPrice: number[] = [];
    const points: number[] = [];
    
    for (let i = 0; i < tTimes.length; i++){
        const iA = implied[i];
        const h = hoursToMaturity[i];
        if (!isFinite(iA) || !isFinite(h)){ 
            ytPrice.push(NaN); 
            points.push(NaN); 
            continue; 
        }
        const price = 1 - Math.pow(1 + iA, -h / 8760);
        ytPrice.push(price);
        points.push((1 / price) * h * pph * underlyingAmount * mult);
    }
    
    return { tTimes, ytPrice, points, weightedImplied, maturityDate };
}

export { compute, type ComputeProps, type ComputeResult, type Transaction };
