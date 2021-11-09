
import * as React from "react";
import { IWidgetControlProps, withReducer, WidgetsFactory, retrieveSchema, getDefaultRegistry, SchemaContainer, getLocaleString } from "@itsy-ui/core";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
const schemaProvider = dataLoader.getLoader("appSchemaProvider");

const initialState = {
};

function reducer(state, action) {
	switch (action.type) {
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

class QRScanWidget extends React.Component<IWidgetControlProps, {}> {

	constructor(props) {
		super(props);
	}

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	handleQRData(_evt: any) {
		const controlProps = this.getControlSchemaProperties();
		this.props.transition({
			type: "MOBILE_ON_LOADED"
		});
		this.props.transition({
			type: "MOBILE_SCAN_QR",
			onData: (data) => {
				controlProps.handleChange(undefined, data);
			},
		});
	}

	render() {
		const controlProps = this.getControlSchemaProperties();
		const { fieldSchema } = controlProps;

		const _getUIControlSchema = {
			name: `QRScan-ui-control`,
			properties: {
				"ui:widget": "button_control",
				icon: fieldSchema.icon ? fieldSchema.icon : "center_focus_weak",
				text: getLocaleString({ ScanQR: "{{ScanQR}}" }, "ScanQR"),
				onButtonClick: this.handleQRData.bind(this),
			},
		};

		return <><SchemaContainer schema={_getUIControlSchema} />{
			controlProps.value && controlProps.value
		}</>;
	}
}

const mapDispatchToProps = (_dispatch) => {
	return {};
};

const ItsyMobileQRScan = withReducer("QRScanWidget", reducer, mapDispatchToProps)(QRScanWidget);
ItsyMobileQRScan.displayName = "QRScanWidget";

WidgetsFactory.instance.registerFactory(ItsyMobileQRScan);
WidgetsFactory.instance.registerControls({
	qrScanWidget: "QRScanWidget",
	"itsy:qrScan": "QRScanWidget"
});

export default ItsyMobileQRScan;