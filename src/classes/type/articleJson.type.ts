export type ArticleJson = {
    id: number,
    description: string,
    date: Date,
    price: number,
    deliveryTime: number,
    minOrderLength: number,
    maxOrderLength: number,
    discountLength: number,
    discountPercent: number
}