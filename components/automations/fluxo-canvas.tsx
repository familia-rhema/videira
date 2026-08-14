'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  RiAddLine,
  RiArrowLeftLine,
  RiChatSmile2Line,
  RiCloseLine,
  RiDeleteBinLine,
  RiErrorWarningLine,
  RiFocus3Line,
  RiSubtractLine,
  RiTimeLine,
  RiZoomInLine,
} from '@remixicon/react';
import * as Button from '@/components/ui/button';
import * as CompactButton from '@/components/ui/compact-button';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as Switch from '@/components/ui/switch';
import * as Textarea from '@/components/ui/textarea';
import { saveWorkflowAction } from '@/lib/actions/automations';
import { delayLabel, triggerLabel } from '@/lib/automations';
import { MARCOS, type MarcoType } from '@/lib/marcos';
import type {
  Workflow,
  WorkflowBlock,
  WorkflowTrigger,
} from '@/lib/types/automation';
import { cn } from '@/utils/cn';

const NODE_W = 280;
const MIN_SCALE = 0.3;
const MAX_SCALE = 2;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function makeBlock(type: WorkflowBlock['type']): WorkflowBlock {
  return type === 'delay'
    ? { id: crypto.randomUUID(), type: 'delay', days: 1 }
    : { id: crypto.randomUUID(), type: 'message', text: '', onlyIfNoReply: false };
}

type Selection = 'trigger' | string | null;
type AddMenu = { afterId: string; x: number; y: number } | null;

export function FluxoCanvas({ workflow }: { workflow: Workflow }) {
  const router = useRouter();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isSaving, startSaving] = useTransition();

  const [name, setName] = useState(workflow.name);
  const [trigger, setTrigger] = useState<WorkflowTrigger>(workflow.trigger);
  const [blocks, setBlocks] = useState<WorkflowBlock[]>(workflow.blocks);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState({ x: 0, y: 120, scale: 1 });
  const [selected, setSelected] = useState<Selection>('trigger');
  const [addMenu, setAddMenu] = useState<AddMenu>(null);

  // center the column horizontally on mount
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (el) setView((v) => ({ ...v, x: (el.clientWidth - NODE_W) / 2 }));
  }, []);

  const touch = useCallback(() => {
    setDirty(true);
    setError(null);
  }, []);

  function updateBlock(id: string, patch: Partial<WorkflowBlock>) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? ({ ...b, ...patch } as WorkflowBlock) : b)),
    );
    touch();
  }

  function insertBlock(afterId: string, type: WorkflowBlock['type']) {
    const block = makeBlock(type);
    setBlocks((prev) => {
      if (afterId === 'trigger') return [block, ...prev];
      const index = prev.findIndex((b) => b.id === afterId);
      const next = [...prev];
      next.splice(index + 1, 0, block);
      return next;
    });
    setSelected(block.id);
    setAddMenu(null);
    touch();
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelected(null);
    touch();
  }

  function publish() {
    setError(null);
    startSaving(async () => {
      const result = await saveWorkflowAction({
        id: workflow.id,
        name: name.trim() || 'Novo fluxo',
        enabled: true,
        trigger,
        blocks,
      });
      if ('error' in result && result.error) {
        setError(result.error);
        return;
      }
      setDirty(false);
      router.refresh();
    });
  }

  // zoom (Cmd/Ctrl + wheel, to cursor) / pan (wheel) — native listener for preventDefault
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        const rect = el!.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        setView((v) => {
          const scale = clamp(v.scale * (1 - e.deltaY * 0.002), MIN_SCALE, MAX_SCALE);
          const k = scale / v.scale;
          return { scale, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
        });
      } else {
        e.preventDefault();
        setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // drag-to-pan on the background
  function startPan(e: React.PointerEvent) {
    if (e.button !== 0) return;
    const start = { x: e.clientX, y: e.clientY };
    const origin = { x: view.x, y: view.y };
    setSelected(null);
    function move(ev: PointerEvent) {
      setView((v) => ({
        ...v,
        x: origin.x + (ev.clientX - start.x),
        y: origin.y + (ev.clientY - start.y),
      }));
    }
    function up() {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  function zoomBy(factor: number) {
    const el = viewportRef.current;
    const px = el ? el.clientWidth / 2 : 0;
    const py = el ? el.clientHeight / 2 : 0;
    setView((v) => {
      const scale = clamp(v.scale * factor, MIN_SCALE, MAX_SCALE);
      const k = scale / v.scale;
      return { scale, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });
  }

  const selectedBlock = blocks.find((b) => b.id === selected) ?? null;

  return (
    <div className='relative flex h-full w-full flex-col overflow-hidden'>
      {/* top bar */}
      <div className='z-20 flex items-center gap-2 border-b border-stroke-soft-200 px-4 py-3'>
        <CompactButton.Root variant='ghost' size='large' asChild>
          <Link href='/automacoes' aria-label='Voltar'>
            <CompactButton.Icon as={RiArrowLeftLine} />
          </Link>
        </CompactButton.Root>
        <Input.Root size='small' className='w-64'>
          <Input.Wrapper>
            <Input.Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                touch();
              }}
              placeholder='Nome do fluxo'
            />
          </Input.Wrapper>
        </Input.Root>
        <div className='ml-auto flex items-center gap-3'>
          {dirty ? (
            <span className='text-paragraph-xs text-text-soft-400'>
              Alterações não publicadas
            </span>
          ) : null}
          <Button.Root
            variant='primary'
            mode='filled'
            size='small'
            disabled={isSaving || !dirty}
            onClick={publish}
          >
            {isSaving ? 'Publicando...' : 'Publicar alterações'}
          </Button.Root>
        </div>
      </div>

      {error ? (
        <div className='z-20 bg-error-lighter px-4 py-2 text-paragraph-sm text-error-base'>
          {error}
        </div>
      ) : null}

      {/* canvas */}
      <div ref={viewportRef} className='relative min-h-0 flex-1 overflow-hidden'>
        <div
          data-canvas-bg
          onPointerDown={startPan}
          className='absolute inset-0 cursor-grab active:cursor-grabbing'
          style={{
            backgroundImage:
              'radial-gradient(var(--bg-soft-200, #e1e4ea) 1px, transparent 1px)',
            backgroundSize: `${24 * view.scale}px ${24 * view.scale}px`,
            backgroundPosition: `${view.x}px ${view.y}px`,
          }}
        />

        <div
          className='absolute left-0 top-0 origin-top-left'
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
        >
          <div className='flex flex-col items-center' style={{ width: NODE_W }}>
            <TriggerNode
              trigger={trigger}
              selected={selected === 'trigger'}
              onSelect={() => setSelected('trigger')}
            />
            <Connector
              onAdd={(e) =>
                setAddMenu({ afterId: 'trigger', x: e.clientX, y: e.clientY })
              }
            />
            {blocks.map((block) => (
              <div key={block.id} className='flex flex-col items-center'>
                <BlockNode
                  block={block}
                  selected={selected === block.id}
                  onSelect={() => setSelected(block.id)}
                />
                <Connector
                  onAdd={(e) =>
                    setAddMenu({ afterId: block.id, x: e.clientX, y: e.clientY })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* zoom controls */}
        <div className='absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-1.5 py-1 shadow-regular-md'>
          <CompactButton.Root
            variant='ghost'
            size='medium'
            aria-label='Diminuir zoom'
            onClick={() => zoomBy(1 / 1.2)}
          >
            <CompactButton.Icon as={RiSubtractLine} />
          </CompactButton.Root>
          <span className='w-12 text-center text-label-xs text-text-sub-600'>
            {Math.round(view.scale * 100)}%
          </span>
          <CompactButton.Root
            variant='ghost'
            size='medium'
            aria-label='Aumentar zoom'
            onClick={() => zoomBy(1.2)}
          >
            <CompactButton.Icon as={RiAddLine} />
          </CompactButton.Root>
          <CompactButton.Root
            variant='ghost'
            size='medium'
            aria-label='Resetar zoom'
            onClick={() =>
              setView((v) => ({ ...v, scale: 1 }))
            }
          >
            <CompactButton.Icon as={RiZoomInLine} />
          </CompactButton.Root>
        </div>
      </div>

      {addMenu ? (
        <AddBlockMenu
          x={addMenu.x}
          y={addMenu.y}
          onPick={(type) => insertBlock(addMenu.afterId, type)}
          onClose={() => setAddMenu(null)}
        />
      ) : null}

      {selected ? (
        <ConfigPanel
          trigger={trigger}
          block={selectedBlock}
          isTrigger={selected === 'trigger'}
          onTriggerChange={(t) => {
            setTrigger(t);
            touch();
          }}
          onBlockChange={updateBlock}
          onRemove={() => selectedBlock && removeBlock(selectedBlock.id)}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}

function NodeCard({
  children,
  selected,
  onSelect,
}: {
  children: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type='button'
      data-node
      onClick={onSelect}
      onPointerDown={(e) => e.stopPropagation()}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border bg-bg-white-0 px-3.5 py-3 text-left shadow-regular-xs transition',
        selected
          ? 'border-primary-base ring-2 ring-primary-alpha-10'
          : 'border-stroke-soft-200 hover:border-stroke-sub-300',
      )}
    >
      {children}
    </button>
  );
}

function TriggerNode({
  trigger,
  selected,
  onSelect,
}: {
  trigger: WorkflowTrigger;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div className='w-full'>
      <span className='ml-2 inline-block rounded-t-lg bg-primary-alpha-10 px-2 py-0.5 text-label-xs text-primary-base'>
        Gatilho
      </span>
      <NodeCard selected={selected} onSelect={onSelect}>
        <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-alpha-10'>
          <RiFocus3Line className='size-5 text-primary-base' />
        </span>
        <span className='min-w-0 flex-1 truncate text-label-sm text-text-strong-950'>
          {triggerLabel(trigger)}
        </span>
      </NodeCard>
    </div>
  );
}

function BlockNode({
  block,
  selected,
  onSelect,
}: {
  block: WorkflowBlock;
  selected: boolean;
  onSelect: () => void;
}) {
  const isMessage = block.type === 'message';
  const empty = isMessage && !block.text.trim();

  return (
    <NodeCard selected={selected} onSelect={onSelect}>
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg',
          isMessage ? 'bg-information-lighter' : 'bg-warning-lighter',
        )}
      >
        {isMessage ? (
          <RiChatSmile2Line className='size-5 text-information-base' />
        ) : (
          <RiTimeLine className='size-5 text-warning-base' />
        )}
      </span>
      <span className='min-w-0 flex-1'>
        <span className='block text-label-xs text-text-soft-400'>
          {isMessage ? 'Mensagem' : 'Espera'}
        </span>
        <span className='block truncate text-label-sm text-text-strong-950'>
          {isMessage
            ? empty
              ? 'Mensagem vazia'
              : block.text
            : delayLabel(block.days)}
        </span>
      </span>
      {empty ? (
        <RiErrorWarningLine className='size-4 shrink-0 text-error-base' />
      ) : null}
    </NodeCard>
  );
}

function Connector({ onAdd }: { onAdd: (e: React.MouseEvent) => void }) {
  return (
    <div className='group relative flex h-12 w-full flex-col items-center justify-center'>
      <div className='h-full w-px bg-stroke-soft-200' />
      <button
        type='button'
        onClick={onAdd}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label='Adicionar bloco'
        className='absolute left-1/2 top-1/2 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 opacity-0 shadow-regular-xs transition hover:border-primary-base hover:text-primary-base group-hover:opacity-100'
      >
        <RiAddLine className='size-4' />
      </button>
    </div>
  );
}

function AddBlockMenu({
  x,
  y,
  onPick,
  onClose,
}: {
  x: number;
  y: number;
  onPick: (type: WorkflowBlock['type']) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className='fixed inset-0 z-30' onClick={onClose} />
      <div
        className='fixed z-40 w-52 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-regular-md'
        style={{ left: x, top: y }}
      >
        <MenuItem icon={RiChatSmile2Line} label='Mensagem' onClick={() => onPick('message')} />
        <MenuItem icon={RiTimeLine} label='Espera' onClick={() => onPick('delay')} />
      </div>
    </>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof RiTimeLine;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-label-sm text-text-strong-950 transition hover:bg-bg-weak-50'
    >
      <Icon className='size-4 text-text-sub-600' />
      {label}
    </button>
  );
}

function ConfigPanel({
  trigger,
  block,
  isTrigger,
  onTriggerChange,
  onBlockChange,
  onRemove,
  onClose,
}: {
  trigger: WorkflowTrigger;
  block: WorkflowBlock | null;
  isTrigger: boolean;
  onTriggerChange: (t: WorkflowTrigger) => void;
  onBlockChange: (id: string, patch: Partial<WorkflowBlock>) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  return (
    <div className='absolute right-0 top-0 z-20 flex h-full w-[360px] flex-col border-l border-stroke-soft-200 bg-bg-white-0 shadow-regular-md'>
      <div className='flex items-center gap-2 border-b border-stroke-soft-200 p-4'>
        <span className='flex-1 text-label-lg text-text-strong-950'>
          {isTrigger ? 'Gatilho' : block?.type === 'delay' ? 'Espera' : 'Mensagem'}
        </span>
        <CompactButton.Root variant='ghost' size='medium' onClick={onClose}>
          <CompactButton.Icon as={RiCloseLine} />
        </CompactButton.Root>
      </div>

      <div className='flex-1 space-y-5 overflow-y-auto p-4'>
        {isTrigger ? (
          <div className='space-y-2'>
            <Label.Root>Quando acontecer</Label.Root>
            <Select.Root
              value={trigger.type}
              onValueChange={(value) =>
                onTriggerChange(
                  value === 'milestone_reached'
                    ? { type: 'milestone_reached', marco: 'any' }
                    : { type: 'seed_added' },
                )
              }
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value='seed_added'>Semente cadastrada</Select.Item>
                <Select.Item value='milestone_reached'>Marco registrado</Select.Item>
              </Select.Content>
            </Select.Root>

            {trigger.type === 'milestone_reached' ? (
              <Select.Root
                value={trigger.marco}
                onValueChange={(value) =>
                  onTriggerChange({
                    type: 'milestone_reached',
                    marco: value as MarcoType | 'any',
                  })
                }
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value='any'>Qualquer marco</Select.Item>
                  {MARCOS.map((marco) => (
                    <Select.Item key={marco.type} value={marco.type}>
                      {marco.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            ) : null}
          </div>
        ) : null}

        {block?.type === 'message' ? (
          <>
            <div className='space-y-2'>
              <Label.Root>Mensagem</Label.Root>
              <Textarea.Root
                simple
                value={block.text}
                onChange={(e) => onBlockChange(block.id, { text: e.target.value })}
                placeholder='Mensagem que o consolidador vai enviar...'
              />
            </div>
            <label className='flex items-center gap-2'>
              <Switch.Root
                checked={block.onlyIfNoReply}
                onCheckedChange={(checked) =>
                  onBlockChange(block.id, { onlyIfNoReply: checked })
                }
              />
              <span className='text-paragraph-sm text-text-sub-600'>
                Só enviar se a semente não respondeu
              </span>
            </label>
          </>
        ) : null}

        {block?.type === 'delay' ? (
          <div className='space-y-2'>
            <Label.Root htmlFor='delay-days'>Esperar (dias)</Label.Root>
            <Input.Root className='w-28'>
              <Input.Wrapper>
                <Input.Input
                  id='delay-days'
                  type='number'
                  min={0}
                  value={block.days}
                  onChange={(e) =>
                    onBlockChange(block.id, { days: Number(e.target.value) })
                  }
                />
              </Input.Wrapper>
            </Input.Root>
          </div>
        ) : null}
      </div>

      {block ? (
        <div className='border-t border-stroke-soft-200 p-4'>
          <Button.Root
            variant='error'
            mode='stroke'
            size='small'
            className='w-full'
            onClick={onRemove}
          >
            <Button.Icon as={RiDeleteBinLine} />
            Remover bloco
          </Button.Root>
        </div>
      ) : null}
    </div>
  );
}
