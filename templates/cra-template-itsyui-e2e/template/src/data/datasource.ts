import { WidgetsFactory, DataLoaderFactory, IDataSourceLake } from "@itsy-ui/core";

const data = require("./data.json");

/**
 * Implements the IDataSourceLake interface and exposes all functions that is used by a databound ItsyUI widget.
 */
class DataSource implements IDataSourceLake {

    /**
     * Return the array of records based on the "type"
     * @param type - typically the table or model name
     * @param params - additional parameters that is required by the UI widget
     * @returns 
     */
    async getAll(type: string, params: any) {
        try {
            let records = data;
            if (params.pageCount && params.skipCount) {
                records = data.slice((params.pageCount - 1) * params.skipCount, params.pageCount * params.skipCount);
            }
            records["totalRecordsCount"] = records.length;
            return records;
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Create function to add a record to local array.
     * @param record - Entity objct to create
     * @param params - Params for create API
     * @returns record
     */
    create(record: any, params: any): Promise<any> {
        record["id"] = data[data.length - 1].id + 1;
        data.push(record);
        return record;
    }

    /**
     * Updates an existing record
     * @param record - Entity object to update
     * @param params - Params for update API
     * @returns record
     */
    update(record: any, params: any): Promise<any> {
        const index = data.findIndex((d: any) => d.id === record.id);
        if (index >= 0) {
            data[index] = [...record];
            return record;
        }
        const message: any = {
            "message": "Unable to find the element."
        };

        return message;
    }

    /**
     * Not implemented
     */
    upsert(record: any, params: any): Promise<any> {
        throw new Error("Method not implemented.");
    }

    /**
     * Delete a record
     * @param record - Entity to delete
     * @returns record
     */
    delete(record: any): Promise<any> {
        const index = data.findIndex((d: any) => d.id === record.id);
        return data.splice(index, 1);
    }

    /**
     * Returns the object based on its ID
     * @param type - typically the table or model name
     * @param recordId - the id of the record
     * @param params - extra parameters
     * @returns record
     */
    getObject(type: string, recordId: any, params: any) {
        const item = data.find((d: any) => d.id === parseInt(recordId));
        return item;
    }

    /**
     * Not implemented
     */
    createRelationship(_): Promise<any> {
        throw new Error("Method not implemented.");
    }

    /**
     * Not implemented
     */
    getRelationshipChildren(_): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

// retrieve the DataLoaderFactory singleton
const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
// register the datasource
dataLoader.registerLoader({
    datasource: new DataSource(),
});
