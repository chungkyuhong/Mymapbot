// app/api/dispatch/route.ts
// ============================================================
// Pricing & Policy Check API
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { calculateDynamicPrice } from '@/lib/dispatch-engine';
import { ApiResponse, PolicyCheckResult, TravelPolicy } from '@/types';

export const runtime = 'edge';

const DEFAULT_POLICY: TravelPolicy = {
  maxDailyTransport: 150000,
  maxHotelPerNight: 180000,
  allowedModes: ['drt', 'bus', 'ktx', 'subway', 'taxi'],
  requiresApprovalAbove: 100000,
  mealAllowance: 30000,
  preApprovalRequired: false,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'price') {
      const price = calculateDynamicPrice({
        distanceKm: body.distanceKm ?? 15,
        mode: body.mode ?? 'drt',
        pricingTier: body.pricingTier ?? 'normal',
        muPoints: body.muPoints ?? 0,
        passengerCount: body.passengerCount ?? 1,
      });
      return NextResponse.json<ApiResponse<typeof price>>({
        success: true,
        data: price,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'policy_check') {
      const { amount, mode, purpose } = body;
      const policy = DEFAULT_POLICY;
      const violations: string[] = [];
      const approvalChain: string[] = [];

      if (amount > policy.maxDailyTransport) {
        violations.push(`교통비 한도 초과 (한도: ${policy.maxDailyTransport.toLocaleString()}원)`);
      }
      if (!policy.allowedModes.includes(mode)) {
        violations.push(`허용되지 않는 이동수단: ${mode}`);
      }
      if (amount > policy.requiresApprovalAbove) {
        approvalChain.push('팀장 승인');
        if (amount > policy.requiresApprovalAbove * 2) {
          approvalChain.push('재무팀 승인');
        }
      }

      const result: PolicyCheckResult = {
        compliant: violations.length === 0,
        violations,
        requiresApproval: approvalChain.length > 0,
        approvalChain,
        estimatedReimbursement: violations.length === 0 ? amount : Math.min(amount, policy.maxDailyTransport),
      };

      return NextResponse.json<ApiResponse<PolicyCheckResult>>({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('[API/dispatch]', err);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '처리 중 오류가 발생했습니다',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
