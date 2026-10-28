import { z } from "zod";

// 创建任务
export const CreateTaskSchema = z.object({
  name: z.string().min(1, "名称不能为空").max(100),
  description: z.string().max(500).optional(),
  completed: z.boolean().optional().default(false),
});

// 更新任务
export const UpdateTaskSchema = CreateTaskSchema.partial();

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;

export interface TaskRow {
  id: number;
  name: string;
  description: string | null;
  completed: number; // SQLite INTEGER 0/1
  created_at: string;
  updated_at: string;
}

export interface TaskDto {
  id: number;
  name: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export function toDto(row: TaskRow): TaskDto {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    completed: row.completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
