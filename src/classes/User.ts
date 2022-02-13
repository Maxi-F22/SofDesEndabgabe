import { Answers } from 'prompts';
import { v4 as uuidv4 } from 'uuid';

// singleton pattern classes
import ConsoleHandler from "./singletons/ConsoleHandler";
import FileHandler from "./singletons/FileHandler";
import ParsingHandler from './singletons/ParsingHandler';

import { UserDAO } from "./dao/userDao";
import { UserJson } from './type/userJson.type';
import { ErcmSystem, loggedinUser } from "../ERCMSystem";

export class User {
    private _id: string;
    private _username: string;
    private _password: string;
    private _isAdmin: boolean;
    
    constructor(user: UserDAO) {
        this._id = user.id;
        this._username = user.username;
        this._password = user.password;
        this._isAdmin = user.isAdmin;
    }

    public getID(): string {
        return this._id;
    }

    public getUsername(): string {
        return this._username;
    }

    public setUsername(newUsername: string) : void {
        this._username = newUsername;
    }

    public getPassword(): string {
        return this._password;
    }

    public setPassword(newPassword: string) : void {
        this._password = newPassword;
    }

    public getAdminStatus(): boolean {
        return this._isAdmin;
    }

    public setAdminStatus(isAdmin: boolean) : void {
        this._isAdmin = isAdmin;
    }
}

export class UserManagement {

    private _users: User[] = [];

    constructor() {
        this.fetchUsers();
    }

    public fetchUsers(): void {
        this._users = [];
        let userJson: UserDAO[] = FileHandler.readFile('../../data/users.json');

        for (let user of userJson) {
            this._users.push(new User(user));
        }
    }

    public async showUserManagement(): Promise<void> {
        this.fetchUsers();
        let chosenAction: Answers<string> = await ConsoleHandler.select("Was möchten Sie tun?",
            [
                {
                    title: "Benutzer anlegen",
                    value: 1
                },
                {
                    title: "Benutzer bearbeiten",
                    value: 2
                },
                {
                    title: "Benutzer löschen",
                    value: 3
                },
                {
                    title: "Zurück gehen",
                    value: 4
                },
            ]
        );
        if (chosenAction && chosenAction.selected) {
            this.handleAnswer(chosenAction.selected);
        }
        else {
            this.showUserManagement();
        }
    }

    public handleAnswer(answer: number): void {
        let ercmSystem = new ErcmSystem;
        switch (answer) {
            case 1:
                this.createUser();
                break;
            case 2:
                this.editUser();
                break;
            case 3:
                this.deleteUser();
                break;
            case 4:
                ercmSystem.showHomeScreen();
                break;
            default:
                ercmSystem.showHomeScreen();
                break;
        }
    }

    public async createUser(): Promise<void> {
        let newUsername: Answers<string> = {};
        while (true) {
            let usernameGiven: boolean = false;
            newUsername = await ConsoleHandler.question("Neuen Benutzernamen eingeben:");
            let usernameValid: boolean = this.checkUsernameValidity(newUsername.answer);
            if (!usernameValid) {
                ConsoleHandler.print("Dieser Benutzername ist nicht zulässig!", 1, true);
            }
            else {
                for (let i: number = 0; i < this._users.length; i++) {
                    if (this._users[i].getUsername().toLowerCase() === newUsername.answer.toLowerCase()) {
                        ConsoleHandler.print("Dieser Benutzername ist bereits vergeben!", 1, true);
                        usernameGiven = true;
                        continue;
                    }
                }
                if (!usernameGiven) {
                    break;
                }
            }
        }
        let newPassword: Answers<string> = await ConsoleHandler.question("Neues Passwort eingeben:");
        let newIsAdmin: Answers<string> = await ConsoleHandler.booleanQuestion("Ist der neue Benutzer ein Administrator?");

        let newUser = new User({id: uuidv4(), username: "", password: "", isAdmin: false});
        
        if (newUsername && newUsername.answer && newPassword && newPassword.answer && newIsAdmin) {
            newUser.setUsername(newUsername.answer);
            newUser.setPassword(newPassword.answer);
            newUser.setAdminStatus(newIsAdmin.answer);

            let newUserJson: UserJson = ParsingHandler.parseUserToUserJson(newUser);
            FileHandler.addToFile('../../data/users.json', newUserJson);
            ConsoleHandler.print("Erfolgreich hinzugefügt!", 1);
            setTimeout(() => {this.showUserManagement();}, 2000);
        }
        else {
            ConsoleHandler.print("Das hat leider nicht geklappt!", 1, true);
            this.createUser();
        }
    }

    public async deleteUser(): Promise<void> {
        let usersToSelect: Object[] = [];
        for (let i: number = 0; i < this._users.length; i++) {
            usersToSelect.push({title: this._users[i].getUsername(), value: this._users[i].getID()})
        }
        let idsToDelete: Answers<string> = await ConsoleHandler.multiselect("Wählen Sie die Benutzer aus, die Sie löschen möchten:", "Mit Leerzeichen Benutzer auswählen und mit Enter bestätigen", usersToSelect);
        if (idsToDelete && idsToDelete.selected) {
            let submitIds: string[] = idsToDelete.selected;
            FileHandler.deleteFromFile('../../data/users.json', submitIds);
            ConsoleHandler.print("Erfolgreich gelöscht!", 1);
            setTimeout(() => {this.showUserManagement();}, 2000);
        }
        else {
            this.showUserManagement();
        }
    }

    public async editUser(): Promise<void> {
        let usersToSelect: Object[] = [];
        for (let i: number = 0; i < this._users.length; i++) {
            usersToSelect.push({title: this._users[i].getUsername(), value: this._users[i].getID()})
        }
        let searchUser: Answers<string> = await ConsoleHandler.autoQuestion("Benutzer zum Ändern suchen:", usersToSelect);
        let chosenEditAction: Answers<string> = await ConsoleHandler.select("Was möchten Sie tun?",
            [
                {
                    title: "Benutzernamen ändern",
                    value: 1
                },
                {
                    title: "Passwort ändern",
                    value: 2
                },
                {
                    title: "Adminstatus ändern",
                    value: 3
                },
                {
                    title: "Zurück gehen",
                    value: 4
                },
            ]
        );
        if (searchUser && searchUser.selected && chosenEditAction && chosenEditAction.selected) {
            this.handleEditAnswer(chosenEditAction.selected, searchUser.selected);
        }
        else {
            ConsoleHandler.print("Das hat leider nicht geklappt!", 1, true);
            this.editUser();
        }
        
    }

    public async handleEditAnswer(answer: number, idToEdit: string): Promise<void> {
        switch (answer) {
            case 1:
                let newUsername: Answers<string> = {};
                while (true) {
                    let usernameGiven: boolean = false;
                    newUsername = await ConsoleHandler.question("Neuen Benutzernamen eingeben:");
                    let usernameValid: boolean = this.checkUsernameValidity(newUsername.answer);
                    if (!usernameValid) {
                        ConsoleHandler.print("Dieser Benutzername ist nicht zulässig!", 1, true);
                    }
                    else {
                        for (let i: number = 0; i < this._users.length; i++) {
                            if (this._users[i].getUsername().toLowerCase() === newUsername.answer.toLowerCase()) {
                                ConsoleHandler.print("Dieser Benutzername ist bereits vergeben!", 1, true);
                                usernameGiven = true;
                                continue;
                            }
                        }
                        if (!usernameGiven) {
                            break;
                        }
                    }
                }
                FileHandler.editFile('../../data/users.json', idToEdit, "username", newUsername.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showUserManagement();}, 2000);
                break;
            case 2:
                let newPassword: Answers<string> = await ConsoleHandler.question("Neues Passwort eingeben:");
                FileHandler.editFile('../../data/users.json', idToEdit, "password", newPassword.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showUserManagement();}, 2000);
                break;
            case 3:
                let newIsAdmin: Answers<string> = await ConsoleHandler.booleanQuestion("Ist der Benutzer ein Administrator?");
                FileHandler.editFile('../../data/users.json', idToEdit, "isAdmin", newIsAdmin.answer);
                ConsoleHandler.print("Erfolgreich geändert!", 1);
                setTimeout(() => {this.showUserManagement();}, 2000);
                break;
            case 4:
                this.showUserManagement();
                break;
            default:
                this.showUserManagement();
                break;
        }
    }

    public checkUsernameValidity(username: string): boolean {
        let usernameRegEx: RegExp = new RegExp('^(?=.{4,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$');
        if (usernameRegEx.test(username) === true) {
            return true;
        }
        else {
            return false;
        }
    }
}