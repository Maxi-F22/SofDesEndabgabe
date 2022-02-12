export class ClientDAO {
    public id: number;
    public firstname: string;
    public lastname: string;
    public street: string;
    public houseno: number;
    public city: string;
    public zip: number;
    public discount: number;

    constructor(clientDao: ClientDAO) {
        this.id = clientDao.id;
        this.firstname = clientDao.firstname;
        this.lastname = clientDao.lastname;
        this.street = clientDao.street;
        this.houseno = clientDao.houseno;
        this.city = clientDao.city;
        this.zip = clientDao.zip;
        this.discount = clientDao.discount;
    }
}