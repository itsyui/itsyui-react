import React, { useEffect, useState } from "react";
import { WidgetsFactory } from "@itsy-ui/core";
import { flatObj } from "@itsy-ui/utils";
const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
const localeStateProvider = WidgetsFactory.instance.services["appStateProvider"];

export const ItsyProvider = (props) => {
    const [loaded, setLoaded] = useState(false);
    const loadLocale = () => {
        const schemaProvider = dataLoader.getLoader("appSchemaProvider");
        const language = props.locale ? props.locale : "en";
        const messages = props.messages ? props.messages : {};

        let localeMsgs = schemaProvider.getSchemaSync(`/app/locale/${language}`);
        localeMsgs = localeMsgs ? { ...localeMsgs, ...messages } : { ...messages };
        const flatMsgs = flatObj(localeMsgs);
        localeStateProvider.setLocaleData(flatMsgs);
        setLoaded(true);
    }

    useEffect(() => {
        loadLocale();
    }, [props]);
    return (
        <>
            {loaded && props.children}
        </>
    );
}