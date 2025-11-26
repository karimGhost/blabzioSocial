import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const reports = [
    { id: 'rep_01', title: 'Q2 2024 User Growth Report', date: '2024-07-01', type: 'Users' },
    { id: 'rep_02', title: 'June 2024 Content Engagement Analysis', date: '2024-07-01', type: 'Content' },
    { id: 'rep_03', title: 'Q2 2024 Platform Performance', date: '2024-07-02', type: 'Performance' },
    { id: 'rep_04', title: 'May 2024 Content Engagement Analysis', date: '2024-06-01', type: 'Content' },
]

export default function ReportsPage() {
  return (
    <div className="space-y-8">
        <div>
            <h2 className="text-3xl font-bold font-headline">Reporting Tool</h2>
            <p className="text-muted-foreground">Generate and download performance reports.</p>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
           <CardDescription>Select the parameters for your new report.</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Placeholder for report generation form */}
            <div className="flex flex-col sm:flex-row items-end gap-4 p-6 rounded-lg border bg-muted/50">
                <div className="flex-1 w-full">
                    <label className="text-sm font-medium">Report Type</label>
                    <select className="mt-1 block w-full rounded-md border-input bg-background p-2 focus:ring-ring focus:ring-1">
                        <option>User Demographics</option>
                        <option>Content Engagement</option>
                        <option>Platform Performance</option>
                    </select>
                </div>
                <div className="flex-1 w-full">
                    <label className="text-sm font-medium">Date Range</label>
                     <input type="date" className="mt-1 block w-full rounded-md border-input bg-background p-2 focus:ring-ring focus:ring-1" />
                </div>
                <Button>Generate Report</Button>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date Generated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
