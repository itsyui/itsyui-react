import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory } from "@itsy-ui/core";
import * as React from "react";
import Alert from 'react-bootstrap/Alert';

const _getControlSchemaProperties = (props) => {
	const registry = getDefaultRegistry();
	const { definitions } = registry;
	const schema = retrieveSchema(props.schema, definitions);
	return schema;
}

const FormError = (props) => {
	const { errorMessage, fieldSchema, onClose } = _getControlSchemaProperties(props);

	React.useEffect(() => {
		const timer = setTimeout(() => {
			onClose();
		}, 2000)

		return () => clearTimeout(timer);
	})

	return (
		<div className="error-alert-contianer">
			<Alert
				variant={fieldSchema !== undefined && fieldSchema.variant ? fieldSchema.variant : "danger"}
				onClose={onClose}
				dismissible
			>
				<div aria-describedby="client-snackbar">
					{errorMessage}
				</div>
			</Alert>
		</div>
	);

}

FormError['displayName'] = 'formError';

WidgetsFactory.instance.registerFactory(FormError);
WidgetsFactory.instance.registerControls({
	formError: 'formError',
	"itsy:form:error": 'formError'
});
