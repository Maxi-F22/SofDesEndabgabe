import { User } from "../User";
import { UserJson } from "../type/userJson.type";
import { Article } from "../Articles";
import { ArticleJson } from "../type/articleJson.type";
import { Client } from "../Clients";
import { ClientJson } from "../type/clientJson.type";
import { Order } from "../Orders";
import { OrderJson } from "../type/orderJson.type";

export class ParsingHandler {
    private static _instance : ParsingHandler = new ParsingHandler();

    private constructor() {
        if (ParsingHandler._instance) 
            throw new Error("Instead of using new ParsingHandler(), please use ParsingHandler.getInstance() for Singleton!")
            ParsingHandler._instance = this;
    }
    public static getInstance(): ParsingHandler {
        return ParsingHandler._instance;
    }

    public parseUserToUserJson(user: User) : UserJson {
        return { "id" : user.getID(), "username" : user.getUsername(), "password" : user.getPassword(), "isAdmin" : user.getAdminStatus() }
    }
    
    public parseArticleToArticleJson(article: Article) : ArticleJson {
        return { "id" : article.getID(), "description" : article.getDescription(), "date" : article.getDate(), "price" : article.getPrice(), "deliveryTime": article.getDeliveryTime(), "minOrderLength": article.getMinOrderLength(), "maxOrderLength": article.getMaxOrderLength(), "discountLength": article.getDiscountLength(), "discountPercent": article.getDiscountPercent() }
    }

    public parseClientToClientJson(client: Client) : ClientJson {
        return { "id" : client.getID(), "firstname" : client.getFirstname(), "lastname" : client.getLastname(), "street" : client.getStreet(), "houseno": client.getHouseNo(), "city": client.getCity(), "zip": client.getZip(), "discount": client.getDiscount() }
    }

    public parseOrderToOrderJson(order: Order) : OrderJson {
        return { "id" : order.getID(), "orderDate" : order.getOrderDate(), "deliveryDate" : order.getDeliveryDate(), "price" : order.getPrice(), "priceWithoutDiscount" : order.getPriceWithoutDiscount(), "priceBeforeCustomerDiscount" : order.getPriceBeforeCustomerDiscount(), "clientId" : order.getClientId(), "positions": order.getPositions(), "totalDiscount": order.getTotalDiscount(), "description": order.getDescription() }
    }

}

export default ParsingHandler.getInstance();