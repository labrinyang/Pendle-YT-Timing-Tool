
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getActiveMarkets, type Market } from "@/api/pendle"
import { useTranslation } from "react-i18next"

// Helper function to format expiry time
function formatExpiryTime(expiry: string): string {
    try {
        const expiryDate = new Date(expiry)
        const now = new Date()
        const diffTime = expiryDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        // Format date as "20 Nov 2025"
        const dateStr = expiryDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
        
        // Add days remaining
        if (diffDays > 0) {
            return `${dateStr} (${diffDays} days)`
        } else if (diffDays === 0) {
            return `${dateStr} (Today)`
        } else {
            return `${dateStr} (Expired)`
        }
    } catch {
        return expiry // Return original string if parsing fails
    }
}

export function MarketSelect(props: {selectedChain: string, selectedMarket: Market | null,setSelectedMarket: (market: Market | null) => void}) {
    const { t } = useTranslation();
    const {selectedChain = "1", selectedMarket = null, setSelectedMarket} = props
    const [open, setOpen] = React.useState(false)
    const [searchValue, setSearchValue] = React.useState("")

    const [markets, setMarkets] = React.useState<Market[]>([])
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    React.useEffect(() => {
        setIsLoading(true)
        getActiveMarkets(Number(selectedChain)).then((d) => {
            console.log("markets", d)
            setMarkets(d)
            // Auto-select the first market when chain changes or when no market is selected
            if (d.length > 0) {
                setSelectedMarket(d[0])
            }
            setIsLoading(false)
        }).catch((error) => {
            console.error("Failed to fetch markets:", error)
            setIsLoading(false)
        })
    }, [selectedChain, setSelectedMarket]) // Add selectedMarket back to dependencies

    const selectedMarketData = markets.find(market => market.address === selectedMarket?.address)

    // Filter markets based on search input
    const filteredMarkets = markets.filter(market => 
        searchValue === '' || 
        market.name.toLowerCase().includes(searchValue.toLowerCase()) || 
        market.underlyingAsset.toLowerCase().includes(searchValue.toLowerCase())
    )

    return (
        <div className="w-full flex-1 sm:max-w-xs">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between input-enhanced"
                        disabled={isLoading}
                    >
                                                {isLoading 
                            ? t('marketSelect.loadingMarkets')
                            : selectedMarketData 
                                ? <div className="flex items-center justify-between w-full">
                                    <div className="flex-1 min-w-0">
                                        <span className="font-medium truncate">{selectedMarketData.name}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                                        {formatExpiryTime(selectedMarketData.expiry)}
                                    </span>
                                </div>
                                : t('marketSelect.selectMarket')
                            }
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-66 p-0">
                    <Command shouldFilter={false}>
                        <CommandInput 
                            placeholder={t('marketSelect.searchMarkets')}
                            className="h-9"
                            value={searchValue}
                            onValueChange={setSearchValue}
                        />
                        <CommandList>
                            <CommandEmpty>{t('marketSelect.noMarketsFound')}</CommandEmpty>
                            <CommandGroup>
                                {filteredMarkets.map((market) => (
                                    <CommandItem
                                        key={market.address}
                                        value={market.address.toString()}
                                        onSelect={() => {
                                            setSelectedMarket(market)
                                            setOpen(false)
                                            setSearchValue("") // Clear search when selecting
                                        }}
                                    >
                                        <div className="flex flex-col w-full">
                                            <div className="flex items-center justify-between w-full">
                                                <span className="font-medium">{market.name}</span>
                                                <Check
                                                    className={cn(
                                                        "ml-auto h-4 w-4",
                                                        selectedMarket?.address === market.address ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatExpiryTime(market.expiry)}
                                            </span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
