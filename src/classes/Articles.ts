import { Answers } from 'prompts';
import { v4 as uuidv4} from 'uuid';

// singleton pattern classes
import ConsoleHandler from "./singletons/ConsoleHandler";
import FileHandler from "./singletons/FileHandler";
import ParsingHandler from './singletons/ParsingHandler';

import { ArticleDAO } from "./dao/articleDao";
import { ArticleJson } from './type/articleJson.type';
import { OrderDAO } from './dao/orderDao';
import { Order, OrderManagement } from './Orders';
import { ErcmSystem, loggedinUser } from "../ERCMSystem";

export class Article {
    private _id: string;
    private _description: string;
    private _date: Date;
    private _price: number;
    private _deliveryTime: number;
    private _minOrderLength: number;
    private _maxOrderLength: number;
    private _discountLength: number;
    private _discountPercent: number;
    
    constructor(article: ArticleDAO) {
        this._id = article.id;
        this._description = article.description;
        this._date = article.date;
        this._price = article.price;
        this._deliveryTime = article.deliveryTime;
        this._minOrderLength = article.minOrderLength;
        this._maxOrderLength = article.maxOrderLength;
        this._discountLength = article.discountLength;
        this._discountPercent = article.discountPercent;
    }

    public getID(): string {
        return this._id;
    }

    public getDescription(): string {
        return this._description;
    }

    public setDescription(newDescription: string) : void {
        this._description = newDescription;
    }

    public getDate(): Date {
        return this._date;
    }

    public setDate(newDate: Date) : void {
        this._date = newDate;
    }

    public getPrice(): number {
        return this._price;
    }

    public setPrice(newPrice: number) : void {
        this._price = newPrice;
    }

    public getDeliveryTime(): number {
        return this._deliveryTime;
    }

    public setDeliveryTime(newDeliveryTime: number) : void {
        this._deliveryTime = newDeliveryTime;
    }

    public getMinOrderLength(): number {
        return this._minOrderLength;
    }

    public setMinOrderLength(newMinOrderLength: number) : void {
        this._minOrderLength = newMinOrderLength;
    }

    public getMaxOrderLength(): number {
        return this._maxOrderLength;
    }

    public setMaxOrderLength(newMaxOrderLength: number) : void {
        this._maxOrderLength = newMaxOrderLength;
    }

    public getDiscountLength(): number {
        return this._discountLength;
    }

    public setDiscountLength(newDiscountLength: number) : void {
        this._discountLength = newDiscountLength;
    }

    public getDiscountPercent(): number {
        return this._discountPercent;
    }

    public setDiscountPercent(newDiscountPercent: number) : void {
        this._discountPercent = newDiscountPercent;
    }

}

export class ArticleManagement {

    private _articles: Article[] = [];
    private _dateToday: Date = new Date();

    constructor() {
        this.fetchArticles();
        this._dateToday = new Date(this._dateToday.setHours(1,0,0,0));
    }

    public fetchArticles(): void {
        this._articles = [];
        let articleJson: ArticleDAO[] = FileHandler.readFile('../../data/articles.json');

        for (let article of articleJson) {
            this._articles.push(new Article(article));
        }
    }

    public async showArticleManagement(): Promise<void> {
        this.fetchArticles();
        let chosenAction: Answers<string> = {};
        if (loggedinUser && loggedinUser.getAdminStatus() === true) {
            chosenAction = await ConsoleHandler.select("Was möchten Sie tun?",
                [
                    {
                        title: "Artikel nach ID durchsuchen",
                        value: 1
                    },
                    {
                        title: "Artikel nach Bezeichnung durchsuchen",
                        value: 2
                    },
                    {
                        title: "Artikel anlegen",
                        value: 3
                    },
                    {
                        title: "Artikel löschen",
                        value: 4
                    },
                    {
                        title: "Zurück gehen",
                        value: 5
                    },
                ]
            );
        }
        else {
            chosenAction = await ConsoleHandler.select("Was möchten Sie tun?",
                [
                    {
                        title: "Artikel nach ID durchsuchen",
                        value: 1
                    },
                    {
                        title: "Artikel nach Bezeichnung durchsuchen",
                        value: 2
                    },
                    {
                        title: "Zurück gehen",
                        value: 5
                    },
                ]
            );
        }
        if (chosenAction && chosenAction.selected) {
            this.handleAnswer(chosenAction.selected);
        }
        else {
            this.showArticleManagement();
        }
    }

    public handleAnswer(answer: number): void {
        let ercmSystem = new ErcmSystem;
        switch (answer) {
            case 1:
                this.searchArticleById();
                break;
            case 2:
                this.searchArticleByDesc();
                break;
            case 3:
                this.createArticle();
                break;
            case 4:
                this.deleteArticle();
                break;
            case 5:
                ercmSystem.showHomeScreen();
                break;
            default:
                ercmSystem.showHomeScreen();
                break;
        }
    }

    public async createArticle(): Promise<void> {
        this._dateToday = new Date(this._dateToday.setHours(1,0,0,0));
        let newDescription: Answers<string> = await ConsoleHandler.question("Beschreibung eingeben:");
        let newDate: Answers<string> = await ConsoleHandler.dateQuestion("Datum der Markteinführung eingeben: (Standart: heutiges Datum)", this._dateToday);
        let newPrice: Answers<string> = await ConsoleHandler.numberQuestion("Preis eingeben:");
        let newDeliveryTime: Answers<string> = await ConsoleHandler.numberQuestion("Standartlieferzeit eingeben: (Standart: 3 Tage)", 3);
        let newMinOrderLength: Answers<string> = await ConsoleHandler.numberQuestion("Minimale Bestellgröße eingeben:");
        let newMaxOrderLength: Answers<string> = await ConsoleHandler.numberQuestion("Maximale Bestellgröße eingeben:");
        let newDiscountLength: Answers<string> = await ConsoleHandler.numberQuestion("Rabattbestellgröße eingeben: (Kein Pflichtfeld)");
        let newDiscountPercent: Answers<string> = await ConsoleHandler.numberQuestion("Rabatt in Prozent eingeben: (Kein Pflichtfeld)");

        let newArticle: Article = new Article({id: uuidv4(), description: "", date: this._dateToday, price: 0, deliveryTime: 0, minOrderLength: 0, maxOrderLength: 0, discountLength: 0, discountPercent: 0});

        newArticle.setDescription(newDescription.answer);
        newArticle.setDate(newDate.answer);
        newArticle.setPrice(newPrice.answer);
        newArticle.setDeliveryTime(newDeliveryTime.answer);
        newArticle.setMinOrderLength(newMinOrderLength.answer);
        newArticle.setMaxOrderLength(newMaxOrderLength.answer);
        newArticle.setDiscountLength(newDiscountLength.answer);
        newArticle.setDiscountPercent(newDiscountPercent.answer);

        let newArticleJson: ArticleJson = ParsingHandler.parseArticleToArticleJson(newArticle);
        FileHandler.addToFile('../../data/articles.json', newArticleJson);
        ConsoleHandler.print("Erfolgreich hinzugefügt!", 1);
        setTimeout(() => {this.showArticleManagement();}, 2000);
    }

    public async deleteArticle(): Promise<void> {
        let articlesToSelect: Object[] = [];
        for (let i: number = 0; i < this._articles.length; i++) {
            articlesToSelect.push({title: this._articles[i].getDescription(), value: this._articles[i].getID()})
        }
        let idsToDelete: Answers<string> = await ConsoleHandler.multiselect("Wählen Sie die Artikel aus, die Sie löschen möchten:", "Mit Leerzeichen Artikel auswählen und mit Enter bestätigen", articlesToSelect);
        if (idsToDelete && idsToDelete.selected) {
            let submitIds: string[] = idsToDelete.selected;
            FileHandler.deleteFromFile('../../data/articles.json', submitIds);
            ConsoleHandler.print("Erfolgreich gelöscht!", 1);
            setTimeout(() => {this.showArticleManagement();}, 2000);
        }
        else {
            this.showArticleManagement();
        }
    }

    public async searchArticleById(): Promise<void> {
        let articlesToSelect: Object[] = [];
        for (let i: number = 0; i < this._articles.length; i++) {
            articlesToSelect.push({title: this._articles[i].getID(), value: this._articles[i].getID()})
        }
        let searchArticle: Answers<string> = await ConsoleHandler.autoQuestion("Artikel anhand von ID suchen:", articlesToSelect);
        this.chooseArticleAction(searchArticle.selected);
    }

    public async searchArticleByDesc(): Promise<void> {
        let articlesToSelect: Object[] = [];
        for (let i: number = 0; i < this._articles.length; i++) {
            articlesToSelect.push({title: this._articles[i].getDescription(), value: this._articles[i].getID()})
        }
        let searchArticle: Answers<string> = await ConsoleHandler.autoQuestion("Artikel anhand von Beschreibung suchen:", articlesToSelect);
        this.chooseArticleAction(searchArticle.selected);
    }

    public async chooseArticleAction(articleId: string): Promise<void> {
        let chosenArticleAction: Answers<string> = await ConsoleHandler.select("Was möchten Sie tun?",
            [
                {
                    title: "Artikel bearbeiten",
                    value: 1
                },
                {
                    title: "Statistik für diesen Artikel einsehen",
                    value: 2
                },
                {
                    title: "Bestellung erfassen",
                    value: 3
                },
                {
                    title: "Zurück gehen",
                    value: 4
                },
            ]
        );
        if (chosenArticleAction && chosenArticleAction.selected) {
            this.handleArticleAnswer(chosenArticleAction.selected, articleId);
        }
        else {
            ConsoleHandler.print("Das hat leider nicht geklappt!", 1, true);
            this.chooseArticleAction(articleId);
        }
    }

    public async handleArticleAnswer(answer: number, articleId: string): Promise<void> {
        switch (answer) {
            case 1:
                this.editArticle(articleId);
                break;
            case 2:
                this.showArticleStatistic(articleId);
                break;
            case 3:
                let orderManagement = new OrderManagement;
                orderManagement.createOrder("", articleId);
                break;
            case 4:
                this.showArticleManagement();
                break;
            default:
                this.showArticleManagement();
                break;
        }
    }

    public async editArticle(articleId: string): Promise<void> {
        let chosenEditAction: Answers<string> = await ConsoleHandler.select("Was möchten Sie tun?",
            [
                {
                    title: "Beschreibung ändern",
                    value: 1
                },
                {
                    title: "Markteinführungsdatum ändern",
                    value: 2
                },
                {
                    title: "Preis ändern",
                    value: 3
                },
                {
                    title: "Lieferzeit ändern",
                    value: 4
                },
                {
                    title: "Minimale Bestellgröße ändern",
                    value: 5
                },
                {
                    title: "Maximale Bestellgröße ändern",
                    value: 6
                },
                {
                    title: "Rabattbestellgröße ändern",
                    value: 7
                },
                {
                    title: "Rabatt ändern",
                    value: 8
                },
                {
                    title: "Zurück gehen",
                    value: 9
                },
            ]
        );
        if (chosenEditAction && chosenEditAction.selected) {
            this.handleEditAnswer(chosenEditAction.selected, articleId);
        }
        else {
            ConsoleHandler.print("Das hat leider nicht geklappt!", 1, true);
            this.editArticle(articleId);
        }
        
    }

    public async handleEditAnswer(answer: number, idToEdit: string): Promise<void> {
        this._dateToday = new Date();
        this._dateToday = new Date(this._dateToday.setHours(1,0,0,0));
        switch (answer) {
            case 1:
                let newDescription: Answers<string> = await ConsoleHandler.question("Neue Beschreibung eingeben:");
                FileHandler.editFile('../../data/articles.json', idToEdit, "description", newDescription.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showArticleManagement();}, 2000);
                break;
            case 2:
                let newDate: Answers<string> = await ConsoleHandler.dateQuestion("Neues Markteinführungsdatum eingeben:", this._dateToday);
                FileHandler.editFile('../../data/articles.json', idToEdit, "date", newDate.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showArticleManagement();}, 2000);
                break;
            case 3:
                let newPrice: Answers<string> = await ConsoleHandler.numberQuestion("Neuen Preis eingeben:");
                FileHandler.editFile('../../data/articles.json', idToEdit, "price", newPrice.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showArticleManagement();}, 2000);
                break;
            case 4:
                let newDeliveryTime: Answers<string> = await ConsoleHandler.numberQuestion("Neue Standartlieferzeit eingeben:");
                FileHandler.editFile('../../data/articles.json', idToEdit, "deliveryTime", newDeliveryTime.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showArticleManagement();}, 2000);
                break;
            case 5:
                let newMinOrderLength: Answers<string> = await ConsoleHandler.numberQuestion("Neue Minimale Bestellgröße eingeben:");
                FileHandler.editFile('../../data/articles.json', idToEdit, "minOrderLength", newMinOrderLength.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showArticleManagement();}, 2000);
                break;
            case 6:
                let newMaxOrderLength: Answers<string> = await ConsoleHandler.numberQuestion("Neue Maximale Bestellgröße eingeben:");
                FileHandler.editFile('../../data/articles.json', idToEdit, "maxOrderLength", newMaxOrderLength.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showArticleManagement();}, 2000);
                break;
            case 7:
                let newDiscountLength: Answers<string> = await ConsoleHandler.numberQuestion("Neue Rabattbestellgröße eingeben:");
                FileHandler.editFile('../../data/articles.json', idToEdit, "discountLength", newDiscountLength.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showArticleManagement();}, 2000);
                break;
            case 8:
                let newDiscountPercent: Answers<string> = await ConsoleHandler.numberQuestion("Neuen Rabatt eingeben:");
                FileHandler.editFile('../../data/articles.json', idToEdit, "discountPercent", newDiscountPercent.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showArticleManagement();}, 2000);
                break;
            case 9:
                this.showArticleManagement();
                break;
            default:
                this.showArticleManagement();
                break;
        }
    }

    public async showArticleStatistic(articleId: string) {
        let article: Article = {} as Article;
        for (let i: number = 0; i < this._articles.length; i++) {
            if (this._articles[i].getID() === articleId) {
                article = this._articles[i];
            }
        }
        let orders: Order[] = [];
        let orderJson: OrderDAO[] = FileHandler.readFile('../../data/orders.json');
        for (let order of orderJson) {
            orders.push(new Order(order));
        }

        let amountOrdered: number = 0;
        let amountOrders: number = 0;
        let salesVolume: number = 0;
        let salesVolumePerOrder: number = 0;

        for (let order of orders) {
            let positions: any = order.getPositions();
            for (let i: number = 0; i < positions.length; i++) {
                if (positions[i].articleId === articleId) {
                    amountOrdered += positions[i].amount;
                    salesVolume += positions[i].positionPrice;
                    amountOrders += 1;
                }
            }
        }
        salesVolumePerOrder = parseFloat((salesVolume / amountOrders).toFixed(2));
        console.clear();
        ConsoleHandler.print("Statistik vom Artikel: " + article.getDescription(), 2);
        ConsoleHandler.print("Gesamtzahl Verkäufe:", 1);
        ConsoleHandler.print(amountOrdered.toString(), 2);
        ConsoleHandler.print("Zahl der Bestellungen mit Artikel:", 1);
        ConsoleHandler.print(amountOrders.toString(), 2);
        ConsoleHandler.print("Gesamtumsatz:", 1);
        ConsoleHandler.print(salesVolume.toString() + "€", 2);
        ConsoleHandler.print("Durchschnitt des Umsatzes pro Bestellung mit Artikel:", 1);
        ConsoleHandler.print(salesVolumePerOrder.toString() + "€", 2);
        let chosenAction: Answers<string> = await ConsoleHandler.select("Was möchten Sie tun?",
            [
                {
                    title: "Zurück zur Auswahl",
                    value: 1
                },
            ]
        );
        if (chosenAction && chosenAction.selected) {
            switch (chosenAction.selected) {
                case 1:
                    this.chooseArticleAction(articleId);
                    break;
                default:
                    this.chooseArticleAction(articleId);
                    break;
            }
        }
        else {
            this.chooseArticleAction(articleId);
        }
    }

}