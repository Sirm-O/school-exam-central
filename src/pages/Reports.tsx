import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Download, TrendingUp } from "lucide-react";

export default function Reports() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          {profile?.role === 'student' 
            ? 'View your academic performance reports'
            : 'Generate comprehensive academic reports and analytics'
          }
        </p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Student Report Cards
            </CardTitle>
            <CardDescription>
              Generate individual student performance reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        {profile?.role !== 'student' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Class Performance
                </CardTitle>
                <CardDescription>
                  Analyze performance by class and subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Exam Statistics
                </CardTitle>
                <CardDescription>
                  Detailed examination statistics and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Stats
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
          <CardDescription>
            Generate commonly used reports instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Student Progress Report
            </Button>
            
            {profile?.role !== 'student' && (
              <>
                <Button variant="outline" className="justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Grade Distribution
                </Button>
                <Button variant="outline" className="justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance Trends
                </Button>
                <Button variant="outline" className="justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Attendance Summary
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">📊 Advanced Analytics Coming Soon</CardTitle>
          <CardDescription className="text-center">
            Interactive charts, detailed performance metrics, and comprehensive reporting features are being developed.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}