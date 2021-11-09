import { WidgetsFactory, DataLoaderFactory, IAppSchemaProvider } from '@itsy-ui/core';
import { getUrlParamValue } from "./utils";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;

export function doUpdateSchema(event: any) {
	return async (_, dispatch: any, transition: any) => {
		const { fieldSchema, objectId } = event;
		const { typeId, schemaId, dataSource, record } = fieldSchema;
		const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
		transition({
			type: "SHOW_INDICATOR",
			loadingMessage: "{{common.loadingProduct}}",
		});
		const schemaJson = await schemaProvider.getSchema(`/app/${typeId.replace(/:/g, "_")}/card/${schemaId}/data`);
		const datasourceKey = dataSource !== undefined ? dataSource : "datasource";
		const ds: any = dataLoader.getLoader(datasourceKey);

		let details;
		if (record !== undefined && record !== null) {
			details = {
				...record,
			}
		} else {
			const objData = await ds.getObject(typeId, objectId);
			details = {
				...objData,
			}
		}
		transition({
			type: "HIDE_INDICATOR",
		});
		dispatch({
			type: "UpdateSchema",
			cardJson: schemaJson,
			record: details
		});
		transition({
			type: "UPDATE_CARD_SCHEMA_DONE",
		});
	};
}
