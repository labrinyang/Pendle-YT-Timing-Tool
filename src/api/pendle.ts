import { ApiError } from './utils'


// Transaction data type
export interface Transaction {
    id: string;
    timestamp: string;
    impliedApy?: number;
    valuation?: {
        usd?: number;
    };
    valuation_usd?: number;
    market: string;
    action: string;
    origin: string;
    value?: number;
}

// Market data type
export interface Market {
    name: string
    address: string
    expiry: string
    pt:string,
    yt:string,
    sy:string,
    underlyingAsset:string
}

// Pendle API base URL
const BASE_URL = "https://api-v2.pendle.finance/core"

// Pendle-specific error type
export class PendleApiError extends ApiError {
  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: unknown
  ) {
    super(message, status, code, details)
    this.name = 'PendleApiError'
  }
}

// Helper function to fetch JSON data
async function fetchJSON<T>(url: string, params: Record<string, string>): Promise<T> {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    const response = await fetch(fullUrl);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
}

// Helper function to sleep
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Get active markets
export async function getActiveMarkets(
  chainId: number
): Promise<Market[]> {
  try {
    const url = `${BASE_URL}/v1/${chainId}/markets/active`
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.markets
  } catch (error) {
    console.error('Failed to get active markets:', error)
    throw new PendleApiError(
      error instanceof ApiError ? error.message : 'Failed to get active markets',
      error instanceof ApiError ? error.status : 500,
      error instanceof ApiError ? error.code : 'UNKNOWN_ERROR'
    )
  }
}


export async function getTransactionsAll(
    chainId: string, 
    marketAddr: string
): Promise<Transaction[]> {
    const MAX_PAGES = 8; // ~8000 rows upper bound
    console.log("chainId", chainId, "marketAddr", marketAddr);
    
    if (!chainId) {
        throw new Error(`Unsupported network`);
    }
    

    
    const base = `${BASE_URL}/v4/${chainId}/transactions`;
    const results: Transaction[] = [];
    let skip = 0;
    let resumeToken: string | null = null;
    let pages = 0;

    console.log(`📊 Fetching transactions from API (max ${MAX_PAGES} pages)...`);
    
    while (pages < MAX_PAGES) {
        const params: Record<string, string> = { 
            market: marketAddr, 
            action: 'SWAP_PT,SWAP_PY,SWAP_YT', 
            origin: 'PENDLE_MARKET,YT', 
            limit: '1000', 
            minValue: '0' 
        };
        
        if (resumeToken) {
            params.resumeToken = resumeToken;
        } else {
            params.skip = String(skip);
        }

        let data: { results?: Transaction[]; resumeToken?: string } | undefined;
        try {
            data = await fetchJSON<{ results?: Transaction[]; resumeToken?: string }>(base, params);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            throw new Error(`Network error while fetching transactions: ${errorMessage}`);
        }
        
        const page = Array.isArray(data?.results) ? data.results : [];
        if (page.length === 0) break;
        results.push(...page);

        pages += 1;
        console.log(`📄 Page ${pages}: Got ${page.length} transactions (total: ${results.length})`);
        
        if (data?.resumeToken) {
            resumeToken = data.resumeToken;
        } else if (!resumeToken) {
            skip += 1000;
        }

        if (pages >= MAX_PAGES) {
            console.warn('⚠️ Truncated transactions due to page cap');
            break;
        }
        await sleep(160 + Math.random() * 100);
    }
    
    const seen = new Set<string>();
    const dedup: Transaction[] = [];
    for (const r of results) { 
        if (r?.id && !seen.has(r.id)) { 
            seen.add(r.id); 
            dedup.push(r); 
        } 
    }
    
    console.log(`🔄 Deduplication: ${results.length} → ${dedup.length} unique transactions`);
    
    return dedup;
}