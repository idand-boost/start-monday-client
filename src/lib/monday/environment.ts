// Two worlds (monday-sdk lecture), decided once at startup:
// - inside monday, the app runs in an iframe (board view, item view...): it has a parent window.
// - in a plain browser tab (npm run dev), it doesn't.
// Never ask the SDK to find out: outside monday its promises may never resolve.
export const isInsideMonday = window.self !== window.top
