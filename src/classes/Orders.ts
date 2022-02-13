import { Answers } from 'prompts';
import { v4 as uuidv4 } from 'uuid';

// singleton pattern classes
import ConsoleHandler from "./singletons/ConsoleHandler";
import FileHandler from "./singletons/FileHandler";
import ParsingHandler from './singletons/ParsingHandler';

import { OrderJson } from './type/orderJson.type';
import { OrderDAO } from "./dao/orderDao";
import { ClientDAO } from './dao/clientDao';
import { Client } from './Clients';
import { ArticleDAO } from './dao/articleDao';
import { Article } from './Articles';
import { ErcmSystem } from "../ERCMSystem";

export class Order {
    private _id: string;
    private _orderDate: Date;
    private _deliveryDate: Date;
    private _price: number;
    private _priceWithoutDiscount: number;
    private _priceBeforeCustomerDiscount: number;
    private _clientId: string;
    private _positions: Object[];
    private _totalDiscount: number;
    private _description: string;
    
    constructor(order: OrderDAO) {
        this._id = order.id;
        this._orderDate = order.orderDate;
        this._deliveryDate = order.deliveryDate;
        this._price = order.price;
        this._priceWithoutDiscount = order.priceWithoutDiscount;
        this._priceBeforeCustomerDiscount = order.priceBeforeCustomerDiscount;
        this._clientId = order.clientId;
        this._positions = order.positions;
        this._totalDiscount = order.totalDiscount;
        this._description = order.description;
    }

    public getID(): string {
        return this._id;
    }

    public getOrderDate(): Date {
        return this._orderDate;
    }

    public setOrderDate(newOrderDate: Date) : void {
        this._orderDate = newOrderDate;
    }

    public getDeliveryDate(): Date {
        return this._deliveryDate;
    }

    public setDeliveryDate(newDeliveryDate: Date) : void {
        this._deliveryDate = newDeliveryDate;
    }

    public getPrice(): number {
        return this._price;
    }

    public setPrice(newPrice: number) : void {
        this._price = newPrice;
    }

    public getPriceWithoutDiscount(): number {
        return this._priceWithoutDiscount;
    }

    public setPriceWithoutDiscount(newPriceWithoutDiscount: number) : void {
        this._priceWithoutDiscount = newPriceWithoutDiscount;
    }

    public getPriceBeforeCustomerDiscount(): number {
        return this._priceBeforeCustomerDiscount;
    }

    public setPriceBeforeCustomerDiscount(newPriceBeforeCustomerDiscount: number) : void {
        this._priceBeforeCustomerDiscount = newPriceBeforeCustomerDiscount;

    }

    public getClientId(): string {
        return this._clientId;
    }

    public setClientId(newClientId: string) : void {
        this._clientId = newClientId;
    }

    public getPositions(): Object[] {
        return this._positions;
    }

    public setPositions(newPositions: Object[]) : void {
        this._positions = newPositions;
    }

    public getTotalDiscount(): number {
        return this._totalDiscount;
    }

    public setTotalDiscount(newTotalDiscount: number) : void {
        this._totalDiscount = newTotalDiscount;
    }

    public getDescription(): string {
        return this._description;
    }

    public setDescription(newDescription: string) : void {
        this._description = newDescription;
    }

}

export class OrderManagement {

    private _orders: Order[] = [];
    private _clients: Client[] = [];
    private _articles: Article[] = [];

    private _dateToday: Date = new Date();

    constructor() {
        this.fetchOrders();
        this.fetchClients();
        this.fetchArticles();
        this._dateToday = new Date(this._dateToday.setHours(1,0,0,0));
    }

    public fetchOrders(): void {
        this._orders = [];
        let orderJson: OrderDAO[] = FileHandler.readFile('../../data/orders.json');

        for (let order of orderJson) {
            this._orders.push(new Order(order));
        }
    }

    public fetchClients(): void {
        this._clients = [];
        let clientsJson: ClientDAO[] = FileHandler.readFile('../../data/clients.json');

        for (let client of clientsJson) {
            this._clients.push(new Client(client));
        }
    }

    public fetchArticles(): void {
        this._articles = [];
        let articleJson: ArticleDAO[] = FileHandler.readFile('../../data/articles.json');

        for (let article of articleJson) {
            this._articles.push(new Article(article));
        }
    }

    public async showOrderManagement(): Promise<void> {
        this.fetchOrders();
        let chosenAction: Answers<string> = await ConsoleHandler.select("Was möchten Sie tun?",
            [
                {
                    title: "Bestellungen nach ID durchsuchen",
                    value: 1
                },
                {
                    title: "Bestellungen nach Beschreibung durchsuchen",
                    value: 2
                },
                {
                    title: "Bestellung anlegen",
                    value: 3
                },
                {
                    title: "Bestellung löschen",
                    value: 4
                },
                {
                    title: "Zurück gehen",
                    value: 5
                },
            ]
        );
        if (chosenAction && chosenAction.selected) {
            this.handleAnswer(chosenAction.selected);
        }
        else {
            this.showOrderManagement();
        }
    }

    public handleAnswer(answer: number): void {
        let ercmSystem = new ErcmSystem;
        switch (answer) {
            case 1:
                this.searchOrderById();
                break;
            case 2:
                this.searchOrderByDesc();
                break;
            case 3:
                this.createOrder();
                break;
            case 4:
                this.deleteOrder();
                break;
            case 5:
                ercmSystem.showHomeScreen();
                break;
            default:
                ercmSystem.showHomeScreen();
                break;
        }
    }

    public async searchOrderById(): Promise<void> {
        let ordersToSelect: Object[] = [];
        for (let i: number = 0; i < this._orders.length; i++) {
            ordersToSelect.push({title: this._orders[i].getID(), value: this._orders[i].getID()})
        }
        let searchOrder: Answers<string> = await ConsoleHandler.autoQuestion("Bestellung anhand von ID suchen:", ordersToSelect);
        this.chooseOrderAction(searchOrder.selected);
    }

    public async searchOrderByDesc(): Promise<void> {
        let ordersToSelect: Object[] = [];
        for (let i: number = 0; i < this._orders.length; i++) {
            ordersToSelect.push({title: this._orders[i].getDescription(), value: this._orders[i].getID()})
        }
        let searchOrder: Answers<string> = await ConsoleHandler.autoQuestion("Bestellung anhand von Beschreibung suchen:", ordersToSelect);
        this.chooseOrderAction(searchOrder.selected);
    }

    public async createOrder(clientId?: string, articleId?: string): Promise<void> {
        this._dateToday = new Date();
        this._dateToday = new Date(this._dateToday.setHours(1,0,0,0));
        let clientsToSelect: Object[] = [];
        for (let i: number = 0; i < this._clients.length; i++) {
            clientsToSelect.push({title: this._clients[i].getFirstname() + " " + this._clients[i].getLastname(), value: this._clients[i].getID()})
        }
        let articlesToSelect: Object[] = [];
        for (let i: number = 0; i < this._articles.length; i++) {
            if (new Date(new Date(this._articles[i].getDate()).setHours(1,0,0,0)).getTime() <= new Date(this._dateToday).getTime()) {
                articlesToSelect.push({title: this._articles[i].getDescription(), value: this._articles[i].getID()})
            }
        }

        let chosenClientId: Answers<string> = {};

        if (clientId && clientId.length) {
            chosenClientId.selected = clientId;
        }
        else {
            chosenClientId = await ConsoleHandler.autoQuestion("Welcher Kunde hat die Bestellung getätigt?", clientsToSelect);
        }

        let chosenPositions: Object[] = [];

        let priceWithoutDiscount: number = 0;
        let priceWithDiscount: number = 0;
        let priceBeforeCustomerDiscount: number = 0;

        let longestDeliveryTime: number = 0;

        let orderDescription: string = ""

        let whileIteration: number = 0;

        while (true) {
            let articleMinOrderLength: number = 0;
            let articleMaxOrderLength: number = 0;
            let articleDiscountLength: number = 0;
            let articleDiscountPercent: number = 0;
            let articlePrice: number = 0;
            let positionsPrice: number = 0;

            let chosenArticleId: Answers<string> = {};

            if (articleId && articleId.length && whileIteration === 0) {
                chosenArticleId.selected = articleId;
            }
            else {
                chosenArticleId = await ConsoleHandler.autoQuestion("Welchen Artikel hat der Kunde bestellt?", articlesToSelect);
            }

            for (let i: number = 0; i < this._articles.length; i++) {
                if (this._articles[i].getID() === chosenArticleId.selected) {
                    articleMinOrderLength = this._articles[i].getMinOrderLength();
                    articleMaxOrderLength = this._articles[i].getMaxOrderLength();
                    articleDiscountLength = this._articles[i].getDiscountLength();
                    articleDiscountPercent = this._articles[i].getDiscountPercent();
                    articlePrice = this._articles[i].getPrice();
                    if (this._articles[i].getDeliveryTime() > longestDeliveryTime) {
                        longestDeliveryTime = this._articles[i].getDeliveryTime();
                    }
                }
            }
            let chosenArticleAmount: Answers<string> = await ConsoleHandler.numberQuestion("In welcher Anzahl wurde der Artikel bestellt? (Min: " + articleMinOrderLength + ", Max: " + articleMaxOrderLength, articleMinOrderLength, articleMinOrderLength, articleMaxOrderLength);

            positionsPrice = articlePrice * chosenArticleAmount.answer;
            priceWithoutDiscount += positionsPrice;

            if (chosenArticleAmount.answer >= articleDiscountLength) {
                positionsPrice = parseFloat((positionsPrice - ((positionsPrice / 100) * articleDiscountPercent)).toFixed(2));
            }

            priceWithDiscount += positionsPrice;

            priceBeforeCustomerDiscount += positionsPrice;

            chosenPositions.push({articleId: chosenArticleId.selected, amount: chosenArticleAmount.answer, positionPrice: positionsPrice});

            let addArticle: Answers<string> = await ConsoleHandler.booleanQuestion("Möchten Sie einen weiteren Artikel hinzufügen?");
            
            whileIteration += 1;

            if (!addArticle.answer) {
                break;
            }
        }

        for (let i: number = 0; i < this._clients.length; i++) {
            if (this._clients[i].getID() === chosenClientId.selected) {
                priceWithDiscount = parseFloat((priceWithDiscount - ((priceWithDiscount / 100) * this._clients[i].getDiscount())).toFixed(2));
                orderDescription = this._clients[i].getLastname() + ", " + new Date(this._dateToday).toLocaleDateString('de-DE');
            }
        }
        let newOrder: Order = new Order({id: uuidv4(), orderDate: new Date(), deliveryDate: new Date(), price: 0, priceWithoutDiscount: 0, priceBeforeCustomerDiscount: 0, clientId: "", positions: [{articleId: "", amount: 0, positionPrice: 0}], totalDiscount: 0, description: ""});
        newOrder.setOrderDate(new Date(this._dateToday));
        newOrder.setDeliveryDate(new Date(this._dateToday.setDate(this._dateToday.getDate() + longestDeliveryTime)));
        newOrder.setPrice(priceWithDiscount);
        newOrder.setPriceWithoutDiscount(priceWithoutDiscount);
        newOrder.setPriceBeforeCustomerDiscount(priceBeforeCustomerDiscount);
        newOrder.setClientId(chosenClientId.selected);
        newOrder.setPositions(chosenPositions);
        newOrder.setTotalDiscount(parseFloat(((100 - (100 * priceWithDiscount) / priceWithoutDiscount)).toFixed(2)));
        newOrder.setDescription(orderDescription);

        let newOrderJson: OrderJson = ParsingHandler.parseOrderToOrderJson(newOrder);
        FileHandler.addToFile('../../data/orders.json', newOrderJson);
        ConsoleHandler.print("Erfolgreich hinzugefügt!", 1);
        setTimeout(() => {console.clear(); this.showOrderSummary(newOrder);}, 1000);
    }

    public async showOrderSummary(order: Order) {
        let clientFirstname: string = "";
        let clientLastname: string = "";
        let positionsWithDesc: any = [];
        let positions: any = order.getPositions();

        for (let i: number = 0; i < this._clients.length; i++) {
            if (this._clients[i].getID() === order.getClientId()) {
                clientFirstname = this._clients[i].getFirstname();
                clientLastname = this._clients[i].getLastname();
            }
        }
        for (let i: number = 0; i < positions.length; i++) {
            for (let j: number = 0; j < this._articles.length; j++) {
                if (this._articles[j].getID() === positions[i].articleId) {
                    positionsWithDesc.push({description: this._articles[j].getDescription(), amount: positions[i].amount, positionPrice: positions[i].positionPrice});
                }
            }
        }

        ConsoleHandler.print("Zusammenfassung der Bestellung:", 3);
        ConsoleHandler.print("ID der Bestellung:", 1);
        ConsoleHandler.print(order.getID(), 2);
        ConsoleHandler.print("Bestellung getätigt von:", 1);
        ConsoleHandler.print(clientFirstname + " " + clientLastname, 2);
        ConsoleHandler.print("Bestelldatum:", 1);
        ConsoleHandler.print(new Date(order.getOrderDate()).toLocaleDateString('de-DE'), 2);
        ConsoleHandler.print("Frühestes Lieferdatum:", 1);
        ConsoleHandler.print(new Date(order.getDeliveryDate()).toLocaleDateString('de-DE'), 2);
        ConsoleHandler.print("Bestellbetrag:", 1);
        ConsoleHandler.print(order.getPrice().toString().replace(".", ",") + "€", 2);
        ConsoleHandler.print("Bestellte Artikel:", 1);
        for (let i: number = 0; i < positionsWithDesc.length; i++) {
            ConsoleHandler.print("• " + "Beschreibung: " + positionsWithDesc[i].description + ", Anzahl: " + positionsWithDesc[i].amount + " Stück, Positionsbetrag: " + positionsWithDesc[i].positionPrice.toString().replace(".", ",") + "€", 1);
        }
        ConsoleHandler.print("", 1);
        ConsoleHandler.print("Gesamt gewährter Rabatt:", 1);
        ConsoleHandler.print(order.getTotalDiscount().toString() + "%", 2);
        ConsoleHandler.print("Bestellbeschreibung: (Nachname + Datum)", 1);
        ConsoleHandler.print(order.getDescription().toString(), 2);
        let chosenAction: Answers<string> = await ConsoleHandler.select("Was möchten Sie tun?",
            [
                {
                    title: "Neue Bestellung aufnehmen",
                    value: 1
                },
                {
                    title: "Zurück zur Auswahl",
                    value: 2
                },
            ]
        );
        if (chosenAction && chosenAction.selected) {
            switch (chosenAction.selected) {
                case 1:
                    this.createOrder();
                    break;
                case 2:
                    this.showOrderManagement();
                    break;
                default:
                    this.showOrderManagement();
                    break;
            }
        }
        else {
            this.showOrderSummary(order);
        }
    }

    public async deleteOrder(): Promise<void> {
        let ordersToSelect: Object[] = [];
        for (let i: number = 0; i < this._orders.length; i++) {
            ordersToSelect.push({title: this._orders[i].getDescription(), value: this._orders[i].getID()})
        }
        let idsToDelete: Answers<string> = await ConsoleHandler.multiselect("Wählen Sie die Bestellungen aus, die Sie löschen möchten:", "Mit Leerzeichen Bestellung auswählen und mit Enter bestätigen", ordersToSelect);
        if (idsToDelete && idsToDelete.selected) {
            let submitIds: string[] = idsToDelete.selected;
            FileHandler.deleteFromFile('../../data/orders.json', submitIds);
            ConsoleHandler.print("Erfolgreich gelöscht!", 1);
            setTimeout(() => {this.showOrderManagement();}, 2000);
        }
        else {
            this.showOrderManagement();
        }
    }

    public async chooseOrderAction(orderId: string): Promise<void> {
        this.fetchOrders();
        let chosenOrderAction: Answers<string> = await ConsoleHandler.select("Was möchten Sie tun?",
            [
                {
                    title: "Bestellung anzeigen",
                    value: 1
                },
                {
                    title: "Bestellung bearbeiten",
                    value: 2
                },
                {
                    title: "Zurück gehen",
                    value: 3
                },
            ]
        );
        if (chosenOrderAction && chosenOrderAction.selected) {
            this.handleOrderAnswer(chosenOrderAction.selected, orderId);
        }
        else {
            ConsoleHandler.print("Das hat leider nicht geklappt!", 1, true);
            this.chooseOrderAction(orderId);
        }
    }

    public async handleOrderAnswer(answer: number, orderId: string): Promise<void> {
        switch (answer) {
            case 1:
                let order: Order = {} as Order;
                for (let i: number = 0; i < this._orders.length; i++) {
                    if (this._orders[i].getID() === orderId) {
                        order = this._orders[i];
                    }
                }
                this.showOrderSummary(order);
                break;
            case 2:
                this.editOrder(orderId);
                break;
            case 3:
                this.showOrderManagement();
                break;
            default:
                this.showOrderManagement();
                break;
        }
    }

    public async editOrder(orderId: string) {
        let chosenEditAction: Answers<string> = await ConsoleHandler.select("Was möchten Sie tun?",
            [
                {
                    title: "Kunde ändern",
                    value: 1
                },
                {
                    title: "Artikel ändern",
                    value: 2
                },
                {
                    title: "Zurück gehen",
                    value: 3
                },
            ]
        );
        if (chosenEditAction && chosenEditAction.selected) {
            this.handleEditAnswer(chosenEditAction.selected, orderId);
        }
        else {
            ConsoleHandler.print("Das hat leider nicht geklappt!", 1, true);
            this.editOrder(orderId);
        }
    }

    public async handleEditAnswer(answer: number, idToEdit: string): Promise<void> {
        this.fetchOrders();
        switch (answer) {
            case 1:
                let clientsToSelect: Object[] = [];
                for (let i: number = 0; i < this._clients.length; i++) {
                    clientsToSelect.push({title: this._clients[i].getFirstname() + " " + this._clients[i].getLastname(), value: this._clients[i].getID()})
                }
                let chosenClientId: Answers<string> = await ConsoleHandler.autoQuestion("Welcher Kunde hat die Bestellung getätigt?", clientsToSelect);;
                
                let price: number = 0;
                let orderDescription: string = "";
                let totalDiscount: number = 0;

                let order: Order = {} as Order;

                for (let i: number = 0; i < this._orders.length; i++) {
                    if (this._orders[i].getID() === idToEdit) {
                        order = this._orders[i];
                    }
                }
                for (let i: number = 0; i < this._clients.length; i++) {
                    if (this._clients[i].getID() === chosenClientId.selected) {
                        price = parseFloat((order.getPriceBeforeCustomerDiscount() - ((order.getPriceBeforeCustomerDiscount() / 100) * this._clients[i].getDiscount())).toFixed(2));
                        orderDescription = this._clients[i].getLastname() + ", " + new Date(order.getOrderDate()).toLocaleDateString('de-DE');
                        totalDiscount = parseFloat(((100 - (100 * price) / order.getPriceWithoutDiscount())).toFixed(2))
                    }
                }

                FileHandler.editFile('../../data/orders.json', idToEdit, "clientId", chosenClientId.selected);
                setTimeout(() => {FileHandler.editFile('../../data/orders.json', idToEdit, "price", price);}, 500);
                setTimeout(() => {FileHandler.editFile('../../data/orders.json', idToEdit, "description", orderDescription);}, 500);
                setTimeout(() => {FileHandler.editFile('../../data/orders.json', idToEdit, "totalDiscount", totalDiscount);}, 500);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showOrderManagement();}, 2000);
                break;
            case 2:
                this._dateToday = new Date();
                this._dateToday = new Date(this._dateToday.setHours(1,0,0,0));
                let articlesToSelect: Object[] = [];
                for (let i: number = 0; i < this._articles.length; i++) {
                    if (new Date(new Date(this._articles[i].getDate()).setHours(1,0,0,0)).getTime() <= new Date(this._dateToday).getTime()) {
                        articlesToSelect.push({title: this._articles[i].getDescription(), value: this._articles[i].getID()})
                    }
                }

                let editOrder: Order = {} as Order;

                for (let i: number = 0; i < this._orders.length; i++) {
                    if (this._orders[i].getID() === idToEdit) {
                        editOrder = this._orders[i];
                    }
                }

                let chosenPositions: Object[] = [];

                let priceWithoutDiscount: number = 0;
                let priceWithDiscount: number = 0;
                let priceBeforeCustomerDiscount: number = 0;
        
                let longestDeliveryTime: number = 0;

                while (true) {
                    let articleMinOrderLength: number = 0;
                    let articleMaxOrderLength: number = 0;
                    let articleDiscountLength: number = 0;
                    let articleDiscountPercent: number = 0;
                    let articlePrice: number = 0;
                    let positionsPrice: number = 0;

                    let chosenArticleId: Answers<string> = await ConsoleHandler.autoQuestion("Welchen Artikel hat der Kunde bestellt?", articlesToSelect);
        
                    for (let i: number = 0; i < this._articles.length; i++) {
                        if (this._articles[i].getID() === chosenArticleId.selected) {
                            articleMinOrderLength = this._articles[i].getMinOrderLength();
                            articleMaxOrderLength = this._articles[i].getMaxOrderLength();
                            articleDiscountLength = this._articles[i].getDiscountLength();
                            articleDiscountPercent = this._articles[i].getDiscountPercent();
                            articlePrice = this._articles[i].getPrice();
                            if (this._articles[i].getDeliveryTime() > longestDeliveryTime) {
                                longestDeliveryTime = this._articles[i].getDeliveryTime();
                            }
                        }
                    }
                    let chosenArticleAmount: Answers<string> = await ConsoleHandler.numberQuestion("In welcher Anzahl wurde der Artikel bestellt? (Min: " + articleMinOrderLength + ", Max: " + articleMaxOrderLength, articleMinOrderLength, articleMinOrderLength, articleMaxOrderLength);
        
                    positionsPrice = articlePrice * chosenArticleAmount.answer;
                    priceWithoutDiscount += positionsPrice;
        
                    if (chosenArticleAmount.answer >= articleDiscountLength) {
                        positionsPrice = parseFloat((positionsPrice - ((positionsPrice / 100) * articleDiscountPercent)).toFixed(2));
                    }
        
                    priceWithDiscount += positionsPrice;
        
                    priceBeforeCustomerDiscount += positionsPrice;
        
                    chosenPositions.push({articleId: chosenArticleId.selected, amount: chosenArticleAmount.answer, positionPrice: positionsPrice});
        
                    let addArticle: Answers<string> = await ConsoleHandler.booleanQuestion("Möchten Sie einen weiteren Artikel hinzufügen?");
        
                    if (!addArticle.answer) {
                        break;
                    }
                }

                for (let i: number = 0; i < this._clients.length; i++) {
                    if (this._clients[i].getID() === editOrder.getClientId()) {
                        priceWithDiscount = parseFloat((priceWithDiscount - ((priceWithDiscount / 100) * this._clients[i].getDiscount())).toFixed(2));
                    }
                }

                FileHandler.editFile('../../data/orders.json', idToEdit, "deliveryDate", new Date(new Date(editOrder.getOrderDate()).setDate(new Date(editOrder.getOrderDate()).getDate() + longestDeliveryTime)));
                FileHandler.editFile('../../data/orders.json', idToEdit, "price", priceWithDiscount);
                FileHandler.editFile('../../data/orders.json', idToEdit, "priceWithoutDiscount", priceWithoutDiscount);
                FileHandler.editFile('../../data/orders.json', idToEdit, "priceBeforeCustomerDiscount", priceBeforeCustomerDiscount);
                FileHandler.editFile('../../data/orders.json', idToEdit, "positions", chosenPositions);
                FileHandler.editFile('../../data/orders.json', idToEdit, "totalDiscount", (parseFloat(((100 - (100 * priceWithDiscount) / priceWithoutDiscount)).toFixed(2))));

                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showOrderManagement();}, 2000);
                break;
            case 3:
                this.showOrderManagement();
                break;
            default:
                this.showOrderManagement();
                break;
        }
    }
}