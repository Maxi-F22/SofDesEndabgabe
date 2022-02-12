import { Answers } from 'prompts';

// singleton pattern classes
import ConsoleHandler from "./singletons/ConsoleHandler";
import FileHandler from "./singletons/FileHandler";
import ParsingHandler from './singletons/ParsingHandler';

import { ClientDAO } from "./dao/clientDao";
import { ClientJson } from './type/clientJson.type';
import { ErcmSystem, loggedinUser } from "../ERCMSystem";

export class Client {
    private _id: number;
    private _firstname: string;
    private _lastname: string;
    private _street: string;
    private _houseno: number;
    private _city: string;
    private _zip: number;
    private _discount: number;
    
    constructor(client: ClientDAO) {
        this._id = client.id;
        this._firstname = client.firstname;
        this._lastname = client.lastname;
        this._street = client.street;
        this._houseno = client.houseno;
        this._city = client.city;
        this._zip = client.zip;
        this._discount = client.discount;
    }

    public getID(): number {
        return this._id;
    }

    public getFirstname(): string {
        return this._firstname;
    }

    public setFirstname(newFirstname: string) : void {
        this._firstname = newFirstname;
    }

    public getLastname(): string {
        return this._lastname;
    }

    public setLastname(newLastname: string) : void {
        this._lastname = newLastname;
    }

    public getStreet(): string {
        return this._street;
    }

    public setStreet(newStreet: string) : void {
        this._street = newStreet;
    }

    public getHouseNo(): number {
        return this._houseno;
    }

    public setHouseNo(newHouseNo: number) : void {
        this._houseno = newHouseNo;
    }

    public getCity(): string {
        return this._city;
    }

    public setCity(newCity: string) : void {
        this._city = newCity;
    }

    public getZip(): number {
        return this._zip;
    }

    public setZip(newZip: number) : void {
        this._zip = newZip;
    }

    public getDiscount(): number {
        return this._discount;
    }

    public setDiscount(newDiscount: number) : void {
        this._discount = newDiscount;
    }

}

export class ClientManagement {

    private _clients: Client[] = [];

    constructor() {
        this.fetchClients();
    }

    public fetchClients(): void {
        this._clients = [];
        let clientJson: ClientDAO[] = FileHandler.readFile('../../data/clients.json');

        for (let client of clientJson) {
            this._clients.push(new Client(client));
        }
    }

    public async showClientManagement(): Promise<void> {
        this.fetchClients();
        let chosenAction: Answers<string> = await ConsoleHandler.select("Was möchten Sie tun?",
            [
                {
                    title: "Kunden nach ID durchsuchen",
                    value: 1
                },
                {
                    title: "Kunden nach Namen durchsuchen",
                    value: 2
                },
                {
                    title: "Kunden anlegen",
                    value: 3
                },
                {
                    title: "Kunden löschen",
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
            this.showClientManagement();
        }
    }

    public handleAnswer(answer: number): void {
        let ercmSystem = new ErcmSystem;
        switch (answer) {
            case 1:
                this.searchClientById();
                break;
            case 2:
                this.searchClientByDesc();
                break;
            case 3:
                this.createClient();
                break;
            case 4:
                this.deleteClient();
                break;
            case 5:
                ercmSystem.showHomeScreen();
                break;
            default:
                ercmSystem.showHomeScreen();
                break;
        }
    }

    public async createClient(): Promise<void> {
        let newFirstname: Answers<string> = await ConsoleHandler.question("Vornamen eingeben:");
        let newLastname: Answers<string> = await ConsoleHandler.question("Nachnamen eingeben:");
        let newStreet: Answers<string> = await ConsoleHandler.question("Straße eingeben:");
        let newHouseNo: Answers<string> = await ConsoleHandler.numberQuestion("Hausnummer eingeben:");
        let newCity: Answers<string> = await ConsoleHandler.question("Stadt eingeben:");
        let newZip: Answers<string> = await ConsoleHandler.numberQuestion("PLZ eingeben:");
        let newDiscount: Answers<string> = await ConsoleHandler.numberQuestion("Rabatt eingeben:");

        let newClient: Client = new Client({id: 123, firstname: "", lastname: "", street: "", houseno: 0, city: "", zip: 0, discount: 0});

        newClient.setFirstname(newFirstname.answer);
        newClient.setLastname(newLastname.answer);
        newClient.setStreet(newStreet.answer);
        newClient.setHouseNo(newHouseNo.answer);
        newClient.setCity(newCity.answer);
        newClient.setZip(newZip.answer);
        newClient.setDiscount(newDiscount.answer);

        let newClientJson: ClientJson = ParsingHandler.parseClientToClientJson(newClient);
        FileHandler.addToFile('../../data/clients.json', newClientJson);
        ConsoleHandler.print("Erfolgreich hinzugefügt!", 1);
        setTimeout(() => {this.showClientManagement();}, 2000);
    }

    public async deleteClient(): Promise<void> {
        let clientsToSelect: Object[] = [];
        for (let i: number = 0; i < this._clients.length; i++) {
            clientsToSelect.push({title: this._clients[i].getFirstname() + " " + this._clients[i].getLastname(), value: this._clients[i].getID()})
        }
        let idsToDelete: Answers<string> = await ConsoleHandler.multiselect("Wählen Sie die Kunden aus, die Sie löschen möchten:", "Mit Leerzeichen Kunde auswählen und mit Enter bestätigen", clientsToSelect);
        if (idsToDelete && idsToDelete.selected) {
            let submitIds: number[] = idsToDelete.selected;
            FileHandler.deleteFromFile('../../data/clients.json', submitIds);
            ConsoleHandler.print("Erfolgreich gelöscht!", 1);
            setTimeout(() => {this.showClientManagement();}, 2000);
        }
        else {
            this.showClientManagement();
        }
    }

    public async searchClientById(): Promise<void> {
        let clientsToSelect: Object[] = [];
        for (let i: number = 0; i < this._clients.length; i++) {
            clientsToSelect.push({title: this._clients[i].getID().toString(), value: this._clients[i].getID()})
        }
        let searchClient: Answers<string> = await ConsoleHandler.autoQuestion("Kunde anhand von ID suchen:", clientsToSelect);
        this.chooseClientAction(searchClient.selected);
    }

    public async searchClientByDesc(): Promise<void> {
        let clientsToSelect: Object[] = [];
        for (let i: number = 0; i < this._clients.length; i++) {
            clientsToSelect.push({title: this._clients[i].getFirstname() + " " + this._clients[i].getLastname(), value: this._clients[i].getID()})
        }
        let searchClients: Answers<string> = await ConsoleHandler.autoQuestion("Kunde anhand von Beschreibung suchen:", clientsToSelect);
        this.chooseClientAction(searchClients.selected);
    }

    public async chooseClientAction(clientId: number): Promise<void> {
        let chosenClientAction: Answers<string> = await ConsoleHandler.select("Was möchten Sie tun?",
            [
                {
                    title: "Kunde bearbeiten",
                    value: 1
                },
                {
                    title: "Statistik für diesen Kunden einsehen",
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
        if (chosenClientAction && chosenClientAction.selected) {
            this.handleClientAnswer(chosenClientAction.selected, clientId);
        }
        else {
            ConsoleHandler.print("Das hat leider nicht geklappt!", 1, true);
            this.chooseClientAction(clientId);
        }
    }

    public async handleClientAnswer(answer: number, clientId: number): Promise<void> {
        switch (answer) {
            case 1:
                this.editClient(clientId);
                break;
            case 2:
                // this.showClientStatistic(clientId);
                break;
            case 3:
                // this.newOrder(clientId);
                break;
            case 4:
                this.showClientManagement();
                break;
            default:
                this.showClientManagement();
                break;
        }
    }

    public async editClient(clientId: number): Promise<void> {
        let chosenEditAction: Answers<string> = await ConsoleHandler.select("Was möchten Sie tun?",
            [
                {
                    title: "Vornamen ändern",
                    value: 1
                },
                {
                    title: "Nachnamen ändern",
                    value: 2
                },
                {
                    title: "Straße ändern",
                    value: 3
                },
                {
                    title: "Hausnummer ändern",
                    value: 4
                },
                {
                    title: "Stadt ändern",
                    value: 5
                },
                {
                    title: "PLZ ändern",
                    value: 6
                },
                {
                    title: "Rabatt ändern",
                    value: 7
                },
                {
                    title: "Zurück gehen",
                    value: 8
                },
            ]
        );
        if (chosenEditAction && chosenEditAction.selected) {
            this.handleEditAnswer(chosenEditAction.selected, clientId);
        }
        else {
            ConsoleHandler.print("Das hat leider nicht geklappt!", 1, true);
            this.editClient(clientId);
        }
        
    }

    public async handleEditAnswer(answer: number, idToEdit: number): Promise<void> {
        switch (answer) {
            case 1:
                let newFirstname: Answers<string> = await ConsoleHandler.question("Neuen Vornamen eingeben:");
                FileHandler.editFile('../../data/clients.json', idToEdit, "firstname", newFirstname.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showClientManagement();}, 2000);
                break;
            case 2:
                let newLastname: Answers<string> = await ConsoleHandler.question("Neuen Nachnamen eingeben:");
                FileHandler.editFile('../../data/clients.json', idToEdit, "lastname", newLastname.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showClientManagement();}, 2000);
                break;
            case 3:
                let newStreet: Answers<string> = await ConsoleHandler.question("Neue Straße eingeben:");
                FileHandler.editFile('../../data/clients.json', idToEdit, "street", newStreet.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showClientManagement();}, 2000);
                break;
            case 4:
                let newHouseNo: Answers<string> = await ConsoleHandler.numberQuestion("Neue Hausnummer eingeben:");
                FileHandler.editFile('../../data/clients.json', idToEdit, "houseno", newHouseNo.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showClientManagement();}, 2000);
                break;
            case 5:
                let newCity: Answers<string> = await ConsoleHandler.question("Neue Stadt eingeben:");
                FileHandler.editFile('../../data/clients.json', idToEdit, "city", newCity.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showClientManagement();}, 2000);
                break;
            case 6:
                let newZip: Answers<string> = await ConsoleHandler.numberQuestion("Neue PLZ eingeben:");
                FileHandler.editFile('../../data/clients.json', idToEdit, "zip", newZip.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showClientManagement();}, 2000);
                break;
            case 7:
                let newDiscount: Answers<string> = await ConsoleHandler.numberQuestion("Neuen Rabatt eingeben:");
                FileHandler.editFile('../../data/clients.json', idToEdit, "discount", newDiscount.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showClientManagement();}, 2000);
                break;
            case 8:
                this.showClientManagement();
                break;
            default:
                this.showClientManagement();
                break;
        }
    }
}