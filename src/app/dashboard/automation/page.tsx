import { Metadata } from 'next';
import { WorkflowBuilder } from '@/components/automation/workflow-builder';
import { ProtectedRoute } from '@/components/auth/protected-route';
import DashboardLayout from '@/components/layout/dashboard-layout';

export const metadata: Metadata = {
  title: '자동화 워크플로우 - Kloser',
  description: '조건부 이벤트 트리거와 자동화 규칙을 설정하세요.',
};

export default function AutomationPage() {
  return (
    <ProtectedRoute requireAuth={true} requireOrg={true}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">자동화 워크플로우</h1>
            <p className="text-gray-600 mt-2">
              조건부 이벤트 트리거와 자동화 규칙을 설정하여 업무 효율성을 높이세요.
            </p>
          </div>
          
          <WorkflowBuilder />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
