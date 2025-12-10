import { MENTION_TRIGGER } from '../constants';

const getQueryFromText = (textBeforeCaret: string): string => {
    const lastAtIndex = textBeforeCaret.lastIndexOf(MENTION_TRIGGER);
    if (lastAtIndex === -1) return '';
    return textBeforeCaret.slice(lastAtIndex + 1);
};

export {  getQueryFromText };