import { CategoryDTO } from "./category.dto";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  categories: CategoryDTO[];
}