import { WidgetsFactory } from "@itsy-ui/core";

// retrieve the DataLoaderFactory singleton
const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
// retrieve the custom state machine provider
const schemaProvider = dataLoader.getLoader("appSchemaProvider");

// Registers all the app schema into the schema provider
schemaProvider.appendSchemaSync("/app/locale/en", require("./locale/en.json"));
schemaProvider.putSchema("/app/command/data", require("./command.json"));
schemaProvider.putSchema("/app/login/form/login/data", require("./app/login/form/login.json"));
schemaProvider.putSchema("/app/login/grid/login/data", require("./app/login/grid/login.json"));
schemaProvider.putSchema("/app/pages/login/data", require("./pages/login.json"));
schemaProvider.putSchema("/app/pages/home/data", require("./pages/home.json"));
schemaProvider.putSchema("/app/pages/second/data", require("./pages/second.json"));