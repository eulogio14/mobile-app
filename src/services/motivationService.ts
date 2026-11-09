import axios from 'axios';

export type MotivationQuote = { content: string; author: string };

const FALLBACK: MotivationQuote = {
  content: 'Cada paso que das lejos de lo que te hace daño es un paso hacia ti.',
  author: 'Contacto Cero',
};

export const getRandomMotivation = async (): Promise<MotivationQuote> => {
  try {
    const res = await axios.get('https://api.quotable.io/random', {
      params: { tags: 'inspirational|wisdom|change' },
      timeout: 8000,
    });
    return { content: res.data.content, author: res.data.author };
  } catch {
    return FALLBACK;
  }
};
