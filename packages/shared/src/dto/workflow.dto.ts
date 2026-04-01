export interface CreateWorkflowDto {
  name: string;
  description: string;
  taskIds: string[];
}

export interface UpdateWorkflowDto {
  name?: string;
  description?: string;
  taskIds?: string[];
}
