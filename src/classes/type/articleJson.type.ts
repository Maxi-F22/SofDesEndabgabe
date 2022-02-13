export type ArticleJson = {
    id: string,
    description: string,
    date: Date,
    price: number,
    deliveryTime: number,
    minOrderLength: number,
    maxOrderLength: number,
    discountLength: number,
    discountPercent: number
}