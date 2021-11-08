/* eslint-disable */
import { ICustomStateMachineData, WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IAppSchemaProvider, IPageBindProvider, ISchemaLoader } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const pageBindProvider: IPageBindProvider = dataLoader.getLoader("pageBindProvider");
const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
const schemaLoaderFactory = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const schemaLoader = schemaLoaderFactory.getLoader<ISchemaLoader>("FormWidget");

function doCustomTabsInit(event: any) {
    return async (_, _dispatch: any, transition: any) => {

        //Get the data form Page layout
        let pagesData, currentPage, objectData;
        let data = [];
        transition({
            type: "PAGE_GET_STATE",
            onData: (data) => {
                currentPage = data.currentPage;
                pagesData = data.pages;
            },
        });
        const contextData = currentPage["contextPath"];
        const formSchemaEntity = {
            typeId: contextData.typeId,
        };
        const formSchema = await schemaLoader.getControlSchema(formSchemaEntity);
        if (event.data && event.data.length > 0) {
            const objectData = event.data[0];
           
            if (objectData) {
                const formSchemaProps = {
                    "name": "form",
                    "properties": {
                        "ui:widget": "form",
                        "typeId": contextData.typeId,
                        "formSchema": formSchema,
                        "objectId": objectData,
                    },
                };

                data.push({
                    title: formSchema.displayName,
                    content: formSchemaProps,
                    key: "0",
                    closable: false,
                });
            }
        }
        transition({
            type: "TABS_LOAD",
            data: data,
        });
    };
}

const customTabBinding: ICustomStateMachineData = {
    name: "customTabBinding",
    stateJSON: {
        "states": {
            "tabsInit": {
                "onEntry": [
                    "onCustomTabInit",
                ],
                "on": {
                    "TABS_LOAD": "tabsLoad",
                },
            },
        },
    },
    mapDispatchToAction: (dispatch) => {
        return {
            onCustomTabInit: (evt) => dispatch(doCustomTabsInit(evt)),
        };
    },
};

pageBindProvider.putSchema("TabsWidget", "updateTabContextFromPage", customTabBinding);

