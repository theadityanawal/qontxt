'use client';

import { useAuth } from '@/lib/services/auth/auth.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResumeAnalyzer } from '@/components/ai/ResumeAnalyzer';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Resume Score',
      value: '85%',
      description: 'Average ATS compatibility score',
      action: 'Improve Score'
    },
    {
      title: 'Job Matches',
      value: '12',
      description: 'Potential job matches found',
      action: 'View Matches'
    },
    {
      title: 'Resume Views',
      value: '34',
      description: 'Times your resume was viewed',
      action: 'View Details'
    }
  ];

  const recentActivity = [
    {
      title: 'Resume Updated',
      description: 'Software Engineer Resume V2',
      timestamp: '2 hours ago',
      link: '/dashboard/resumes/1'
    },
    {
      title: 'New Job Match',
      description: 'Senior Frontend Developer at Tech Corp',
      timestamp: '5 hours ago',
      link: '/dashboard/jobs/1'
    },
    {
      title: 'Resume Generated',
      description: 'Product Manager Resume',
      timestamp: '1 day ago',
      link: '/dashboard/resumes/2'
    }
  ];

  return (
    <div className="h-screen flex">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-4">
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome back{user?.displayName ? `, ${user.displayName}` : ''}
                </h1>
                <p className="text-muted-foreground mt-2">
                  Here's what's happening with your resumes
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/resumes/new">Create New Resume</Link>
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
              {stats.map((stat, i) => (
                <HoverCard key={i}>
                  <HoverCardTrigger asChild>
                    <Card className="hover:shadow-lg transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg">{stat.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-2">{stat.value}</div>
                        <p className="text-muted-foreground text-sm">
                          {stat.description}
                        </p>
                        <Button variant="secondary" size="sm" className="mt-4">
                          {stat.action}
                        </Button>
                      </CardContent>
                    </Card>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">{stat.title} Details</h4>
                      <p className="text-sm text-muted-foreground">
                        Click to see detailed analytics and improvement suggestions.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>

            {/* Resume Analysis Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Resume Analysis</h2>
              {user && (
                <ResumeAnalyzer
                  userId={user.uid}
                  baseResume={recentActivity[0]} // This should be replaced with actual resume data
                />
              )}
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="grid gap-4">
                {recentActivity.map((activity, i) => (
                  <Link key={i} href={activity.link}>
                    <Card className="hover:shadow-md transition-all">
                      <CardContent className="flex justify-between items-center py-4">
                        <div>
                          <h3 className="font-medium">{activity.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {activity.timestamp}
                          </span>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

