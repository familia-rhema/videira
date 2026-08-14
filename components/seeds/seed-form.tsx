'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Hint from '@/components/ui/hint';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Radio from '@/components/ui/radio';
import * as Select from '@/components/ui/select';
import {
  createSeedAction,
  type CreateSeedState,
} from '@/lib/actions/seeds';
import {
  CELULA_GROUP_LABELS,
  CELULAS_DK,
  CELULAS_PADRAO,
} from '@/lib/celulas';
import { todayIsoDate } from '@/lib/marcos';
import {
  ABORDAGEM_TIPO_LABELS,
  ACEITOU_JESUS_LABELS,
  SEED_GENDER_LABELS,
  type AbordagemTipo,
  type AceitouJesus,
  type CreateSeedInput,
  type SeedGender,
  type User,
} from '@/lib/types/seed';
import { NeighborhoodCombobox } from '@/components/seeds/neighborhood-combobox';
import { cn } from '@/utils/cn';

type SeedFormProps = {
  users: User[];
  currentUser: User;
};

const STEPS = [
  {
    id: 1,
    title: 'Dados identificáveis',
    description: 'Informações básicas da pessoa abordada.',
  },
  {
    id: 2,
    title: 'Dados da abordagem',
    description: 'Quando, onde e como a abordagem aconteceu.',
  },
  {
    id: 3,
    title: 'Dados sensíveis',
    description: 'Decisões espirituais e encaminhamento para célula.',
  },
] as const;

const GENDER_OPTIONS = Object.entries(SEED_GENDER_LABELS) as Array<
  [SeedGender, string]
>;

const ABORDAGEM_OPTIONS = Object.entries(ABORDAGEM_TIPO_LABELS) as Array<
  [AbordagemTipo, string]
>;

const ACEITOU_JESUS_OPTIONS = Object.entries(ACEITOU_JESUS_LABELS) as Array<
  [AceitouJesus, string]
>;

const STEP_FIELD_MAP: Record<number, Array<keyof CreateSeedInput>> = {
  1: ['name', 'phone', 'neighborhood', 'gender'],
  2: ['abordadorId', 'abordagemData', 'abordagemLocal', 'abordagemTipo'],
  3: ['aceitouJesus', 'direcionadoCelula', 'celulaEncaminhada'],
};

const initialState: CreateSeedState = {};

function getStepForField(field: keyof CreateSeedInput) {
  for (const [step, fields] of Object.entries(STEP_FIELD_MAP)) {
    if (fields.includes(field)) {
      return Number(step);
    }
  }

  return 1;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button.Root
      type='submit'
      variant='primary'
      mode='filled'
      className='w-full sm:w-auto'
      disabled={pending}
    >
      {pending ? 'Cadastrando...' : 'Cadastrar semente'}
    </Button.Root>
  );
}

export function SeedForm({ users, currentUser }: SeedFormProps) {
  const [state, formAction] = useActionState(createSeedAction, initialState);
  const [step, setStep] = useState(1);
  const [localErrors, setLocalErrors] = useState<
    Partial<Record<keyof CreateSeedInput, string>>
  >({});
  const [abordadorId, setAbordadorId] = useState(currentUser.id);
  const [gender, setGender] = useState<SeedGender | ''>('');
  const [abordagemTipo, setAbordagemTipo] = useState<AbordagemTipo | ''>('');
  const [aceitouJesus, setAceitouJesus] = useState<AceitouJesus | ''>('');
  const [direcionadoCelula, setDirecionadoCelula] = useState<'sim' | 'nao' | ''>(
    '',
  );
  const [celulaEncaminhada, setCelulaEncaminhada] = useState('');
  const isVoluntario = currentUser.role === 'voluntario';

  const fieldErrors = useMemo(
    () => ({ ...localErrors, ...state.fieldErrors }),
    [localErrors, state.fieldErrors],
  );

  useEffect(() => {
    if (!state.fieldErrors) {
      return;
    }

    const firstField = Object.keys(state.fieldErrors)[0] as
      | keyof CreateSeedInput
      | undefined;

    if (firstField) {
      setStep(getStepForField(firstField));
    }
  }, [state.fieldErrors]);

  function validateStep(currentStep: number) {
    const errors: Partial<Record<keyof CreateSeedInput, string>> = {};

    if (currentStep === 1) {
      const nameInput = document.getElementById('name') as HTMLInputElement | null;
      const phoneInput = document.getElementById('phone') as HTMLInputElement | null;

      if (!nameInput?.value.trim()) {
        errors.name = 'Informe o nome da semente.';
      }

      if (!phoneInput?.value.trim()) {
        errors.phone = 'Informe o telefone / WhatsApp.';
      }
    }

    if (currentStep === 2) {
      const abordagemDataInput = document.getElementById(
        'abordagemData',
      ) as HTMLInputElement | null;
      const abordagemLocalInput = document.getElementById(
        'abordagemLocal',
      ) as HTMLInputElement | null;

      if (!abordadorId) {
        errors.abordadorId = 'Selecione quem fez a abordagem.';
      }

      if (!abordagemDataInput?.value.trim()) {
        errors.abordagemData = 'Informe a data da abordagem.';
      }

      if (!abordagemLocalInput?.value.trim()) {
        errors.abordagemLocal = 'Informe o local da abordagem.';
      }

      if (!abordagemTipo) {
        errors.abordagemTipo = 'Selecione o tipo de abordagem.';
      }
    }

    if (currentStep === 3) {
      if (!aceitouJesus) {
        errors.aceitouJesus =
          'Informe se a pessoa aceitou Jesus ou se reconciliou.';
      }

      if (!direcionadoCelula) {
        errors.direcionadoCelula =
          'Informe se a pessoa foi encaminhada para uma célula.';
      } else if (direcionadoCelula === 'sim' && !celulaEncaminhada) {
        errors.celulaEncaminhada = 'Selecione a célula de encaminhamento.';
      }
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleContinue() {
    if (validateStep(step)) {
      setLocalErrors({});
      setStep((current) => Math.min(current + 1, STEPS.length));
    }
  }

  function handleBack() {
    setLocalErrors({});
    setStep((current) => Math.max(current - 1, 1));
  }

  const showCelulaFields = direcionadoCelula === 'sim';
  const currentStep = STEPS[step - 1];

  return (
    <form action={formAction} className='mx-auto w-full max-w-lg space-y-5'>
      <div className='space-y-1'>
        <h1 className='text-title-h5 text-text-strong-950'>Nova semente</h1>
        <p className='text-paragraph-sm text-text-sub-600'>
          Cadastro em etapas para uso na rua ou na igreja.
        </p>
      </div>

      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          {STEPS.map((item) => (
            <div
              key={item.id}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                item.id <= step ? 'bg-primary-base' : 'bg-stroke-soft-200',
              )}
            />
          ))}
        </div>
        <div>
          <p className='text-label-sm text-text-strong-950'>
            {currentStep.title}
          </p>
          <p className='text-paragraph-xs text-text-sub-600'>
            Passo {step} de {STEPS.length} · {currentStep.description}
          </p>
        </div>
      </div>

      {state.error ? (
        <div className='rounded-10 bg-error-lighter px-3 py-2 text-paragraph-sm text-error-base'>
          {state.error}
        </div>
      ) : null}

      <input type='hidden' name='abordadorId' value={abordadorId} />
      <input type='hidden' name='gender' value={gender} />
      <input type='hidden' name='abordagemTipo' value={abordagemTipo} />
      <input type='hidden' name='aceitouJesus' value={aceitouJesus} />
      <input type='hidden' name='direcionadoCelula' value={direcionadoCelula} />
      <input
        type='hidden'
        name='celulaEncaminhada'
        value={showCelulaFields ? celulaEncaminhada : ''}
      />

      <div className='space-y-4 rounded-20 border border-stroke-soft-200 bg-bg-white-0 p-4 sm:p-5'>
        {step === 1 ? (
          <>
            <div className='space-y-1'>
              <Label.Root htmlFor='name'>
                Nome <Label.Asterisk />
              </Label.Root>
              <Input.Root hasError={Boolean(fieldErrors.name)}>
                <Input.Wrapper>
                  <Input.Input
                    id='name'
                    name='name'
                    placeholder='Nome completo'
                  />
                </Input.Wrapper>
              </Input.Root>
              {fieldErrors.name ? (
                <Hint.Root hasError>{fieldErrors.name}</Hint.Root>
              ) : null}
            </div>

            <div className='space-y-1'>
              <Label.Root htmlFor='phone'>
                Telefone / WhatsApp <Label.Asterisk />
              </Label.Root>
              <Input.Root hasError={Boolean(fieldErrors.phone)}>
                <Input.Wrapper>
                  <Input.Input
                    id='phone'
                    name='phone'
                    type='tel'
                    inputMode='tel'
                    placeholder='(11) 98765-4321'
                  />
                </Input.Wrapper>
              </Input.Root>
              {fieldErrors.phone ? (
                <Hint.Root hasError>{fieldErrors.phone}</Hint.Root>
              ) : (
                <Hint.Root>Canal principal de consolidação.</Hint.Root>
              )}
            </div>

            <div className='space-y-1'>
              <Label.Root htmlFor='neighborhood'>Bairro</Label.Root>
              <NeighborhoodCombobox
                id='neighborhood'
                name='neighborhood'
                placeholder='Buscar bairro de São Gonçalo…'
              />
              <Hint.Root>Digite para filtrar os bairros oficiais.</Hint.Root>
            </div>

            <div className='space-y-1'>
              <Label.Root htmlFor='gender'>Sexo</Label.Root>
              <Select.Root
                value={gender}
                onValueChange={(value) => setGender(value as SeedGender)}
              >
                <Select.Trigger id='gender'>
                  <Select.Value placeholder='Selecione o sexo' />
                </Select.Trigger>
                <Select.Content>
                  {GENDER_OPTIONS.map(([value, label]) => (
                    <Select.Item key={value} value={value}>
                      {label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <Hint.Root>Usado para montar grupos de acompanhamento.</Hint.Root>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className='space-y-1'>
              <Label.Root htmlFor='abordagemData'>
                Data <Label.Asterisk />
              </Label.Root>
              <Input.Root hasError={Boolean(fieldErrors.abordagemData)}>
                <Input.Wrapper>
                  <Input.Input
                    id='abordagemData'
                    name='abordagemData'
                    type='date'
                    defaultValue={todayIsoDate()}
                    max={todayIsoDate()}
                    required
                  />
                </Input.Wrapper>
              </Input.Root>
              {fieldErrors.abordagemData ? (
                <Hint.Root hasError>{fieldErrors.abordagemData}</Hint.Root>
              ) : (
                <Hint.Root>Data em que a abordagem aconteceu.</Hint.Root>
              )}
            </div>

            <div className='space-y-1'>
              <Label.Root htmlFor='abordagemLocal'>
                Local <Label.Asterisk />
              </Label.Root>
              <Input.Root hasError={Boolean(fieldErrors.abordagemLocal)}>
                <Input.Wrapper>
                  <Input.Input
                    id='abordagemLocal'
                    name='abordagemLocal'
                    placeholder='Ex.: Largo da Ideia, culto dominical…'
                  />
                </Input.Wrapper>
              </Input.Root>
              {fieldErrors.abordagemLocal ? (
                <Hint.Root hasError>{fieldErrors.abordagemLocal}</Hint.Root>
              ) : null}
            </div>

            <div className='space-y-1'>
              <Label.Root htmlFor='abordagemTipo'>
                Tipo de abordagem <Label.Asterisk />
              </Label.Root>
              <Select.Root
                value={abordagemTipo}
                onValueChange={(value) =>
                  setAbordagemTipo(value as AbordagemTipo)
                }
                hasError={Boolean(fieldErrors.abordagemTipo)}
              >
                <Select.Trigger id='abordagemTipo'>
                  <Select.Value placeholder='Selecione o tipo' />
                </Select.Trigger>
                <Select.Content>
                  {ABORDAGEM_OPTIONS.map(([value, label]) => (
                    <Select.Item key={value} value={value}>
                      {label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              {fieldErrors.abordagemTipo ? (
                <Hint.Root hasError>{fieldErrors.abordagemTipo}</Hint.Root>
              ) : null}
            </div>

            {isVoluntario ? null : (
              <div className='space-y-1'>
                <Label.Root htmlFor='abordadorId'>
                  Nome de quem fez a abordagem <Label.Asterisk />
                </Label.Root>
                <Select.Root
                  value={abordadorId}
                  onValueChange={setAbordadorId}
                  hasError={Boolean(fieldErrors.abordadorId)}
                >
                  <Select.Trigger id='abordadorId'>
                    <Select.Value placeholder='Selecione o abordador' />
                  </Select.Trigger>
                  <Select.Content>
                    {users.map((user) => (
                      <Select.Item key={user.id} value={user.id}>
                        {user.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                {fieldErrors.abordadorId ? (
                  <Hint.Root hasError>{fieldErrors.abordadorId}</Hint.Root>
                ) : (
                  <Hint.Root>
                    Quem abordou a pessoa. Por padrão, vira também o regador.
                  </Hint.Root>
                )}
              </div>
            )}
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div className='space-y-2'>
              <Label.Root>
                Aceitou Jesus ou reconciliou? <Label.Asterisk />
              </Label.Root>
              <Radio.Group
                value={aceitouJesus}
                onValueChange={(value) => setAceitouJesus(value as AceitouJesus)}
                className='flex flex-col gap-2'
              >
                {ACEITOU_JESUS_OPTIONS.map(([value, label]) => (
                  <label
                    key={value}
                    className='flex items-center gap-2.5 text-paragraph-sm text-text-strong-950'
                  >
                    <Radio.Item value={value} />
                    {label}
                  </label>
                ))}
              </Radio.Group>
              {fieldErrors.aceitouJesus ? (
                <Hint.Root hasError>{fieldErrors.aceitouJesus}</Hint.Root>
              ) : null}
            </div>

            <div className='space-y-2'>
              <Label.Root>
                Encaminhado pra uma célula? <Label.Asterisk />
              </Label.Root>
              <Radio.Group
                value={direcionadoCelula}
                onValueChange={(value) => {
                  setDirecionadoCelula(value as 'sim' | 'nao');
                  if (value !== 'sim') {
                    setCelulaEncaminhada('');
                  }
                }}
                className='flex flex-col gap-2'
              >
                <label className='flex items-center gap-2.5 text-paragraph-sm text-text-strong-950'>
                  <Radio.Item value='nao' />
                  Não
                </label>
                <label className='flex items-center gap-2.5 text-paragraph-sm text-text-strong-950'>
                  <Radio.Item value='sim' />
                  Sim
                </label>
              </Radio.Group>
              {fieldErrors.direcionadoCelula ? (
                <Hint.Root hasError>{fieldErrors.direcionadoCelula}</Hint.Root>
              ) : null}
            </div>

            {showCelulaFields ? (
              <div className='space-y-1'>
                <Label.Root htmlFor='celulaEncaminhada'>
                  Célula de encaminhamento <Label.Asterisk />
                </Label.Root>
                <Select.Root
                  value={celulaEncaminhada}
                  onValueChange={setCelulaEncaminhada}
                  hasError={Boolean(fieldErrors.celulaEncaminhada)}
                >
                  <Select.Trigger id='celulaEncaminhada'>
                    <Select.Value placeholder='Selecione a célula' />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Group>
                      <Select.GroupLabel>
                        {CELULA_GROUP_LABELS.dk}
                      </Select.GroupLabel>
                      {CELULAS_DK.map((celula) => (
                        <Select.Item key={celula.value} value={celula.value}>
                          {celula.label}
                        </Select.Item>
                      ))}
                    </Select.Group>
                    <Select.Group>
                      <Select.GroupLabel>
                        {CELULA_GROUP_LABELS.padrao}
                      </Select.GroupLabel>
                      {CELULAS_PADRAO.map((celula) => (
                        <Select.Item key={celula.value} value={celula.value}>
                          {celula.label}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
                {fieldErrors.celulaEncaminhada ? (
                  <Hint.Root hasError>{fieldErrors.celulaEncaminhada}</Hint.Root>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-between'>
        <Button.Root variant='neutral' mode='stroke' asChild>
          <Link href='/sementes'>Cancelar</Link>
        </Button.Root>

        <div className='flex flex-col-reverse gap-3 sm:flex-row'>
          {step > 1 ? (
            <Button.Root
              type='button'
              variant='neutral'
              mode='ghost'
              onClick={handleBack}
            >
              Voltar
            </Button.Root>
          ) : null}

          {step < STEPS.length ? (
            <Button.Root
              type='button'
              variant='primary'
              mode='filled'
              onClick={handleContinue}
            >
              Continuar
            </Button.Root>
          ) : (
            <SubmitButton />
          )}
        </div>
      </div>
    </form>
  );
}
