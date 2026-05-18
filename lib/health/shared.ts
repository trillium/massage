import { NextResponse } from 'next/server'

export type OverallStatus = 'ok' | 'degraded' | 'error'

export function getBuildInfo() {
  return {
    sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? 'unknown',
    message: process.env.VERCEL_GIT_COMMIT_MESSAGE?.slice(0, 80) ?? '',
  }
}

export function healthResponse(body: Record<string, unknown>, status: number = 200) {
  return NextResponse.json(
    { ...body, build: getBuildInfo(), timestamp: new Date().toISOString() },
    { status }
  )
}

export function errorResponse(error: unknown, context?: Record<string, unknown>) {
  return healthResponse(
    {
      ok: false,
      error: error instanceof Error ? error.message : 'unknown error',
      ...context,
    },
    500
  )
}
