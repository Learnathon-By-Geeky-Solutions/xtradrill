"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EmployerDashboard() {
  const { user } = useUser();
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployerData = async () => {
      try {
        const response = await fetch('/api/employer/profile');
        const data = await response.json();
        
        if (data.success) {
          setEmployer(data.employer);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch employer data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEmployerData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="mt-4">
              If you haven't registered as an employer yet, please register first:
            </p>
            <Link href="/employer-registration">
              <Button className="mt-4">Register as Employer</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="min-h-screen p-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to XtraDrill</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You need to register as an employer to access the dashboard.</p>
            <Link href="/employer-registration">
              <Button className="mt-4">Register as Employer</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome, {employer.companyName}</h1>
          <p className="text-gray-600">Manage your job postings and applications</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="profile">Company Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-gray-600">Currently active job postings</p>
                  <Link href="/employer-dashboard?tab=jobs">
                    <Button className="mt-4 w-full">Post a New Job</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-gray-600">Applications received</p>
                  <Link href="/employer-dashboard?tab=applications">
                    <Button variant="outline" className="mt-4 w-full">View Applications</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-gray-600">Views in last 30 days</p>
                  <Link href="/employer-dashboard?tab=profile">
                    <Button variant="outline" className="mt-4 w-full">Update Profile</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Job Postings</CardTitle>
                  <Button>Post New Job</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>No jobs posted yet</p>
                  <p className="text-sm mt-2">Start by posting your first job</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Job Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>No applications received yet</p>
                  <p className="text-sm mt-2">Applications will appear here once candidates apply</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Company Name</h3>
                    <p>{employer.companyName}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Industry</h3>
                    <p>{employer.industry}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p>{employer.location}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Company Size</h3>
                    <p>{employer.companySize}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Website</h3>
                    <p>{employer.website || 'Not provided'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">About</h3>
                    <p>{employer.companyDetails}</p>
                  </div>
                  <Button className="w-full">Update Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
