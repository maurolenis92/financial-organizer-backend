import { Category, User } from '@prisma/client';
import { UserDTO } from '../dtos/user.dto';

export class UserMapper {
  static toDetailDTO(user: User & { categories: Category[] }): UserDTO {
    return {
      id: user.id,
      name: user.name ?? '',
      email: user.email,
      categories: user.categories.map((category) => ({
        id: category.id,
        name: category.name ?? '',
        color: category?.color ?? undefined,
        icon: category?.icon ?? undefined,
      })),
    };
  }
}
