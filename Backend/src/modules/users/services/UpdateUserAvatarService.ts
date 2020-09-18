import { injectable, inject } from 'tsyringe';

import IUserRepository from '@modules/users/repositories/IUserRepository';
import IStorageProvider from '@shared/container/providers/StorageProvider/models/IStorageProvider';
import AppError from '@shared/errors/AppError';

import User from '../infra/typeorm/entities/Users';

// Estamos pegando o caminho da imagem
interface IRequest {
  user_id: string;
  avatarFilename: string;
}
@injectable()
class UpdateUserAvatarService {
  /* Passamos esse construtor pois o service não precisa ter noção se estamos utilizando
  typeorm */
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUserRepository,

    @inject('StorageProvider')
    private storageProvider: IStorageProvider
  ) {}

  public async execute({ user_id, avatarFilename }: IRequest): Promise<User> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('Only authenticated users can change avatar', 401);
    }

    if (user.avatar) {
      await this.storageProvider.deleteFile(user.avatar);
    }

    const filename = await this.storageProvider.saveFile(avatarFilename);

    user.avatar = filename;
    await this.usersRepository.save(user);

    return user;
  }
}

export default UpdateUserAvatarService;