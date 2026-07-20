export interface Worker {
  id: string;
  status: "alive" | "dead";
  lastHeartbeat: string;
  createdAt: string;
  updatedAt: string;
}
