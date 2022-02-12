import { Answers } from 'prompts';

// singleton pattern classes
import ConsoleHandler from "./classes/singletons/ConsoleHandler";
import FileHandler from "./classes/singletons/FileHandler";

// regular classes
import { UserDAO } from "./classes/dao/userDao";
import { User, UserManagement } from "./classes/User"
import { ArticleManagement } from './classes/Articles';
import { ClientManagement } from './classes/Clients';

export let loggedinUser: User = {} as User;

export class ErcmSystem {
    private _users: User[] = [];

    constructor() {
        let userJson: UserDAO[] = FileHandler.readFile('../../data/users.json');

        for (let user of userJson) {
            this._users.push(new User(user));
        }
    }

    public showStartScreen(): void {
        ConsoleHandler.print("---- Willkommen beim ERCM-System ----", 3);
        ConsoleHandler.print("Bitte loggen Sie sich ein", 2);
        this.showLoginScreen();
    }

    public async showLoginScreen(): Promise<void> {
        let username: Answers<string> = await ConsoleHandler.question("Benutzernamen eingeben:");
        let password: Answers<string> = await ConsoleHandler.question("Passwort eingeben:");
        ConsoleHandler.print("", 2);
        if (username && password && username.answer && password.answer) {
            this.handleLoginData(username.answer, password.answer);
        }
        else {
            this.showLoginScreen();
        }
    }

    public handleLoginData(username: string, password: string): void {
        let loginSuccess: boolean = false;
        for (let user of this._users) {
            if (user.getUsername() === username && user.getPassword() === password) {
                loggedinUser = user;
                loginSuccess = true;
            }
        }
        if (loginSuccess) {
            ConsoleHandler.print("Erfolgreich angemeldet", 1);
            setTimeout(() => {console.clear(); this.showHomeScreen();}, 2000);
        }
        else {
            ConsoleHandler.print("Benutzername oder Passwort nicht gefunden.", 1, true);
            ConsoleHandler.print("Bitte loggen Sie sich erneut an.", 2);
            this.showLoginScreen();
        }
    }

    public async showHomeScreen(): Promise<void> {
        let chosenAction: Answers<string> = await ConsoleHandler.select("Was möchten Sie tun?",
            [
                {
                    title: "Artikelverwaltung",
                    value: 1
                },
                {
                    title: "Kundenverwaltung",
                    value: 2
                },
                {
                    title: "Bestellungsverwaltung",
                    value: 3
                },
                {
                    title: "Nutzerverwaltung",
                    value: 4
                },
                {
                    title: "Abmelden",
                    value: 5
                },
            ]
        );
        if (chosenAction && chosenAction.selected) {
            this.handleAnswer(chosenAction.selected);
        }
        else {
            this.showHomeScreen();
        }
    }

    public handleAnswer(answer: number): void {
        switch (answer) {
            case 1:
                let articleManagement = new ArticleManagement;
                articleManagement.showArticleManagement();
                break;
            case 2:
                let clientManagement = new ClientManagement;
                clientManagement.showClientManagement();
                break;
            case 3:
                // Order.showOrderManagement();
                break;
            case 4:
                let userManagement = new UserManagement;
                userManagement.showUserManagement();
                break;
            case 5:
                this.showStartScreen();
                break;
            default:
                this.showHomeScreen
                break;
        }
    }
}