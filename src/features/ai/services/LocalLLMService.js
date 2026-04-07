function parseGeneratedPlan(text) {
  const jsonBlock = text.match(/\{[\s\S]*\}/);

  if (!jsonBlock) {
    return null;
  }

  try {
    return JSON.parse(jsonBlock[0]);
  } catch {
    return null;
  }
}

function normalizeProcessSteps(processSteps, fallbackSteps) {
  if (Array.isArray(processSteps)) {
    return processSteps.filter(Boolean).slice(0, 5);
  }

  if (typeof processSteps === 'string') {
    return processSteps
      .split(/[,|]/)
      .map((step) => step.trim())
      .filter(Boolean)
      .slice(0, 5);
  }

  return fallbackSteps;
}

function normalizePlan(parsedPlan, fallbackPlan) {
  return {
    ...fallbackPlan,
    faceShape: parsedPlan.faceShape || fallbackPlan.faceShape,
    hairTexture: parsedPlan.hairTexture || fallbackPlan.hairTexture,
    compatibility: parsedPlan.compatibility || fallbackPlan.compatibility,
    advice: parsedPlan.advice || fallbackPlan.advice,
    barberBrief: parsedPlan.barberBrief || fallbackPlan.barberBrief,
    processSteps: normalizeProcessSteps(
      parsedPlan.processSteps,
      fallbackPlan.processSteps,
    ),
    source: 'local-llm',
  };
}

function buildLookPlanPrompt(input, fallbackPlan, profile) {
  return [
    'You are StyleShift, a local salon strategist.',
    `Runtime target: ${profile.displayName}.`,
    `Chosen style: ${input.style?.name}.`,
    `User vibe: ${input.vibe ?? 'undeclared'}.`,
    `Vision snapshot: ${JSON.stringify(input.visionSnapshot ?? { status: 'no-live-scan' })}.`,
    `Reference plan: ${JSON.stringify({
      faceShape: fallbackPlan.faceShape,
      hairTexture: fallbackPlan.hairTexture,
      compatibility: fallbackPlan.compatibility,
      barberBrief: fallbackPlan.barberBrief,
      technicalSummary: fallbackPlan.technicalSummary,
    })}.`,
    'Return strict JSON with keys: faceShape, hairTexture, compatibility, advice, barberBrief, processSteps.',
  ].join('\n');
}

export class LocalLLMService {
  constructor(profile) {
    this.profile = profile;
    this.generator = null;
    this.executionDevice = null;
  }

  async buildPipeline(device, onProgress = null) {
    const { env, pipeline } = await import('@xenova/transformers');

    env.useBrowserCache = true;
    env.allowLocalModels = false;
    env.allowRemoteModels = true;

    return pipeline(this.profile.task, this.profile.modelId, {
      device,
      dtype: this.profile.dtype,
      progress_callback: (progressInfo) => {
        if (onProgress && progressInfo.status === 'progress') {
          onProgress(progressInfo.progress);
        }
      },
    });
  }

  async warmup(onProgress = null) {
    if (this.generator) {
      return {
        status: 'ready',
        device: this.executionDevice,
        model: this.profile.displayName,
      };
    }

    if (!this.profile.isConfigured || !this.profile.modelId) {
      return {
        status: 'unconfigured',
        device: this.profile.preferredDevice,
        model: this.profile.displayName,
      };
    }

    const preferredDevice =
      typeof navigator !== 'undefined' && 'gpu' in navigator
        ? this.profile.preferredDevice
        : this.profile.fallbackDevice;

    try {
      this.generator = await this.buildPipeline(preferredDevice, onProgress);
      this.executionDevice = preferredDevice;
    } catch (error) {
      if (preferredDevice === this.profile.fallbackDevice) {
        throw error;
      }

      this.generator = await this.buildPipeline(this.profile.fallbackDevice, onProgress);
      this.executionDevice = this.profile.fallbackDevice;
    }

    await this.generator(this.profile.warmupPrompt, {
      max_new_tokens: 24,
      do_sample: false,
      return_full_text: false,
    });

    return {
      status: 'ready',
      device: this.executionDevice,
      model: this.profile.displayName,
    };
  }

  async generateLookPlan(input, fallbackPlan) {
    if (!this.generator) {
      return null;
    }

    const prompt = buildLookPlanPrompt(input, fallbackPlan, this.profile);
    const result = await this.generator(prompt, {
      max_new_tokens: 320,
      temperature: 0.25,
      do_sample: false,
      return_full_text: false,
    });

    const text = Array.isArray(result)
      ? result[0]?.generated_text ?? ''
      : result?.generated_text ?? '';
    const parsedPlan = parseGeneratedPlan(text);

    return parsedPlan ? normalizePlan(parsedPlan, fallbackPlan) : null;
  }
}