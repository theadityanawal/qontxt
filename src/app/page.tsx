// src/app/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl text-center px-4">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Create AI-powered resumes tailored for your dream jobs
        </h1>

        <p className="mt-6 text-lg leading-8 text-gray-600">
          qontxt helps you craft the perfect resume for each job application by
          highlighting your most relevant experiences and skills.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/login">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center">
            <div className="rounded-lg bg-blue-50 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">AI-Powered</h3>
            <p className="mt-1 text-sm text-gray-500">Smart content optimization</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="rounded-lg bg-green-50 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">Easy to Use</h3>
            <p className="mt-1 text-sm text-gray-500">Simple editing interface</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="rounded-lg bg-purple-50 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">Analytics</h3>
            <p className="mt-1 text-sm text-gray-500">Track application success</p>
          </div>
        </div>
      </div>
    </div>
  );
}
