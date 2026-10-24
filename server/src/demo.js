export const USERS = [
  { id: 'abdul', name: 'Abdul Baseer', email: 'abdul@demo.local', initials: 'AB', color: '#4f46e5' },
  { id: 'maya', name: 'Maya Chen', email: 'maya@demo.local', initials: 'MC', color: '#0f766e' },
  { id: 'sam', name: 'Sam Rivera', email: 'sam@demo.local', initials: 'SR', color: '#b45309' }
];
export const WELCOME_ID = '000000000000000000000001';
export const WELCOME = {
  type: 'doc', content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Good ideas deserve a shared space.' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Welcome to Folio — a focused workspace for your team’s documents.' }] },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Try the complete workflow' }] },
    { type: 'bulletList', content: [
      'Create a document and give it a meaningful title.',
      'Format your ideas with headings, emphasis, and lists.',
      'Import a UTF-8 .txt file as a new editable document.',
      'Share with Maya, then switch accounts to open Shared with me.'
    ].map(text => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] })) },
    { type: 'paragraph', content: [{ type: 'text', text: 'Changes save automatically. Shared editing is asynchronous, not live co-editing.', marks: [{ type: 'italic' }] }] }
  ]
};
