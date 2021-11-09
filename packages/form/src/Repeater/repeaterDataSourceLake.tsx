import { IDataSourceLake } from "@itsy-ui/core";
import { getNewId } from "@itsy-ui/utils";

export class RepeaterDatasource implements IDataSourceLake {

	public isInitialized: boolean = false;
	public records: any[] = [];

	initializeRecords(records: any[]) {
		if (Array.isArray(records) && !this.isInitialized) {
			const parsedRecords = this.getParseRecords(records);
			const initRecord = parsedRecords.map(t => {
				t["repId"] = getNewId();
				return t;
			});
			this.records = initRecord;
			this.isInitialized = true;
		}
	}

	getAll(): Promise<any> {
		const availableRecords = [];
		this.records.forEach((record: any) => {
			const currentRecord = { ...record };
			if (currentRecord && Array.isArray(currentRecord.content)) {
				const fileNames = currentRecord.content.map(content => { return content.name; });
				currentRecord.content = fileNames;
			}
			availableRecords.push(currentRecord);
		});
		availableRecords["totalRecordsCount"] = this.records.length;
		return Promise.resolve(availableRecords);
	}

	getActualRecords() {
		return this.getParseRecords(this.records);
	}

	getParseRecords(records: any) {
		const parsedRecords = [];
		if (Array.isArray(records)) {
			records.forEach((record: any) => {
				const currentRecord = { ...record };
				delete currentRecord.repId;
				parsedRecords.push(currentRecord);
			});
		}
		return parsedRecords;
	}

	getObject(objectId: string): Promise<any> {
		const record = this.records.find(t => t["cmis:objectId"] === objectId);
		return Promise.resolve(record);
	}

	create(record: {}): Promise<any> {
		record["repId"] = getNewId();
		this.records.push(record);
		return Promise.resolve(record);
	}

	update(record: {}): Promise<any> {
		const recordIndex = this.records.findIndex(t => t.repId === record["repId"]);
		if (recordIndex >= 0) {
			this.records[recordIndex] = record;
		}
		return Promise.resolve(record);
	}

	upsert(record: {}, options: {}): Promise<any> {
		if (options && options["cardinality"] === "single" && this.records.length === 1) {
			record["repId"] = this.records[0].repId;
		}
		const recordIndex = this.records.findIndex(t => t.repId === record["repId"]);
		if (recordIndex >= 0) {
			return this.update(record);
		}
		return this.create(record);
	}

	async delete(record: {}): Promise<any> {
		const recordIndex = this.records.findIndex(t => t.repId === record["repId"]);
		if (recordIndex >= 0) {
			this.records.splice(recordIndex, 1);
		}
		return Promise.resolve(record);
	}

	createRelationship(): Promise<any> {
		throw new Error("Method not implemented.");
	}

	getRelationshipChildren(): Promise<any> {
		throw new Error("Method not implemented.");
	}
}
