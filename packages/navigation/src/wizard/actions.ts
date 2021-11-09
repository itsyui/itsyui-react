
export const WizardLayoutActions = {
	LoadLayoutControlSchema: "WizardLayoutActions.LoadLayoutControlSchema",
	LoadControlSchema: "WizardLayoutActions.LoadControlSchema",
	UpdateCurrentStepContentSchema: "WizardLayoutActions.UpdateCurrentStepContentSchema",
};

// export function doLoadLayoutSchema(params: {}) {
// 	return (_, dispatch, transition) => {
// 		const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
// 		const layoutRegistry = dataLoader.getLoader<ILayoutTypeRegister>("LayoutRegistry");
// 		const wizard = layoutRegistry.getComponentSchema("wizard");
// 		if (wizard !== null) {
// 			const schema = wizard.getSchema(params);
// 			dispatch(updateSchema(schema));
// 		} else {
// 			console.log('error loading layout for Process Layout Widget');
// 		}
// 	};
// }

// function updateSchema(layoutControlSchema) {
// 	return {
// 		type: WizardLayoutActions.LoadLayoutControlSchema,
// 		layoutControlSchema
// 	}
// }

function _loadControlSchema(stepControlSchema: any, typeId: string, schemaId: string, extraParams: {} = {}) {
	return {
		type: WizardLayoutActions.LoadControlSchema,
		stepControlSchema,
		typeId,
		schemaId,
		extraParams
	};
}

export function doLoadControlSchema(typeId: string, schemaId: string, extraParams: {}, data: any) {
	return async (_getState: any, dispatch: any, _transition: any) => {
		// const schemaLoaderFactory = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
		// const schemaLoader = schemaLoaderFactory.getLoader<ISchemaLoader>("wizard");
		let stepControlSchema = {};
		// stepControlSchema = await schemaLoader.getControlSchema({ typeId: typeId, schemaId: schemaId });
		stepControlSchema = data
		dispatch(_loadControlSchema(stepControlSchema, typeId, schemaId, extraParams));
	};
}
