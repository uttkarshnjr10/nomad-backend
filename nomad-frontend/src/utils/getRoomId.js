export default function getRoomId(a, b) {
  if (!a || !b) return null;
  return [a, b].sort().join("--"); 
}