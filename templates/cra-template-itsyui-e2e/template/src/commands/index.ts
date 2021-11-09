import { WidgetsFactory, DataLoaderFactory, CommandOptions } from "@itsy-ui/core";

// retrieve the DataLoaderFactory singleton
const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
// retrieve the command manager
const commandManager: any = dataLoader.getLoader("commandManager");

// Implement a command pattern object based on CommandOptions<T> interface.
// In this command, whenever LOGOUT command is executed, clears the session storage and goes to HOME page.
const logout: CommandOptions<any> = {
    canExecute: (data: any) => {
        return true;
    },
    execute: async (data: any, transition: (data: any) => void) => {
        sessionStorage.removeItem("user");
        transition({
            type: "USER_AUTHENTICATED",
            isAuthenticated: false,
        });
    }
}

// Register the command with a command_id and refer the command_id anywhere in the application
commandManager.registerCommand("logout", {}, logout);