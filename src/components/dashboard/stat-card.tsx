import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type StatCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  description?: string;
  variant?: 'default' | 'warning';
  onClick?: () => void;
};
export default function StatCard({ title, value, icon, description, variant = 'default' }: StatCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div onClick={() => title === "Content to Review" ? window.location.href="/admin/inbox" : "" } className={cn("h-6 w-6",   variant === 'warning' ?  'text-destructive hover:text-primary-foreground cursor-pointer' : 'text-muted-foreground')}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-headline">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
