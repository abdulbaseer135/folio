export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export const fail = (status, message) => { throw new HttpError(status, message); };
export const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export function titleOf(value) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 120)
    fail(400, 'Title must contain 1–120 characters.');
  return value.trim();
}
export function documentId(value) {
  if (!/^[a-f\d]{24}$/i.test(value)) fail(400, 'Invalid document ID.');
  return value;
}
const allowedNodes = new Set(['doc', 'paragraph', 'text', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote', 'codeBlock', 'horizontalRule', 'hardBreak']);
const allowedMarks = new Set(['bold', 'italic', 'underline', 'strike', 'code']);
export function contentOf(value) {
  if (!object(value) || value.type !== 'doc' || !Array.isArray(value.content))
    fail(400, 'Content must be a rich-text document.');
  if (Buffer.byteLength(JSON.stringify(value), 'utf8') > 262144)
    fail(413, 'Document content exceeds 256 KB.');
  let nodes = 0;
  function visit(node, depth = 0) {
    if (!object(node) || depth > 30 || ++nodes > 15000 || !allowedNodes.has(node.type))
      fail(400, 'Unsupported or overly complex document structure.');
    if (node.text !== undefined && (node.type !== 'text' || typeof node.text !== 'string' || !node.text.length))
      fail(400, 'Invalid text node.');
    if (node.type === 'text' && typeof node.text !== 'string') fail(400, 'Missing text.');
    if (node.attrs !== undefined && !object(node.attrs)) fail(400, 'Invalid node attributes.');
    const attrs = node.attrs || {};
    const keys = Object.keys(attrs);
    if (node.type === 'heading') {
      if (keys.some(k => k !== 'level') || ![1, 2, 3].includes(attrs.level)) fail(400, 'Invalid heading.');
    } else if (node.type === 'orderedList') {
      if (keys.some(k => k !== 'start' && k !== 'type') || (attrs.start !== undefined && (!Number.isInteger(attrs.start) || attrs.start < 1 || attrs.start > 100000)) || (attrs.type !== undefined && attrs.type !== null)) fail(400, 'Invalid list.');
    } else if (node.type === 'codeBlock') {
      if (keys.some(k => k !== 'language') || (attrs.language !== null && attrs.language !== undefined && typeof attrs.language !== 'string')) fail(400, 'Invalid code block.');
    } else if (keys.length) fail(400, 'Unsupported attributes.');
    if (node.marks !== undefined) {
      if (!Array.isArray(node.marks) || node.marks.some(m => !object(m) || !allowedMarks.has(m.type) || (m.attrs && Object.keys(m.attrs).length))) fail(400, 'Unsupported text formatting.');
    }
    if (node.content !== undefined) {
      if (!Array.isArray(node.content)) fail(400, 'Invalid nested content.');
      node.content.forEach(child => visit(child, depth + 1));
    }
    const children = node.content || [];
    const blocks = new Set(['paragraph', 'heading', 'bulletList', 'orderedList', 'blockquote', 'codeBlock', 'horizontalRule']);
    if (node.type === 'doc' && (depth !== 0 || !children.length || children.some(n => !blocks.has(n.type)))) fail(400, 'Invalid document blocks.');
    if (['paragraph', 'heading'].includes(node.type) && children.some(n => !['text', 'hardBreak'].includes(n.type))) fail(400, 'Invalid inline content.');
    if (['bulletList', 'orderedList'].includes(node.type) && (!children.length || children.some(n => n.type !== 'listItem'))) fail(400, 'Invalid list items.');
    if (node.type === 'listItem' && (!children.length || children[0].type !== 'paragraph' || children.some(n => !blocks.has(n.type)))) fail(400, 'Invalid list item.');
    if (node.type === 'blockquote' && (!children.length || children.some(n => !blocks.has(n.type)))) fail(400, 'Invalid blockquote.');
    if (node.type === 'codeBlock' && children.some(n => n.type !== 'text' || n.marks?.length)) fail(400, 'Invalid code content.');
    if (['text', 'hardBreak', 'horizontalRule'].includes(node.type) && children.length) fail(400, 'Invalid leaf node.');
  }
  visit(value);
  return value;
}
export function versionOf(value) {
  if (!Number.isInteger(value) || value < 0) fail(400, 'A valid document version is required.');
  return value;
}
export const emptyContent = () => ({ type: 'doc', content: [{ type: 'paragraph' }] });
export function textContent(text) {
  return { type: 'doc', content: text.split(/\r?\n/).map(line => ({ type: 'paragraph', ...(line ? { content: [{ type: 'text', text: line }] } : {}) })) };
}
