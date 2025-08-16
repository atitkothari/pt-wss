'use client';

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Trade } from '@/app/types/trade';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { subDays, addDays, format, eachDayOfInterval, startOfDay, subWeeks, addWeeks, eachWeekOfInterval, startOfWeek, endOfWeek, subMonths, addMonths, eachMonthOfInterval, startOfMonth, endOfMonth, subYears, addYears, eachYearOfInterval, startOfYear, endOfYear } from 'date-fns';

interface PremiumChartProps {
  trades: Trade[];
}

type TimeFrame = '5D' | '1W' | '1M' | '3M' | '1Y';

const PremiumChart: React.FC<PremiumChartProps> = ({ trades }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [endDate, setEndDate] = useState(new Date());
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('3M');

  const { startDate, interval } = useMemo(() => {
    switch (timeFrame) {
      case '1W':
        return { startDate: startOfWeek(endDate), interval: eachDayOfInterval({ start: startOfWeek(endDate), end: endOfWeek(endDate) }) };
      case '1M':
        return { startDate: startOfMonth(endDate), interval: eachWeekOfInterval({ start: startOfMonth(endDate), end: endOfMonth(endDate) }) };
      case '3M':
        return { startDate: subMonths(endDate, 3), interval: eachWeekOfInterval({ start: subMonths(endDate, 3), end: endDate }) };
      case '1Y':
        return { startDate: startOfYear(endDate), interval: eachMonthOfInterval({ start: startOfYear(endDate), end: endOfYear(endDate) }) };
      case '5D':
      default:
        const start = subDays(endDate, 4);
        return { startDate: start, interval: eachDayOfInterval({ start, end: endDate }) };
    }
  }, [endDate, timeFrame]);

  const handlePrevious = () => {
    switch (timeFrame) {
      case '5D':
        setEndDate(subDays(endDate, 5));
        break;
      case '1W':
        setEndDate(subWeeks(endDate, 1));
        break;
      case '1M':
        setEndDate(subMonths(endDate, 1));
        break;
      case '3M':
        setEndDate(subMonths(endDate, 3));
        break;
      case '1Y':
        setEndDate(subYears(endDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (timeFrame) {
      case '5D':
        setEndDate(addDays(endDate, 5));
        break;
      case '1W':
        setEndDate(addWeeks(endDate, 1));
        break;
      case '1M':
        setEndDate(addMonths(endDate, 1));
        break;
      case '3M':
        setEndDate(addMonths(endDate, 3));
        break;
      case '1Y':
        setEndDate(addYears(endDate, 1));
        break;
    }
  };

  const chartData = useMemo(() => {
    return interval.map(date => {
      const dayTrades = trades.filter(trade => {
        const tradeDate = startOfDay(new Date(trade.openDate));
        if (timeFrame === '1M') {
            const weekStart = startOfWeek(date);
            const weekEnd = endOfWeek(date);
            return tradeDate >= weekStart && tradeDate <= weekEnd;
        }
        if (timeFrame === '3M') {
            const weekStart = startOfWeek(date);
            const weekEnd = endOfWeek(date);
            return tradeDate >= weekStart && tradeDate <= weekEnd;
        }
        if (timeFrame === '1Y') {
            const monthStart = startOfMonth(date);
            const monthEnd = endOfMonth(date);
            return tradeDate >= monthStart && tradeDate <= monthEnd;
        }
        return tradeDate.getTime() === startOfDay(date).getTime();
      });
      const premium = dayTrades.reduce((sum, trade) => sum + trade.premium, 0);
      let dateFormat = 'MMM d';
        if (timeFrame === '1M') dateFormat = 'MMM d';
        if (timeFrame === '3M') dateFormat = 'MMM d';
        if (timeFrame === '1Y') dateFormat = 'MMM';
      return {
        date: format(date, dateFormat),
        premium,
      };
    });
  }, [startDate, endDate, trades, timeFrame, interval]);

  const totalPremium = useMemo(() => {
    return chartData.reduce((sum, data) => sum + data.premium, 0);
  }, [chartData]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">Premium Collected</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Total: ${totalPremium.toLocaleString()}
              </p>
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="hover:bg-gray-100 rounded-full p-2">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Time Frame Selector */}
            <div className="flex justify-end gap-1 mb-6 p-1 bg-gray-100 rounded-lg">
              {(['5D', '1W', '1M', '3M', '1Y'] as TimeFrame[]).map((tf) => (
                <Button
                  key={tf}
                  variant={timeFrame === tf ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeFrame(tf)}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    timeFrame === tf 
                      ? 'shadow-sm' 
                      : 'hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {tf}
                </Button>
              ))}
            </div>

            {/* Chart Container */}
            <div className="h-[400px] mb-6">
              <ChartContainer config={{}} className="w-full h-full">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="premiumGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false} 
                    stroke="rgba(0,0,0,0.05)"
                    opacity={0.5}
                  />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickMargin={10}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickMargin={10}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    content={<ChartTooltipContent />}
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  />
                  <Bar 
                    dataKey="premium" 
                    fill="url(#premiumGradient)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ChartContainer>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-center items-center gap-6">
              <Button 
                onClick={handlePrevious} 
                size="sm"
                variant="outline"
                className="px-4 py-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />               
              </Button>
              
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">
                  {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {timeFrame === '5D' && '5 Day Period'}
                  {timeFrame === '1W' && 'Weekly View'}
                  {timeFrame === '1M' && 'Monthly View'}
                  {timeFrame === '3M' && '3 Month View'}
                  {timeFrame === '1Y' && 'Yearly View'}
                </div>
              </div>

              <Button 
                onClick={handleNext} 
                size="sm"
                variant="outline"
                className="px-4 py-2 hover:bg-gray-50 transition-colors duration-200"
              >
                
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default PremiumChart;