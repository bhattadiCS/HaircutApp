import { resolveModelConfig } from '../config/modelCatalog';
import { LocalLLMService } from '../services/LocalLLMService';

export class AIFactory {
  getProfile(profileKey = 'gemma4Local') {
    return resolveModelConfig(profileKey);
  }

  createLocalLLM(profileKey = 'gemma4Local', overrides = {}) {
    const profile = {
      ...this.getProfile(profileKey),
      ...overrides,
    };

    return new LocalLLMService(profile);
  }
}

export const aiFactory = new AIFactory();