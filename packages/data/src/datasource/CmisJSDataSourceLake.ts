import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IConfigLoader, IDataSourceLake } from "@itsy-ui/core";
import { refreshToken, getItemFromLocalStorage, verifyJWT, create_UUID } from "@itsy-ui/utils";
import { upsertChildRecords } from "./dataUtils";

const cmis = require("cmis");

const CmisConstants = {
	Properties: {
		ObjectId: "cmis:objectId",
		ObjectTypeId: "cmis:objectTypeId",
		BaseId: "cmis:baseId",
		Name: "cmis:name",
	},
	Types: {
		Document: "cmis:document",
		Item: "cmis:item",
		Folder: "cmis:folder",
	},
	Query: {
		Direction: {
			Source: "source",
			Target: "target"
		},
		SortType: {
			Ascending: "asce",
			Descending: "dsc"
		}
	}
};

export class CmisJSDataSourceLake implements IDataSourceLake {
	private session: any;
	private cmisURL: string = "";
	static async newInstance(cmisURL: string = "") {
		const ds = new CmisJSDataSourceLake();
		await ds._connectToCMIS(cmisURL);
		return ds;
	}

	static getColumns = (params, _existingFilter) => {
		if (params.hasOwnProperty("propertyDefinitions")) {
			const defaultColumns = ["cmis:name", "cmis:objectId", "cmis:createdBy", "cmis:lastModifiedBy", "cmis:objectTypeId", "cmis:lastModificationDate", "cmis:path",
				...Object.keys(params.propertyDefinitions)];
			return defaultColumns.filter((col, index) => defaultColumns.indexOf(col) === index).join(",");
		}
		return "*";
	}

	static checkIfAlreadyExist = (columnName, existingFilter) => {
		if (existingFilter) {
			return typeof existingFilter === "object" ? existingFilter.hasOwnProperty(columnName) : existingFilter.includes(columnName);
		}
		return false;
	}

	static getFilter = (params: any) => {
		let filterString = "";
		if (params.filter) {
			filterString = typeof params.filter === "object" ? CmisJSDataSourceLake.getFilterString(params.filter, params.propertyDefinitions) : params.filter;
			const cols = CmisJSDataSourceLake.getColumns(params, params.filter);
			filterString = `${cols},${filterString}`;
		}

		return filterString;
	}

	static getFilterValue(item: any, column: any) {
		if (column && column.propertyType === "string") {
			return `'${item.value}'`;
		}
		return `${item.value}`;
	}

	static getFilterString = (filterJson: any, propertyDefinitions: any) => {
		let filterString = "";
		for (const key in filterJson) {
			if (filterJson.hasOwnProperty(key)) {
				const filters = filterJson[key];
				if (Array.isArray(filters) && filters.length > 0) {
					let filterText = "";
					filters.forEach(item => {
						const itemValue = CmisJSDataSourceLake.getFilterValue(item, propertyDefinitions && propertyDefinitions[key])
						switch (item.operation) {
							case "contains":
								filterText = filterText.length > 0 ? `${filterText} or contains(${key}:: ${itemValue})` : `contains(${key}:: ${itemValue})`;
								break;
							case "exists":
								filterText = filterText.length > 0 ? `${filterText} or exists(${key}:: ${itemValue})` : `exists(${key}:: ${itemValue})`;
								break;
							case "in":
								filterText = filterText.length > 0 ? `${filterText} or in(${key}:: ${itemValue})` : `in(${key}:: '${Array.isArray(item.value) ? item.value.join(" ") : item.value}')`;
								break;
							default:
								filterText = filterText.length > 0 ? `${filterText} or ${key} ${item.operation} ${itemValue}` : `${key} ${item.operation} ${itemValue}`;
								break;
						}
					});
					if (filterText.length > 0) {
						filterString = filterString.length > 0 ? `${filterString} and ${filterText}` : filterText;
					}
				}
			}
		}
		return filterString;
	}

	async _connectToCMIS(cmisURL: string = "", shouldRefreshToken: boolean = false) {
		if (shouldRefreshToken) {
			await refreshToken();
		}

		const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
		const configDataLoader = dataLoader.getLoader<IConfigLoader>("config");
		const cfg = await configDataLoader.getConfig();
		if (!cfg) {
			throw new Error("Config data not present to create CMIS session");
		}

		let _cmisURL = cmisURL;
		if (_cmisURL === "") {
			const localFVData: any = getItemFromLocalStorage("FV_TENANT_INFO");
			if (localFVData === undefined || localFVData !== null && Object.keys(localFVData).length === 0) {
				throw new Error("CMIS URL from tenant info not found");
			}

			_cmisURL = `${cfg.CmisURL}/${localFVData.repository[0]}`;
			this.cmisURL = _cmisURL;
		}
		const session = new cmis.CmisSession(_cmisURL);
		const userPass = atob(getItemFromLocalStorage("USER_LOCAL", false)).split(":");
		session.setCredentials(userPass[0], userPass[1]);
		await session.loadRepositories();
		// hackfix for HTTPS
		const actualCMISUrl = new URL(session.defaultRepository.repositoryUrl);
		const configCMISUrl = new URL(cfg.CmisURL);
		if (actualCMISUrl.protocol !== configCMISUrl.protocol) {
			session.defaultRepository.repositoryUrl = `${configCMISUrl.origin}${actualCMISUrl.pathname}`;
			session.defaultRepository.rootFolderUrl = `${configCMISUrl.origin}${actualCMISUrl.pathname}/root`;
		}

		this.session = session;
	}

	async _verifyAndRefreshToken() {
		const userPass = atob(getItemFromLocalStorage("USER_LOCAL", false)).split(":");
		if (!verifyJWT(userPass[1])) {
			await this._connectToCMIS(this.cmisURL, true);
		}
	}

	_readAsObject(rowData: any): {} | null {
		if (rowData.object && rowData.object.succinctProperties) {
			return rowData.object.succinctProperties;
		} else {
			return null;
		}
	}

	async getObject(_typeId: string, objectId: string, parameters?: {}): Promise<any> {
		await this._verifyAndRefreshToken();
		const datatype = parameters && parameters["datatype"] ? parameters["datatype"] : "object";
		switch (datatype) {
			case "object":
				const rowData = await this.session.getObject(objectId, undefined, parameters);
				return rowData.succinctProperties;
			case "content":
				const streamData = await this.session.getContentStream(objectId, "inline");
				return streamData;
			case "acl":
				const acl = await this.session.getACL(objectId);
				return acl;
		}

		return null;
	}

	getFilteredProps = (props: string[], obj: {}) => {
		const val = {};
		for (const key in obj) {
			if (props.indexOf(key) > -1) {
				val[key] = obj[key];
			}
		}

		return val;
	}

	async getAll(typeId: string, parameters: any): Promise<any[]> {
		try {
			await this._verifyAndRefreshToken();
			const typeObjectPath = `/${typeId}`;
			const propDefs = parameters.propertyDefinitions ? parameters.propertyDefinitions : {};
			const relatedField = Object.keys(propDefs).length > 0 ? Object.keys(propDefs).find(key => propDefs[key].fieldType === "mapped") : null;
			let rowsData: any = null;
			if (relatedField) {
				rowsData = await this.getRelatedRecords(relatedField, propDefs, typeId, parameters);
			} else {
				const parentData = await this.session.getObjectByPath(typeObjectPath);
				const parentFolderObjectId = parentData.succinctProperties[CmisConstants.Properties.ObjectId];
				parameters.filter = CmisJSDataSourceLake.getFilter(parameters);
				const queryParameters: any = {
					...this.getFilteredProps(["pageCount", "skipCount", "filter", "orderBy", "maxItems", "includeRelationships"], parameters),
				};
				rowsData = await this.session.getChildren(parentFolderObjectId, queryParameters);
			}

			if (rowsData && rowsData.numItems > 0) {
				const currentObjects = relatedField ? rowsData.records : rowsData.objects.map(this._readAsObject);
				currentObjects["totalRecordsCount"] = rowsData.numItems;
				return currentObjects;
			} else {
				return [];
			}
		} catch (e) {
			// console.error("CmisJSDataSourceLake.getAll error: ", e);
			return [];
		}
	}

	//Supports one-to-one relationship only
	async getRelatedRecords(relatedFieldKey: any, propDefs: {}, typeId: string, parameters: any) {
		const data: any = {};
		if (relatedFieldKey && typeId) {
			try {
				const relatedField = propDefs[relatedFieldKey];
				if (relatedField) {
					const { displayKey, direction, mappedTypeId } = relatedField;
					const relatedFields = Array.isArray(displayKey) ? displayKey.reduce((fieldVal, key) => { return { ...fieldVal, ...{ [`${mappedTypeId}.${key}`]: {} } } }, {}) : {};
					const propDefFields = Object.keys(propDefs).reduce((fieldVal, key) => { return { ...fieldVal, ...{ [`${typeId}.${key}`]: {} } } }, {});
					const sourceTypeId = direction === CmisConstants.Query.Direction.Source ? mappedTypeId : typeId;
					const isSourceType = sourceTypeId === typeId;
					const targetTypeId = isSourceType ? mappedTypeId : typeId;
					const queryDirection = isSourceType ? CmisConstants.Query.Direction.Source : CmisConstants.Query.Direction.Target;
					data.records = await this.executeQuery(sourceTypeId, targetTypeId, isSourceType ? propDefFields : relatedFields, isSourceType ? relatedFields : propDefFields, queryDirection, parameters);
					data.numItems = Array.isArray(data.records) && data.records.length > 0 ? data.records.pop().TotalObjects : 0;
					return data;
				}
				return data;
			} catch (ex) {
				return data;
			}
		}
		return data;
	}

	async executeQuery(sourceTypeId: string, targetTypeId: string, sourceFields: {}, targetFields: {}, direction: string = CmisConstants.Query.Direction.Source, parameters: any) {
		const nqFilter = this.getNQFilter(parameters.filter, direction === CmisConstants.Query.Direction.Source ? sourceTypeId : targetTypeId);
		const nqSort = this.getNQSort(parameters.orderBy, direction === CmisConstants.Query.Direction.Source ? sourceTypeId : targetTypeId);
		const queryJSON = {
			size: parameters.maxItems + parameters.skipCount,
			step: parameters.skipCount,
			filter: [],
			sort: [],
			fields: {
				[`${sourceTypeId}_${targetTypeId}`]: {
					filter: [{
						field: `${targetTypeId}.cmis:objectTypeId`,
						operator: "eq",
						value: targetTypeId
					}, ...nqFilter],
					...nqSort && { sort: nqSort },
					...{ direction },
					...direction === CmisConstants.Query.Direction.Target ? Object.keys(sourceFields).length > 0 &&
						{ fields: { ...sourceFields } } : Object.keys(targetFields).length > 0 && { fields: { ...targetFields } },
				},
				...direction === CmisConstants.Query.Direction.Target ? Object.keys(targetFields).length > 0 && { ...targetFields }
					: Object.keys(sourceFields).length > 0 && { ...sourceFields },
			}
		};
		return await this.session.query(queryJSON);
	}

	getNQFilter(filterData: any, typeId: string): any[] {
		const filter = [];
		if (filterData && filterData !== {}) {
			for (const key in filterData) {
				if (filterData.hasOwnProperty(key) && Array.isArray(filterData[key])) {
					filterData[key].forEach(x => {
						const filterVal = { field: `${typeId}.${key}`, operator: x.operation, value: x.value, ...x.type && { type: x.type } };
						if (Array.isArray(x.value)) {
							const condition = x.operation === "ne" ? "and" : "or";
							x.value.forEach(cVal => filter.push({ ...filterVal, ...{ value: cVal, type: condition } }));
						} else {
							filter.push(filterVal);
						}
					});
				}
			}
		}
		return filter;
	}

	getNQSort(sortData: string, typeId: string): any {
		const sort = sortData && sortData.includes(" ") ? sortData.split(" ") : [];
		const sortColumns = sort.length > 0 ? sort[0].split(",") : [];
		const sortType = sort.length > 1 ? sort[1] : "";
		if (sortColumns.length > 0 && sortType) {
			return sortColumns.map(scol => {
				return {
					field: `${typeId}.${scol.trim()}`,
					operator: sortType === "desc" ? CmisConstants.Query.SortType.Descending : CmisConstants.Query.SortType.Ascending
				}
			});
		}
		return null;
	}

	_getName(record: any, uniquePropertyForCMISName: string | string[]) {
		if (uniquePropertyForCMISName === undefined || uniquePropertyForCMISName === null) {
			return record["cmis:objectId"];
		}
		else if (typeof uniquePropertyForCMISName === "string") {
			return `${record[uniquePropertyForCMISName]}`;
		} else {
			const uniqueVals: any[] = [];
			for (const prop in record) {
				if (uniquePropertyForCMISName.indexOf(prop) > -1) {
					uniqueVals.push(record[prop]);
				}
			}

			return uniqueVals.join("-");
		}
	}

	async upsert(record: any, formSchema: any): Promise<any> {
		if (record["cmis:objectId"] !== undefined && record["cmis:objectId"] !== null && record["cmis:objectId"] !== "") {
			return this.update(record, formSchema);
		} else {
			return this.create(record, formSchema);
		}
	}

	async create(record: any, formSchema: any): Promise<any> {
		if (formSchema["id"] === undefined) {
			throw new Error("objectTypeId cannot be empty in formSchema");
		}

		await this._verifyAndRefreshToken();
		if (record["cmis:objectId"] === undefined || record["cmis:objectId"] === null) {
			record["cmis:objectId"] = create_UUID();
		}
		record["cmis:objectTypeId"] = formSchema["id"];
		record["cmis:name"] = record["cmis:name"] === undefined ? formSchema["uniquePropertyId"] ? this._getName(record, formSchema["uniquePropertyId"]) : record["cmis:objectId"] : record["cmis:name"];
		const actualRecord = { ...record };
		const childFields = Object.keys(formSchema.propertyDefinitions).filter(t => formSchema.propertyDefinitions[t].fieldType === "mapped");
		childFields.forEach(t => { delete record[t]; });
		const typeObjectPath = `/${record[CmisConstants.Properties.ObjectTypeId]}`;
		const parentData = await this.session.getObjectByPath(typeObjectPath);
		const parentFolderObjectId = parentData.succinctProperties[CmisConstants.Properties.ObjectId];
		const { cmisOptions } = formSchema;
		const addACEs = cmisOptions !== undefined ? cmisOptions.addACEs : undefined;
		const removeACEs = cmisOptions !== undefined ? cmisOptions.removeACEs : undefined;
		switch (formSchema["baseId"]) {
			case CmisConstants.Types.Document:
				try {
					const fileContent = formSchema.content ? formSchema.content : Array.isArray(record.content) && record.content.length > 0 && typeof record.content[0] === "object" ? record.content[0] : null; //record.content[0] is File object
					delete record.content;
					const d = await this.session.createDocument(parentFolderObjectId, fileContent, record, formSchema.mimeTypeExtension, undefined, undefined, addACEs, removeACEs, undefined);
					if (Array.isArray(childFields) && childFields.length > 0) {
						await upsertChildRecords(record["cmis:objectId"], actualRecord, formSchema, childFields, this);
					}
					return d.succinctProperties;
				} catch (e) {
					throw e;
				}
				break;
			case CmisConstants.Types.Item:
				try {
					const r = await this.session.createItem(parentFolderObjectId, record, undefined, addACEs, removeACEs, undefined);
					if (Array.isArray(childFields) && childFields.length > 0) {
						await upsertChildRecords(record["cmis:objectId"], actualRecord, formSchema, childFields, this);
					}
					return r;
				} catch (e) {
					throw e;
				}
			case CmisConstants.Types.Folder:
				break;
			default:
				throw new Error("baseId is wrongly defined: " + record[CmisConstants.Properties.BaseId]);
				break;
		}
	}

	async update(record: any, formSchema: any): Promise<any> {
		if (record["cmis:objectId"] === undefined) {
			throw new Error("cmis:objectId cannot be empty in formSchema");
		}

		try {
			await this._verifyAndRefreshToken();
			const objectId = record["cmis:objectId"];
			const actualRecord = { ...record };
			let childFields = [];
			if (formSchema !== undefined && Object.keys(formSchema).length > 0) {
				childFields = Object.keys(formSchema.propertyDefinitions).filter(t => formSchema.propertyDefinitions[t].fieldType === "mapped");
				childFields.forEach(t => { delete record[t]; });
			}
			const r = await this.session.updateProperties(objectId, record);
			if (Array.isArray(childFields) && childFields.length > 0) {
				await upsertChildRecords(record["cmis:objectId"], actualRecord, formSchema, childFields, this);
			}
			return r.succinctProperties;
		} catch (e) {
			throw e;
		}
	}

	async delete(objectId: string): Promise<any> {
		if (objectId === "") {
			throw new Error("object ID cannot be empty");
		}
		try {
			await this._verifyAndRefreshToken();
			const r = await this.session.deleteObject(objectId);
			return r;
		} catch (e) {
			throw e;
		}
	}

	async createRelationship(record: {}): Promise<any> {
		if (record["cmis:sourceId"] === undefined && record["cmis:targetId"] === undefined) {
			throw new Error("sourceId & target Id cannot be empty ");
		}
		try {
			await this._verifyAndRefreshToken();
			const r = await this.session.createRelationship(record);
			return r;
		} catch (e) {
			throw e;
		}
	}

	async getRelationshipChildren(typeId: string): Promise<any> {
		if (typeId === undefined) {
			throw new Error("typeId is undefined");
		}
		try {
			await this._verifyAndRefreshToken();
			const childrenData = await this.session.getObject(typeId);
			return childrenData;
		} catch (e) {
			throw e;
		}
	}

	getSession(): any {
		return this.session;
	}
}
