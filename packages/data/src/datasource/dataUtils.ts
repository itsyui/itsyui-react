import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IAppSchemaProvider } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");

export async function upsertChildRecords(parentId: string, record: any, parentFormSchema: any, childFields: any[], datasource: any) {
    if (parentId && datasource && parentFormSchema) {
        return await Promise.all(childFields.map(async (t) => {
            const fieldSchema = parentFormSchema.propertyDefinitions[t];
            const metadata = fieldSchema.metadata ? fieldSchema.metadata : {};
            const { typeId, formSchemaId, idField, formSchema } = metadata;
            const childRecords = Array.isArray(record[t]) ? [...record[t]] : [];
            if (fieldSchema && childRecords.length > 0) {
                const childFormSchema = formSchemaId ? await schemaProvider.getSchema(`/app/${typeId && typeId.replace(/:/g, "_")}/form/${formSchemaId}/data`) : formSchema;
                if (childFormSchema) {
                    return await Promise.all(childRecords.map(async (r) => {
                        r[idField] = parentId;
                        await datasource.upsert(r, childFormSchema);
                    }));
                }
            }

            return true;
        }));
    }
    return null;
}
