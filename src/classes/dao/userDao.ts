export class UserDAO {
  public id: number;
  public username: string;
  public password: string;
  public isAdmin: boolean;

  constructor(userDao: UserDAO) {
    this.id = userDao.id;
    this.username = userDao.username;
    this.password = userDao.password;
    this.isAdmin = userDao.isAdmin;
  }
}