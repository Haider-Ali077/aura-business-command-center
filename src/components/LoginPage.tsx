
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Shield, Zap, TrendingUp } from 'lucide-react';

export function LoginPage() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Intellyca</h1>
              <p className="text-gray-600">ERP Intelligence Platform</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Transform Your Business Intelligence
            </h2>
            <p className="text-xl text-gray-600">
              Powerful analytics, intuitive dashboards, and AI-driven insights to accelerate your business growth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Secure</h3>
                <p className="text-sm text-gray-600">Enterprise-grade security</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
              <Zap className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Fast</h3>
                <p className="text-sm text-gray-600">Real-time analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Growth</h3>
                <p className="text-sm text-gray-600">Data-driven decisions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Card */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2 pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to access your intelligent dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={() => loginWithRedirect()}
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                Sign In with Auth0
              </Button>
              
              <div className="text-center text-sm text-gray-500">
                Secure authentication powered by Auth0
              </div>
              
              <div className="border-t pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600 font-medium">Trusted by businesses worldwide</p>
                  <div className="flex justify-center items-center gap-2 text-xs text-gray-500">
                    <span>🔒 SOC2 Compliant</span>
                    <span>•</span>
                    <span>🌐 Global Scale</span>
                    <span>•</span>
                    <span>⚡ 99.9% Uptime</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
