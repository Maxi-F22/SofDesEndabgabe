export type OrderJson = {
    id: string,
    orderDate: Date,
    deliveryDate: Date,
    price: number,
    priceWithoutDiscount: number,
    priceBeforeCustomerDiscount: number,
    clientId: string,
    positions: Object[],
    totalDiscount: number,
    description: string,
}