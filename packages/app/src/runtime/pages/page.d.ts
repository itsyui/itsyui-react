
export interface IPageControlSchema {
	name: string;
	properties: IPageControlSchemaProperties;
}

interface IPageControlSchemaProperties {
	"ui:widget": string;
	controlID?: string;
	pageId?: string;
	pagesPath?: string;
	basePath?: string;
	queryParams: {};
	pageSchema: IPageSchema;
}

interface IPageSchema {
	id: string;
	title: string;
	url?: string;
	isDefault?: boolean;
	orderId?: number | string;
	roles?: string[];
	queryParams?: IPageSchemaQueryParams[];
	components: IPageSchemaComponents;
	pageBinding?: IPageSchemaPageBinding;
	layout: string[],
}

interface IPageSchemaQueryParams {
	queryParamName: string;
	defaultValue?: string;
}

interface IPageSchemaComponents {
	[componentId: string]: IControlSchema;
}

interface IControlSchema {
	name: string;
	properties: IControlSchemaProperties;
}

interface IControlSchemaProperties {
	"ui:widget": string;
	controlID?: string;
	[key: string]: any;
}

interface IPageSchemaPageBinding {
	[componentId: string]: IComponentPageBindingValue;
}

interface IComponentPageBindingValue {
	[PageBindingId: string]: IPageBindingValue;
}

interface IPageBindingValue {
	name: string;
	provider: string;
	providerId?: string;
	providerTypeId?: string;
	providerSchemaId?: string;
	metadata: {}
}