import { notFound } from 'next/navigation';
import { getWorkflow } from '@/lib/store/automations';
import { FluxoCanvas } from '@/components/automations/fluxo-canvas';
import { getSessionUser } from '@/lib/auth/session';
import { requireAdminOrLider } from '@/lib/access';

export default async function FluxoEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const currentUser = await getSessionUser();
  requireAdminOrLider(currentUser);

  const { id } = await params;
  const workflow = await getWorkflow(id);
  if (!workflow) notFound();

  return <FluxoCanvas workflow={workflow} />;
}
