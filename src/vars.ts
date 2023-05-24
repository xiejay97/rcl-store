let id = 0;

export const ContextStore = new Map<number, { [k: string]: React.Context<any> }>();

export function getId() {
  return id++;
}
