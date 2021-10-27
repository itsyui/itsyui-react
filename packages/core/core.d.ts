declare module "@itsy-ui/core" {
	interface Language {
		[langId: string]: any;
	}

	interface PluginDefinition {
		name: string;
		pluginUri: string;
		widgets: string[];
		resources: {
			language: Language;
		};
	}

	interface IPluginLoader {
		getPluginDefinition(widgetName: string): Promise<PluginDefinition | null>;
	}

	interface ICustomStateMachineData {
		name?: string;
		stateJSON: any;
		mapDispatchToAction: {};
	}

	interface ICustomStateMachineProvider {
		/**
		 * Gets the custom state machine registered for the widget and filter props
		 * @param widgetName widget for which the custom state machine JSON is registered
		 * @param props filter props for which the matching state machine should return
		 */
		getCustomStateMachine(widgetName: string, props: {}): ICustomStateMachineData;

		/**
		 * Registers the stateJSON for the widget and filter props
		 * @param widgetName widget for which the custom state machine JSON is registered
		 * @param props filter props for which the matching state machine should return
		 */
		registerCustomStateMachine(widgetName: string, props: {}, stateMachineData: ICustomStateMachineData): void;

		/**
		 * Removes the state machine for the widget and filter props. Sometimes there will be two or more stateMachines registered
		 * for the same key, in that case define "name" property in the stateJSON and pass it during removeCustomStateMachine to properly
		 * identify and remove that state.
		 * @param widgetName widget for which the custom state machine JSON is registered
		 * @param props filter props for which the matching state machine should return
		 * @param stateMachineData custom stateMachineData that needs to have a "name" in stateJSON for comparing and removing the proper state.
		 */
		removeCustomStateMachine(widgetName: string, props: {}, stateMachineData?: ICustomStateMachineData): void;
	}

	export class WidgetsFactory {
		constructor();

		/**
		 * Register a factory component in a global map for dynamic loading.
		 * @param widgetFactory Register a REACT factory class
		 */
		registerFactory(widgetFactory: any): void;

		/**
		 * Register control map for consuming in JSON.
		 * @param controlsMap register a list of key/value pairs of control mapping
		 */
		registerControls(controlsMap: { [x: string]: any }): void;

		/**
		 * Register a service object that can be used anywhere with global access. Example: IPluginLoader is 
		 * implemented this way.
		 * @param service JavaScript object that can be used from the global WidgetsFactory
		 */
		registerService(service: { [x: string]: any }): void;

		services: any;

		static instance: WidgetsFactory;
	}

	interface IEventArgs {
		type: string;
	}

	interface IWidgetControlProps {
		transition: <P extends IEventArgs>(event: P) => void;
		getTransitionState: () => any;
		schema: any;
	}

	export function loadPlugin(pluginUri: string): Promise<{}>;

	export const extend: any;

	export const withReducer: any;

	export const getDefaultRegistry: any;

	export const retrieveSchema: any;

	export const StateManagerContext: any;

	export const LayoutManagerWidget: any;

	export const objectEntries: any;

	export const chunkArray: any;

	export const eventTransition: any;

	export const arrayToObjectMap: any;

	// export const System: any;

	export function getLocaleString(data: {}, key: string): string;

	export function useTransition(controlKey: string, reducer: any, mapDispatchToProps: any, stateJSON: any);

	// tslint:disable-next-line:max-classes-per-file
	export class SchemaContainer extends React.Component<any, any> {
	}

	interface ISchemaLoader {
		getControlSchema(properties: any): Promise<any>
	}

	/**
	 * Config data that encapsulates application level config, such as CMIS REPO URL etc.,
	 */
	interface IConfigData {
		CmisURL: string;
	}

	interface IConfigLoader {
		getConfig(): Promise<IConfigData>
	}

	interface IAuthResult {
		isAuthenticated: boolean;
		data: any;
	}

	interface IAuthService {
		/**
		 * Authentication API implementation, implement different ways of authorizers for the client app.
		 * @param username username for authentication
		 * @param password password for authentication
		 */
		authenticate(username: string, password: string, authObject?: any): Promise<IAuthResult>;
		logout();
	}

	interface IDataSourceLake {
		getObject(typeId: string, objectId: string, parameters?: {}): Promise<any>;
		getAll(typeId: string, parameters: {}): Promise<any[]>;
		create(record: {}, options: {}): Promise<any>;
		update(record: {}, options: {}): Promise<any>;
		upsert(record: {}, options: {}): Promise<any>;
		delete(record: {}): Promise<any>;
		createRelationship(record: {}): Promise<any>;
		getRelationshipChildren(typeId: string): Promise<any>;
	}

	interface IMetadataSourceLake {
		getType(typeId: string): Promise<any>;
		getAll(): Promise<any[]>;
		create(typeDef: {}): Promise<any>;
		update(typeDef: {}): Promise<any>;
		delete(typeDef: {}): Promise<any>;
	}

	interface ResourceDefinition {
		name: string;
		pluginUri: string;
	}

	interface IResourceLoader {
		loadResource(name: string, baseURL?: string): Promise<boolean>;
		getResources(): Promise<ResourceDefinition[]>;
	}

	interface ILayoutTypeRegister {
		registerComponentSchema(componentType: string, layoutType: ILayoutType);
		getComponentSchema(componentType: string): ILayoutType | null;
		getAllComponents(): ILayoutType[];
	}

	interface ILocaleLoader {
		getlocale(): string;
		registerLocale(language: string);
	}

	interface ILayoutType {
		getName(): string;
		getSchema(params: {}): any;
	}

	export class DataLoaderFactory {
		/**
		 * Get the Loader for the given name.
		 * @param name Loader instance for the name registered of type <T>
		 */
		getLoader<T>(name: string): T;

		/**
		 * Register a loader object that can be used anywhere with global access. Example: IschemaLoaderFactory is 
		 * implemented this way.
		 * @param loader JavaScript object that can be used from the global DataLoaderFactory
		 */
		registerLoader<T>(loader: { [x: string]: T }): void;
	}

	interface IAppSchemaProvider {
		putSchema(key: string, jsonData: any): void;
		getSchema(key: string): any;
		appendSchema(propertyPath: string, jsonData: any): void;
		getSchemaSync(key: string): any;
		appendSchemaSync(propertyPath: string, jsonData: any): void;
	}

	interface ICommand<TData> extends CommandFunction<TData> {
		canExecute?: (data?: TData, transition?: (t: any) => void) => boolean;
		execute: (data?: TData, transition?: (t: any) => void) => Promise<void>;
	}

	interface CommandFunction<TData> extends Function {
		(data?: TData, transition?: (t: any) => void): Promise<void>;
	}

	interface CommandOptions<TData> {
		canExecute?: (data?: TData, transition?: (t: any) => void) => boolean;
		execute: (data?: TData, transition?: (t: any) => void) => Promise<void>;
	}

	interface ICommandManager {
		getCommand<TData>(commandName: string, context: {}): ICommand<TData>;

		registerCommand<TData>(commandName: string, context: {}, options: CommandFunction<TData> | CommandOptions<TData>): void;
	}

	interface ILocaleMessageProvider {
		setLocaleData(messageData: {}): void;
		getLocaleData(currentObj: {}, key: string): string;
	}

	interface IPageBindProvider {
		putSchema(key: string, featureName: string, jsonData: any): void;
		getSchema(key: string, featureName: string): any;
	}

}
