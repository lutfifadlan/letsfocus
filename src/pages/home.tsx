import React from 'react'
import router from 'next/router'
import { useSession } from 'next-auth/react'
import Layout from '@/components/layout'
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
  const { status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  return (
    <Layout>
      <Card>
        <CardHeader>
          <CardTitle>Daily Summary</CardTitle>
          <CardDescription>Your progress for today</CardDescription>
        </CardHeader>
      </Card>
    </Layout>
  )
}