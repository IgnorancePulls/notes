// import { MENTION_TRIGGER } from '@/constants/mentions';
//
// export const getCaretPosition = (
//   editorRef: React.RefObject<HTMLDivElement | null>
// ): { top: number; left: number } => {
//   const selection = window.getSelection();
//   if (!selection || selection.rangeCount === 0 || !editorRef.current) {
//     return { top: 0, left: 0 };
//   }
//
//   const range = selection.getRangeAt(0);
//   const rect = range.getBoundingClientRect();
//   const editorRect = editorRef.current.getBoundingClientRect();
//   // console.log('rect', rect);
//   // console.log('editorRect', editorRect);
//
//   // If range has no dimensions (empty editor), use a default position
//   if (rect.height === 0 && rect.width === 0) {
//     return { top: 40, left: 20 };
//   }
//
//   return {
//     top: rect.bottom - editorRect.top + 4,
//     left: rect.left - editorRect.left,
//   };
// };
//
// export const getTextBeforeCaret = (): string => {
//   const selection = window.getSelection();
//   if (!selection || selection.rangeCount === 0) return '';
//
//   const range = selection.getRangeAt(0);
//   const preCaretRange = range.cloneRange();
//   preCaretRange.selectNodeContents(range.startContainer);
//   preCaretRange.setEnd(range.startContainer, range.startOffset);
//
//   return preCaretRange.toString();
// };
//
// // export const shouldTriggerMention = (textBeforeCaret: string): boolean => {
// //   const lastAtIndex = textBeforeCaret.lastIndexOf(MENTION_TRIGGER);
// //   if (lastAtIndex === -1) return false;
// //
// //   // Only trigger if @ is at the start or preceded by whitespace
// //   if (lastAtIndex === 0) return true;
// //
// //   const charBeforeAt = textBeforeCaret[lastAtIndex - 1];
// //   return charBeforeAt === ' ' || charBeforeAt === '\n';
// // };
// //
// // export const getQueryFromText = (textBeforeCaret: string): string => {
// //   const lastAtIndex = textBeforeCaret.lastIndexOf(MENTION_TRIGGER);
// //   if (lastAtIndex === -1) return '';
// //   return textBeforeCaret.slice(lastAtIndex + 1);
// // };
