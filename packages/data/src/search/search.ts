export interface ISearchControlSchema {
	name: string;
	properties: ISearchControlSchemaProperties;
}

export interface ISearchControlSchemaProperties {
	"ui:widget": string;
	controlID?: string;
	typeId: string;
	gridSchemaId?: string;
}