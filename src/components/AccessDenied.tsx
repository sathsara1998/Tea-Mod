import React from 'react'
import { AlertTriangle, Shield, Lock } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const AccessDeniedPage = () => {
  return (
    <div className="min-h-screen w-full  p-4">
      <div className="mx-auto max-w-3xl space-y-8 py-12">
        {/* Main Warning Alert */}
        <Alert className="border-red-500 bg-red-500/10 text-red-500">
          <AlertTriangle className="h-6 w-6" />
          <AlertTitle className="text-2xl font-bold">Access Denied</AlertTitle>
          <AlertDescription className="text-lg">
            Your IP address is not authorized to access this resource.
          </AlertDescription>
        </Alert>

        {/* Security Details Card */}
        <div className="space-y-6 rounded-lg border border-slate-700 bg-slate-800 p-6">
          <div className="flex items-center space-x-3 text-red-400">
            <Shield className="h-8 w-8" />
            <h2 className="text-xl font-semibold">Security Alert</h2>
          </div>

          <div className="space-y-4 text-slate-600">
            <p className="text-lg">
              This incident has been logged and reported to our security team.
            </p>

            <div className="flex items-center space-x-2 text-yellow-400">
              <Lock className="h-5 w-5" />
              <span>Security measures active</span>
            </div>

            <div className="space-y-2 rounded bg-slate-900/50 p-4">
              <p className="font-mono text-sm text-slate-300">
                Error Code: 403
              </p>
              <p className="font-mono text-sm text-slate-300">
                Timestamp: {new Date().toISOString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="space-y-4 text-slate-800">
          <h3 className="text-lg font-medium">What you can do:</h3>
          <ul className="list-disc space-y-2 pl-5">
            <li>Verify you are using an authorized network connection</li>
            <li>
              Contact your system administrator if you believe this is an error
            </li>
            <li>Try accessing from an approved IP address</li>
          </ul>
        </div>

        {/* Support Contact */}
        <div className="text-center text-slate-600">
          <p>Need assistance? Contact IT Support</p>
        </div>
      </div>
    </div>
  )
}

export default AccessDeniedPage
