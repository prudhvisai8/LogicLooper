import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import type { DailyActivity } from '@/lib/storage';

dayjs.extend(dayOfYear);

interface HeatmapProps {
  activity: Record<string, DailyActivity>;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function getIntensity(entry: DailyActivity | undefined): number {
  if (!entry?.solved) return 0;
  if (entry.score >= 300) return 4;
  if (entry.score >= 200) return 3;
  if (entry.score >= 100) return 2;
  return 1;
}

const intensityClasses = [
  'bg-heatmap-0',
  'bg-heatmap-1',
  'bg-heatmap-2',
  'bg-heatmap-3',
  'bg-heatmap-4',
];

const Heatmap: React.FC<HeatmapProps> = ({ activity }) => {
  const [tooltip, setTooltip] = useState<{ date: string; x: number; y: number; entry?: DailyActivity } | null>(null);

  const { weeks, monthLabels } = useMemo(() => {
    const year = dayjs().year();
    const startOfYear = dayjs(`${year}-01-01`);
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const totalDays = isLeap ? 366 : 365;

    // Build grid: 7 rows (days of week) × N columns (weeks)
    const weeks: { date: string; dayOfWeek: number }[][] = [];
    let currentWeek: { date: string; dayOfWeek: number }[] = [];

    // Fill in blank days for first week
    const firstDayOfWeek = startOfYear.day(); // 0=Sun
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: '', dayOfWeek: i });
    }

    for (let d = 0; d < totalDays; d++) {
      const date = startOfYear.add(d, 'day');
      const dow = date.day();
      currentWeek.push({ date: date.format('YYYY-MM-DD'), dayOfWeek: dow });
      if (dow === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // Month labels
    const monthLabels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const firstValidDay = week.find(d => d.date);
      if (firstValidDay) {
        const month = dayjs(firstValidDay.date).month();
        if (month !== lastMonth) {
          monthLabels.push({ label: MONTHS[month], weekIndex: wi });
          lastMonth = month;
        }
      }
    });

    return { weeks, monthLabels };
  }, []);

  const today = dayjs().format('YYYY-MM-DD');

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-flex flex-col gap-1 min-w-fit">
        {/* Month labels */}
        <div className="flex gap-[3px] ml-8 mb-1">
          {monthLabels.map(({ label, weekIndex }, i) => (
            <div
              key={i}
              className="text-xs text-muted-foreground font-body"
              style={{ 
                position: 'relative',
                left: `${weekIndex * 15}px`,
                ...(i > 0 ? { marginLeft: `${(weekIndex - monthLabels[i-1].weekIndex) * 15 - 30}px` } : {})
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex gap-0">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-1 pt-0">
            {DAYS.map((day, i) => (
              <div key={i} className="h-[12px] flex items-center text-[10px] text-muted-foreground font-body leading-none w-7">
                {day}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]" onMouseLeave={() => setTooltip(null)}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }, (_, di) => {
                  const cell = week.find(d => d.dayOfWeek === di);
                  if (!cell || !cell.date) {
                    return <div key={di} className="w-[12px] h-[12px]" />;
                  }

                  const entry = activity[cell.date];
                  const intensity = getIntensity(entry);
                  const isToday = cell.date === today;
                  const isFuture = dayjs(cell.date).isAfter(dayjs());

                  return (
                    <motion.div
                      key={di}
                      className={`w-[12px] h-[12px] rounded-[2px] cursor-pointer transition-colors ${
                        isFuture
                          ? 'bg-secondary/30'
                          : intensityClasses[intensity]
                      } ${isToday ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : ''}`}
                      whileHover={{ scale: 1.8 }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          date: cell.date,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                          entry,
                        });
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-2 ml-8">
          <span className="text-xs text-muted-foreground font-body">Less</span>
          {intensityClasses.map((cls, i) => (
            <div key={i} className={`w-[12px] h-[12px] rounded-[2px] ${cls}`} />
          ))}
          <span className="text-xs text-muted-foreground font-body">More</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 rounded-lg bg-card border border-border shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="font-display text-xs text-foreground">{dayjs(tooltip.date).format('MMM D, YYYY')}</p>
          {tooltip.entry?.solved ? (
            <div className="text-xs text-muted-foreground font-body space-y-0.5">
              <p>Score: <span className="text-primary">{tooltip.entry.score}</span></p>
              <p>Time: {tooltip.entry.timeTaken}s</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground font-body">No activity</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Heatmap;
