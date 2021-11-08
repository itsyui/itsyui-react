import { WidgetsFactory } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
const schemaProvider = dataLoader.getLoader("appSchemaProvider");

import engJson from "./en.json";
schemaProvider.appendSchemaSync("/app/locale/en", engJson);