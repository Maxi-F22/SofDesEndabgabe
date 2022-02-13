export class ArticleDAO {
    public id: string;
    public description: string;
    public date: Date;
    public price: number;
    public deliveryTime: number;
    public minOrderLength: number;
    public maxOrderLength: number;
    public discountLength: number;
    public discountPercent: number;

    constructor(articleDao: ArticleDAO) {
        this.id = articleDao.id;
        this.description = articleDao.description;
        this.date = articleDao.date;
        this.price = articleDao.price;
        this.deliveryTime = articleDao.deliveryTime;
        this.minOrderLength = articleDao.minOrderLength;
        this.maxOrderLength = articleDao.maxOrderLength;
        this.discountLength = articleDao.discountLength;
        this.discountPercent = articleDao.discountPercent;
    }
}