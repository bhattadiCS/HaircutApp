import { useContext } from 'react';
import { LocalLLMContext } from '../context/LocalLLMContext';

export function useLocalLLM() {
  const context = useContext(LocalLLMContext);

  if (!context) {
    throw new Error('useLocalLLM must be used inside LocalLLMProvider.');
  }

  return context;
}