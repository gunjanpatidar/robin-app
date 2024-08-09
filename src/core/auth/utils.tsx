import { getItem, removeItem, setItem } from '@/core/storage';

const TOKEN = 'auth.token';

export type TokenType = {
  token: string;
};

export const getToken = () => getItem<TokenType>(TOKEN);
export const removeToken = () => removeItem(TOKEN);
export const setToken = (value: TokenType) => setItem<TokenType>(TOKEN, value);
