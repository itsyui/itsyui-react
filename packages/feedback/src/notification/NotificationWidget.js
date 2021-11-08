import { getDefaultRegistry, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { doDisableNotification, doShowNotification, onhandleAction } from "./actions";
import reducer from "./reducer";
import stateJSON from "./state.json";

class NotificationPopup extends React.Component {

	componentWillMount() {
		if (this.props.transition && this.props.schema) {
			const { message, metadata, action } = this._getControlSchemaProperties();
			if (message) {
				const event = {
					message: message,
					metadata: !metadata ? {} : metadata,
					action: !action ? {} : action
				};
				this.props.onShowNotification(event);
			}
		}
	}

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	onClose() {
		this.props.onDisableNotification();
	}

	handleAction(name) {
		this.props.handleAction(name);
	}

	getPopupSchema = () => {
		const { action, message, visibility, metadata } = this.props;
		if (visibility) {
			const notificationPopupSchema = {
				name: "notification_popup",
				properties: {
					"ui:widget": "notification_popup_ui",
					action, message,
					visibility, metadata,
					onClose: this.onClose.bind(this),
					handleAction: this.handleAction.bind(this),
					className: this.props.className,
					style: this.props.style
				},
			};
			return <SchemaContainer key="notification_control_UI" schema={notificationPopupSchema} />;
		} else return null;
	}
	render() {
		return this.getPopupSchema();
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onShowNotification: (event) => dispatch(doShowNotification(event)),
		onDisableNotification: () => dispatch(doDisableNotification()),
		handleAction: (commandName) => dispatch(onhandleAction(commandName))
	};
};

const ItsyNotification = withReducer('NotificationPopup', reducer, mapDispatchToProps, stateJSON)(NotificationPopup);
ItsyNotification.displayName = 'NotificationPopup';

WidgetsFactory.instance.registerFactory(ItsyNotification);
WidgetsFactory.instance.registerControls({
	notification_popup: 'NotificationPopup',
	'itsy:notification': 'NotificationPopup'
});

export default ItsyNotification;