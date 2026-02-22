"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import DashboardStats from "@/components/dashboard/DashboardStats"
import DashboardContent from "@/components/dashboard/DashboardContent"

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Stats section */}
        <section>
          <DashboardStats refreshKey={refreshKey} />
        </section>

        {/* Main content section */}
        <section>
          <DashboardContent />
        </section>
      </div>
    </DashboardLayout>
  )
}
