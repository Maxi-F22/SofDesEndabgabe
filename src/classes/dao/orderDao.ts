export class OrderDAO {
    public id: string;
    public orderDate: Date;
    public deliveryDate: Date;
    public price: number;
    public priceWithoutDiscount: number;
    public priceBeforeCustomerDiscount: number;
    public clientId: string;
    public positions: Object[];
    public totalDiscount: number;
    public description: string;

    constructor(orderDao: OrderDAO) {
        this.id = orderDao.id;
        this.orderDate = orderDao.orderDate;
        this.deliveryDate = orderDao.deliveryDate;
        this.price = orderDao.price;
        this.priceWithoutDiscount = orderDao.priceWithoutDiscount;
        this.priceBeforeCustomerDiscount = orderDao.priceBeforeCustomerDiscount;
        this.clientId = orderDao.clientId;
        this.positions = orderDao.positions;
        this.totalDiscount = orderDao.totalDiscount;
        this.description = orderDao.description;
    }
}