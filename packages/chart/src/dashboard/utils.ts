import { WidgetsFactory, IDataSourceLake } from "@itsy-ui/core";
const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];

const schemaProvider = dataLoader.getLoader("appSchemaProvider");

export const showConfirmPopup = async (transition, message) => {
	const result = await new Promise((resolve, reject) => {
		const popupData = {
			popupMessage: message,
			popupType: 2,
			onOk: () => {
				transition({
					type: "HIDE_POPUP",
				});
				resolve(true);
			},
			onCancel: () => {
				transition({
					type: "HIDE_POPUP",
				});
				reject(false);
			},
		};
		transition({
			type: "SHOW_POPUP",
			event: popupData,
		});
	});
	return result;
};
export const getApiURL = async () => {
	const schemaDatasource = dataLoader.getLoader("schemaDatasource");
	const session = await schemaDatasource.getSession();
	const sitemapJson = await session.getObjectByPath("/fvb:projects/" + schemaDatasource.parentData.succinctProperties["fvb:logicalName"] + "/client/config.json");
	const contentStream = await schemaDatasource.getContentStream(sitemapJson.succinctProperties["cmis:objectId"]);
	const parsedContentSream = JSON.parse(contentStream);
	return parsedContentSream["CubeJSURL"];
}