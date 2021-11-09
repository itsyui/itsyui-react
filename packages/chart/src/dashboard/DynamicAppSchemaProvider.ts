import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IDataSourceLake } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;

const Actions = {
	SIDEBAR: "sidebar",
	NAVBAR: "navbar",
	PAGES: "pages",
	USERMAPPING: "userMapping",
	DASHBOARD: "dashboard"
};

export class DynamicAppSchemaProvider {

	getFileName(splitedPath: any) {
		if (splitedPath.length === 3) {
			return null;
		}
		if (splitedPath.length === 4) {
			return `${splitedPath[2]}.json`;
		}
		if (splitedPath[4] === "default") {
			return splitedPath[2];
		} else {
			const pagesIndex = splitedPath.findIndex(item => item.includes("pages"));
			if (pagesIndex > 0) {
				return splitedPath[pagesIndex + 1] ? `${splitedPath[pagesIndex + 1]}.json` : null;
			}
			const dashboardIndex = splitedPath.findIndex(item => item.includes("dashboard"));
			if (dashboardIndex > 0) {
				return splitedPath[dashboardIndex + 1] ? `${splitedPath[dashboardIndex + 1]}` : null;
			}
			return splitedPath[4];
		}
	}

	generatePath(appSchemaDatasource: any, splitedPath: any) {
		const isSidebarOrNavbar = splitedPath.find(t => {
			if (t.includes(Actions.PAGES) || t.includes(Actions.NAVBAR) || t.includes(Actions.SIDEBAR) || t.includes(Actions.USERMAPPING) || t.includes(Actions.DASHBOARD) ) {
				return t;
			}
		});
		switch (isSidebarOrNavbar) {
			case Actions.NAVBAR:
			case Actions.SIDEBAR:
			case Actions.USERMAPPING:
				return `/fvb:projects/${appSchemaDatasource.parentData.succinctProperties["fvb:logicalName"]}/client`;
			case Actions.PAGES:
				return `/fvb:projects/${appSchemaDatasource.parentData.succinctProperties["fvb:logicalName"]}/client/pages`;
			case Actions.DASHBOARD:
					return `/fvb:projects/${appSchemaDatasource.parentData.succinctProperties["fvb:logicalName"]}/client/dashboard`;	
			default:
				return `/fvb:projects/${appSchemaDatasource.parentData.succinctProperties["fvb:logicalName"]}/client/app/${splitedPath[2]}/${splitedPath[3]}`;
		}

	}

	async getSchema(propertyPath: string) {
		try {
			const appSchemaDatasource: any = dataLoader.getLoader<IDataSourceLake>("schemaDatasource");
			if (appSchemaDatasource) {
				const session = await appSchemaDatasource.getSession();
				const splitedPath = propertyPath.split("/");
				const fileName = this.getFileName(splitedPath);
				const path = this.generatePath(appSchemaDatasource, splitedPath);
				if (session) {
					const projectFolder = await session.getObjectByPath(path);
					if (fileName) {
						const files = await session.getChildren(projectFolder["succinctProperties"]["cmis:objectId"], { filter: `*,cmis:objectId eq ${fileName}` });
						if (files && Array.isArray(files.objects) && files.objects.length > 0) {
							const contentStream = await appSchemaDatasource.getContentStream(files.objects[0]["object"].succinctProperties["cmis:objectId"], "inline");
							return JSON.parse(contentStream);
						}
					}
					return null;
				}
			} else {
				// tslint:disable-next-line: no-console
				console.info("datasource not defined");
			}
		} catch (e) {
			// tslint:disable-next-line: no-console
			console.error("Error loading  file: ", e);
			throw e;
		}

	}

}
