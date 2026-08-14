'use client';

import { Fragment, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  RiAddLine,
  RiCheckLine,
  RiChatSmile2Line,
  RiFlashlightLine,
  RiPencilLine,
  RiWhatsappLine,
} from '@remixicon/react';
import * as Button from '@/components/ui/button';
import * as CompactButton from '@/components/ui/compact-button';
import * as StatusBadge from '@/components/ui/status-badge';
import * as Switch from '@/components/ui/switch';
import * as TabMenu from '@/components/ui/tab-menu-horizontal';
import * as Table from '@/components/ui/table';
import {
  completeTaskAction,
  createWorkflowAction,
  toggleWorkflowAction,
} from '@/lib/actions/automations';
import { triggerLabel } from '@/lib/automations';
import { toWhatsAppUrl } from '@/lib/phone';
import type { Task, Workflow } from '@/lib/types/automation';
import type { User } from '@/lib/types/seed';

type SeedRef = { id: string; name: string; phone: string };

type AutomacoesViewProps = {
  tasks: Task[];
  workflows: Workflow[];
  seeds: SeedRef[];
  users: User[];
};

export function AutomacoesView({
  tasks,
  workflows,
  seeds,
  users,
}: AutomacoesViewProps) {
  const seedById = new Map(seeds.map((seed) => [seed.id, seed]));
  const userById = new Map(users.map((user) => [user.id, user]));

  return (
    <TabMenu.Root defaultValue='tarefas'>
      <TabMenu.List className='mb-5'>
        <TabMenu.Trigger value='tarefas'>
          <TabMenu.Icon as={RiChatSmile2Line} />
          Tarefas
        </TabMenu.Trigger>
        <TabMenu.Trigger value='fluxos'>
          <TabMenu.Icon as={RiFlashlightLine} />
          Fluxos
        </TabMenu.Trigger>
      </TabMenu.List>

      <TabMenu.Content value='tarefas'>
        <TarefasPanel tasks={tasks} seedById={seedById} userById={userById} />
      </TabMenu.Content>

      <TabMenu.Content value='fluxos'>
        <FluxosPanel workflows={workflows} />
      </TabMenu.Content>
    </TabMenu.Root>
  );
}

function TarefasPanel({
  tasks,
  seedById,
  userById,
}: {
  tasks: Task[];
  seedById: Map<string, SeedRef>;
  userById: Map<string, User>;
}) {
  if (tasks.length === 0) {
    return (
      <div className='rounded-20 border border-dashed border-stroke-soft-200 px-6 py-12 text-center'>
        <p className='text-paragraph-sm text-text-sub-600'>
          Nenhuma tarefa pendente. As mensagens aparecem aqui assim que um fluxo
          dispara.
        </p>
      </div>
    );
  }

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Semente</Table.Head>
          <Table.Head>Mensagem</Table.Head>
          <Table.Head>Responsável</Table.Head>
          <Table.Head>Prazo</Table.Head>
          <Table.Head className='text-right'>Ações</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {tasks.map((task, index) => (
          <Fragment key={task.id}>
            {index > 0 ? <Table.RowDivider /> : null}
            <TaskRow
              task={task}
              seed={seedById.get(task.seedId)}
              assignee={task.assigneeId ? userById.get(task.assigneeId) : undefined}
            />
          </Fragment>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

function TaskRow({
  task,
  seed,
  assignee,
}: {
  task: Task;
  seed?: SeedRef;
  assignee?: User;
}) {
  const [isPending, startTransition] = useTransition();

  function complete(replied: boolean) {
    startTransition(() => {
      void completeTaskAction(task.id, replied);
    });
  }

  return (
    <Table.Row>
      <Table.Cell>
        <span className='text-label-sm text-text-strong-950'>
          {seed?.name ?? '—'}
        </span>
      </Table.Cell>
      <Table.Cell>
        <span className='text-paragraph-sm text-text-sub-600'>
          {task.message}
        </span>
      </Table.Cell>
      <Table.Cell>
        <span className='text-paragraph-sm text-text-sub-600'>
          {assignee?.name ?? '—'}
        </span>
      </Table.Cell>
      <Table.Cell>
        <StatusBadge.Root variant='light' status='pending'>
          <StatusBadge.Dot />
          {format(new Date(task.dueAt), 'dd/MM/yyyy')}
        </StatusBadge.Root>
      </Table.Cell>
      <Table.Cell>
        <div className='flex items-center justify-end gap-2'>
          {seed ? (
            <CompactButton.Root
              variant='stroke'
              size='medium'
              aria-label={`WhatsApp de ${seed.name}`}
              onClick={() =>
                window.open(
                  toWhatsAppUrl(seed.phone),
                  '_blank',
                  'noopener,noreferrer',
                )
              }
            >
              <CompactButton.Icon as={RiWhatsappLine} />
            </CompactButton.Root>
          ) : null}
          <Button.Root
            variant='neutral'
            mode='stroke'
            size='xsmall'
            disabled={isPending}
            onClick={() => complete(true)}
          >
            <Button.Icon as={RiChatSmile2Line} />
            Respondeu
          </Button.Root>
          <Button.Root
            variant='primary'
            mode='lighter'
            size='xsmall'
            disabled={isPending}
            onClick={() => complete(false)}
          >
            <Button.Icon as={RiCheckLine} />
            Concluir
          </Button.Root>
        </div>
      </Table.Cell>
    </Table.Row>
  );
}

function FluxosPanel({ workflows }: { workflows: Workflow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function createFluxo() {
    startTransition(async () => {
      const id = await createWorkflowAction();
      router.push(`/automacoes/${id}`);
    });
  }

  return (
    <div className='space-y-3'>
      <div className='flex justify-end'>
        <Button.Root
          variant='primary'
          mode='filled'
          size='small'
          disabled={isPending}
          onClick={createFluxo}
        >
          <Button.Icon as={RiAddLine} />
          Novo fluxo
        </Button.Root>
      </div>

      {workflows.length === 0 ? (
        <div className='rounded-20 border border-dashed border-stroke-soft-200 px-6 py-12 text-center'>
          <p className='text-paragraph-sm text-text-sub-600'>
            Nenhum fluxo criado ainda.
          </p>
        </div>
      ) : (
        workflows.map((workflow) => (
          <FluxoCard key={workflow.id} workflow={workflow} />
        ))
      )}
    </div>
  );
}

function FluxoCard({ workflow }: { workflow: Workflow }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(workflow.enabled);
  const [, startTransition] = useTransition();
  const messageCount = workflow.blocks.filter(
    (block) => block.type === 'message',
  ).length;

  function toggle(next: boolean) {
    setEnabled(next);
    startTransition(() => {
      void toggleWorkflowAction(workflow.id, next);
    });
  }

  return (
    <div className='flex items-center justify-between gap-4 rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-4'>
      <div className='min-w-0 space-y-1'>
        <p className='text-label-sm text-text-strong-950'>{workflow.name}</p>
        <p className='text-paragraph-xs text-text-soft-400'>
          {triggerLabel(workflow.trigger)} · {messageCount}{' '}
          {messageCount === 1 ? 'mensagem' : 'mensagens'}
        </p>
      </div>
      <div className='flex shrink-0 items-center gap-3'>
        <Button.Root
          variant='neutral'
          mode='stroke'
          size='xsmall'
          onClick={() => router.push(`/automacoes/${workflow.id}`)}
        >
          <Button.Icon as={RiPencilLine} />
          Editar
        </Button.Root>
        <span className='text-paragraph-xs text-text-soft-400'>
          {enabled ? 'Ativo' : 'Pausado'}
        </span>
        <Switch.Root checked={enabled} onCheckedChange={toggle} />
      </div>
    </div>
  );
}
